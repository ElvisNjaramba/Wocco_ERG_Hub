from rest_framework import serializers
from .models import Hub, HubMembership, Message

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
    members = serializers.SerializerMethodField()

    class Meta:
        model = Hub
        fields = ["id", "name", "description", "admin", "members"]

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


