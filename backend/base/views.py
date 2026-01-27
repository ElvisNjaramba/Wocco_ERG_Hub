from django.shortcuts import get_object_or_404
from rest_framework.viewsets import ViewSet
from rest_framework import viewsets

from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.core.exceptions import PermissionDenied

from rest_framework.decorators import action, api_view, permission_classes

from .models import Hub, HubMembership, Message, Event, EventAttendance, MessageHighlight
from .serializers import EventDetailSerializer, EventSerializer, HubDetailSerializer, HubSerializer, HubMembershipSerializer, MessageSerializer
from django.utils import timezone

from rest_framework.parsers import MultiPartParser, FormParser
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .permissions import is_approved_member

from rest_framework import serializers

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


    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def upcoming_events(self, request, pk=None):
        hub = self.get_object()
        now = timezone.now()
        events = hub.events.filter(start_time__gte=now).order_by("start_time")[:5]
        serializer = EventSerializer(events, many=True, context={"request": request})
        return Response(serializer.data)
    
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def my_events(self, request):
        user = request.user

        if user.is_superuser:
            hubs = Hub.objects.all()
        else:
            hubs = Hub.objects.filter(
                hubmembership__user=user,
                hubmembership__is_approved=True
            )

        data = []
        now = timezone.now()

        for hub in hubs:
            events = hub.events.filter(start_time__gte=now).order_by("start_time")[:5]
            if events.exists():
                data.append({
                    "hub_id": hub.id,
                    "hub_name": hub.name,
                    "events": EventSerializer(
                        events,
                        many=True,
                        context={"request": request}
                    ).data
                })

        return Response(data)
    
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def gallery_hubs(self, request):
        user = request.user

        if user.is_superuser:
            hubs = Hub.objects.all()
        else:
            hubs = Hub.objects.filter(
                hubmembership__user=user,
                hubmembership__is_approved=True
            )

        serializer = HubSerializer(hubs, many=True, context={"request": request})
        return Response(serializer.data)

    def perform_create(self, serializer):
        hub = serializer.save(admin=self.request.user)

        # ✅ Always ensure admin is an approved member
        HubMembership.objects.update_or_create(
            hub=hub,
            user=self.request.user,
            defaults={
                "is_approved": True,
                "approved_at": timezone.now(),
            },
        )


    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def members(self, request, pk=None):
        hub = self.get_object()

        if hub.admin != request.user:
            return Response({"error": "Not allowed"}, status=403)

        memberships = HubMembership.objects.filter(hub=hub).select_related("user")

        return Response([
            {
                "user_id": m.user.id,
                "username": m.user.username,
                "status": "approved" if m.is_approved else "pending",
                "requested_at": m.requested_at,
                "approved_at": m.approved_at,
                "last_seen": m.user.last_login,
            }
            for m in memberships
        ])




    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def ban_member(self, request, pk=None):
        hub = self.get_object()

        if hub.admin != request.user:
            return Response({"error": "Not allowed"}, status=403)

        user_id = request.data.get("user_id")

        if user_id == request.user.id:
            return Response({"error": "Admin cannot ban themselves"}, status=400)

        HubMembership.objects.filter(
            hub=hub,
            user_id=user_id
        ).delete()

        return Response({"message": "Member banned"})
    
    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def ban_history(self, request, pk=None):
        hub = self.get_object()

        if hub.admin != request.user:
            return Response({"error": "Not allowed"}, status=403)

        # Assuming you create a model BanHistory(user, hub, banned_by, banned_at)
        from .models import BanHistory
        history = BanHistory.objects.filter(hub=hub).order_by("-banned_at")
        return Response([
            {
                "user_id": b.user.id,
                "username": b.user.username,
                "banned_at": b.banned_at,
                "banned_by": b.banned_by.username
            } for b in history
        ])



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

        if hub.admin != request.user:
            return Response({"error": "Not allowed"}, status=403)

        memberships = HubMembership.objects.filter(hub=hub, is_approved=False).select_related("user")

        return Response([
            {
                "user_id": m.user.id,
                "username": m.user.username,
                "status": "pending",
                "approved_at": None,
                "last_seen": m.user.last_login,
            }
            for m in memberships
        ])


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
    
    @action(detail=True, methods=["patch"], permission_classes=[IsAuthenticated])
    def update_hub(self, request, pk=None):
        hub = self.get_object()

        if hub.admin != request.user:
            return Response({"error": "Not allowed"}, status=403)

        serializer = HubDetailSerializer(hub, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=False, methods=["post"], permission_classes=[IsAdminUser])
    def create_hub(self, request):
        serializer = HubSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            hub = serializer.save(admin=request.user)

            # Auto-add admin as approved member
            HubMembership.objects.get_or_create(
                hub=hub,
                user=request.user,
                defaults={
                    "is_approved": True,
                    "approved_at": timezone.now(),
                },
            )

            # Reload serializer to include membership_status
            serializer = HubSerializer(hub, context={"request": request})

            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)
    
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated], parser_classes=[MultiPartParser, FormParser])
    def create_event(self, request, pk=None):
        hub = self.get_object()

        if hub.admin != request.user:
            return Response({"error": "Only hub admin can create events"}, status=403)

        serializer = EventSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save(hub=hub, created_by=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)



