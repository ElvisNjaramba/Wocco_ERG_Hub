from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Hub, HubMembership, Message
from .serializers import HubSerializer, HubMembershipSerializer, MessageSerializer
from django.utils import timezone

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
            return Response({"error": "You are not a member of this hub"}, status=403)

        serializer.save(sender=self.request.user, hub=hub)
