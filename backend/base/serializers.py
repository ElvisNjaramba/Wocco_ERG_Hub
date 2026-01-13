from rest_framework import serializers
from .models import Hub, HubMembership, Message, Event

class HubSerializer(serializers.ModelSerializer):
    admin = serializers.StringRelatedField(read_only=True)
    membership_status = serializers.SerializerMethodField()

    class Meta:
        model = Hub
        fields = ["id", "name", "description", "admin", "membership_status"]

    def get_membership_status(self, obj):
        user = self.context["request"].user
        if not user.is_authenticated:
            return None

        membership = HubMembership.objects.filter(
            hub=obj,
            user=user
        ).first()

        if not membership:
            return None

        if membership.is_approved:
            return "approved"

        return "pending"

class HubDetailSerializer(serializers.ModelSerializer):
    admin = serializers.StringRelatedField()
    admin_id = serializers.IntegerField(source="admin.id", read_only=True)
    members = serializers.SerializerMethodField()

    class Meta:
        model = Hub
        fields = ["id", "name", "description", "admin", "admin_id", "members"]

    def get_members(self, obj):
        memberships = HubMembership.objects.filter(
            hub=obj,
            is_approved=True
        ).select_related("user")
        return [m.user.username for m in memberships]


class HubMembershipSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = HubMembership
        fields = [
            "id",
            "user_id",
            "username",
            "is_approved",
            "requested_at",
        ]


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField(read_only=True)
    media = serializers.FileField(required=False, allow_null=True)
    media_url = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            "id",
            "sender",
            "content",
            "media",
            "media_url",
            "parent_id",
            "timestamp",
        ]

    def get_media_url(self, obj):
        request = self.context.get("request")
        if obj.media and request:
            return request.build_absolute_uri(obj.media.url)
        return None

    def get_replies(self, obj):
        return MessageSerializer(
            obj.replies.all(),
            many=True,
            context=self.context
        ).data

class EventSerializer(serializers.ModelSerializer):
    attendees_count = serializers.SerializerMethodField()
    user_attending = serializers.SerializerMethodField()
    attendees = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "hub",
            "title",
            "description",
            "location",
            "start_time",
            "end_time",
            "attendees_count",
            "user_attending",
            "attendees",
            "created_by",
        ]
        read_only_fields = [
            "hub",
            "created_by",
            "attendees_count",
            "user_attending",
            "attendees",
        ]
    location = serializers.CharField(
        required=False,
        allow_blank=True
    )

    def get_attendees_count(self, obj):
        return obj.attendances.filter(attending=True).count()

    def get_user_attending(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return False
        return obj.attendances.filter(
            user=request.user,
            attending=True
        ).exists()
    
    def get_attendees(self, obj):
        return [
            {
                "id": a.user.id,
                "name": a.user.get_full_name() or a.user.username,
            }
            for a in obj.attendances.filter(attending=True)[:5]
        ]


class EventDetailSerializer(EventSerializer):
    attendees = serializers.SerializerMethodField()

    class Meta(EventSerializer.Meta):
        fields = EventSerializer.Meta.fields + ["attendees"]

    def get_attendees(self, obj):
        return [
            att.user.username
            for att in obj.attendances.filter(attending=True)
        ]