class MessageViewSet(viewsets.ModelViewSet):
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        hub_id = self.request.query_params.get("hub")
        return Message.objects.filter(
            hub_id=hub_id
        ).select_related("sender", "parent").order_by("timestamp")

    def perform_create(self, serializer):
        hub_id = self.request.data.get("hub")
        hub = get_object_or_404(Hub, id=hub_id)
        user = self.request.user

        # ✅ ADMIN IS ALWAYS ALLOWED
        if hub.admin != user:
            is_member = HubMembership.objects.filter(
                hub=hub,
                user=user,
                is_approved=True
            ).exists()

            if not is_member:
                raise PermissionDenied("Not a hub member")

        parent_id = self.request.data.get("parent")
        parent = None

        if parent_id and parent_id != "undefined":
            try:
                parent_id = int(parent_id)
                parent = Message.objects.filter(
                    id=parent_id,
                    hub=hub
                ).first()

                if not parent:
                    raise serializers.ValidationError("Invalid parent message")
            except ValueError:
                raise serializers.ValidationError("Parent must be a number")

        message = serializer.save(
            sender=user,
            hub=hub,
            parent=parent,
        )

        # 🔥 broadcast
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"hub_{hub_id}",
            {
                "type": "chat_message",
                "message": MessageSerializer(
                    message, context={"request": self.request}
                ).data,
            },
        )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response({
        "id": request.user.id,
        "username": request.user.username,
        "is_superuser": request.user.is_superuser,
    })

class EventViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        hub_id = self.request.query_params.get("hub")
        qs = Event.objects.all()

        if hub_id:
            qs = qs.filter(hub_id=hub_id)

        return qs.order_by("start_time")

    def get_serializer_class(self):
        if self.action == "retrieve":
            return EventDetailSerializer
        return EventSerializer

    def perform_create(self, serializer):
        hub_id = self.request.query_params.get("hub")
        hub = get_object_or_404(Hub, id=hub_id)

        if not hub_id:
            raise serializers.ValidationError({"hub": "Hub is required"})

        if hub.admin != self.request.user:
            raise PermissionDenied("Only hub admin can create events")

        serializer.save(hub=hub, created_by=self.request.user)


    @action(detail=True, methods=["post"])
    def attend(self, request, pk=None):
        event = self.get_object()

        if not is_approved_member(request.user, event.hub):
            raise PermissionDenied("Not a hub member")

        attendance, created = EventAttendance.objects.get_or_create(
            event=event,
            user=request.user,
            defaults={"attending": True},
        )

        if not created and attendance.attending:
            # already attending → do nothing
            return Response({
                "attending": True,
                "attendees_count": event.attendances.filter(attending=True).count()
            })

        attendance.attending = True
        attendance.save()

        # 🔥 broadcast AFTER DB commit
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"hub_{event.hub_id}",
            {
                "type": "event_update",
                "event": {
                    "event_id": event.id,
                    "action": "attending",
                },
            }
        )

        return Response({
            "attending": True,
            "attendees_count": event.attendances.filter(attending=True).count()
        })


    @action(detail=True, methods=["post"])
    def unattend(self, request, pk=None):
        event = self.get_object()

        EventAttendance.objects.filter(
            event=event,
            user=request.user
        ).update(attending=False)

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"hub_{event.hub_id}",
            {
                "type": "event_update",
                "event": {
                    "event_id": event.id,
                    "action": "not_attending",
                },
            }
        )

        return Response({
            "attending": False,
            "attendees_count": event.attendances.filter(attending=True).count()
        })
    
    @action(detail=True, methods=["patch"], permission_classes=[IsAuthenticated])
    def update_event(self, request, pk=None):
        event = self.get_object()

        if event.hub.admin != request.user:
            return Response({"error": "Not allowed"}, status=403)

        serializer = EventSerializer(event, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def upcoming(self, request):
        now = timezone.now()

        # 🔥 Superuser sees EVERYTHING
        if request.user.is_superuser:
            events = Event.objects.filter(
                start_time__gte=now
            ).select_related("hub").order_by("start_time")

        # 👤 Regular users: only approved hubs
        else:
            events = Event.objects.filter(
                start_time__gte=now,
                hub__hubmembership__user=request.user,
                hub__hubmembership__is_approved=True,
            ).select_related("hub").order_by("start_time")

        serializer = EventSerializer(
            events,
            many=True,
            context={"request": request}
        )
        return Response(serializer.data)

from django.contrib.auth.models import User
@api_view(["GET"])
@permission_classes([IsAdminUser])  # Only superusers can select admins
def list_users(request):
    users = User.objects.all()
    data = [{"id": u.id, "username": u.username, "email": u.email} for u in users]
    return Response(data)



class MessageHighlightViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["post"])
    def highlight(self, request):
        """
        Highlight a parent message.
        """
        message_id = request.data.get("message_id")
        if not message_id:
            return Response({"error": "message_id is required"}, status=400)

        try:
            message = Message.objects.get(id=message_id)
        except Message.DoesNotExist:
            return Response({"error": "Message not found"}, status=404)

        # Create highlight (idempotent)
        MessageHighlight.objects.get_or_create(user=request.user, message=message)

        return Response({"message": "Highlighted"}, status=201)

    
    def list(self, request):
        """
        List all highlighted message IDs for the user.
        """
        highlights = MessageHighlight.objects.filter(user=request.user)
        message_ids = highlights.values_list("message_id", flat=True)
        return Response(list(message_ids))
    


@api_view(['GET'])
def superusers_list(request):
    users = User.objects.filter(is_superuser=True)
    data = [
        {
            "username": u.username,
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "password": None  # or handle temporary password if you store it
        }
        for u in users
    ]
    return Response(data)