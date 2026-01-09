from rest_framework.viewsets import ViewSet
from rest_framework import viewsets

from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import PermissionDenied

from rest_framework.decorators import action, api_view, permission_classes

from .models import Hub, HubMembership, Message
from .serializers import HubDetailSerializer, HubSerializer, HubMembershipSerializer, MessageSerializer
from django.utils import timezone


from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class DashboardViewSet(ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        if request.user.is_superuser:
            return Response({"role": "superuser"})
        return Response({"role": "user"})



class HubViewSet(viewsets.ModelViewSet):
    queryset = Hub.objects.all()
    serializer_class = HubSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
    
    def get_serializer_class(self):
        if self.action == "retrieve":
            return HubDetailSerializer
        return HubSerializer


    def perform_create(self, serializer):
        # Only superuser can create hubs
        if not self.request.user.is_superuser:
            return Response({"error": "Only superusers can create hubs"}, status=403)
        serializer.save(admin=self.request.user)

    @action(detail=True, methods=["post"])
    def request_join(self, request, pk=None):
        hub = self.get_object()
        membership, created = HubMembership.objects.get_or_create(
            hub=hub,
            user=request.user
        )
        if not created:
            return Response({"message": "Already requested or member"}, status=400)
        return Response({"message": "Join request sent"}, status=201)
    
    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def pending_requests(self, request, pk=None):
        hub = self.get_object()

        # only admin can see requests
        if hub.admin != request.user:
            return Response({"error": "Not allowed"}, status=403)

        memberships = HubMembership.objects.filter(
            hub=hub,
            is_approved=False
        )

        serializer = HubMembershipSerializer(memberships, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def approve_member(self, request, pk=None):
        hub = self.get_object()
        if hub.admin != request.user:
            return Response({"error": "Only admin can approve"}, status=403)

        user_id = request.data.get("user_id")
        try:
            membership = HubMembership.objects.get(hub=hub, user_id=user_id)
        except HubMembership.DoesNotExist:
            return Response({"error": "Membership request not found"}, status=404)

        membership.is_approved = True
        membership.approved_at = timezone.now()
        membership.save()
        return Response({"message": "User approved"}, status=200)

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        hub_id = self.request.query_params.get("hub")
        return Message.objects.filter(hub_id=hub_id).order_by("timestamp")

    def perform_create(self, serializer):
        hub_id = self.request.data.get("hub")
        hub = Hub.objects.get(id=hub_id)

        membership = HubMembership.objects.filter(
            hub=hub, user=self.request.user, is_approved=True
        ).first()
        if not membership:
            raise PermissionDenied("You are not a member of this hub")

        message = serializer.save(sender=self.request.user, hub=hub)

        # 🔥 BROADCAST TO WEBSOCKET
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"hub_{hub_id}",
            {
                "type": "chat.message",
                "message": MessageSerializer(
                    message,
                    context={"request": self.request}
                ).data,
            }
        )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response({
        "id": request.user.id,
        "username": request.user.username,
        "is_superuser": request.user.is_superuser,
    })