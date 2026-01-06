from rest_framework import serializers
from .models import Hub, HubMembership, Message

class HubSerializer(serializers.ModelSerializer):
    admin = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Hub
        fields = ["id", "name", "description", "admin", "created_at"]

class HubMembershipSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    hub = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = HubMembership
        fields = ["id", "user", "hub", "is_approved", "requested_at", "approved_at"]

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "hub", "sender", "content", "media", "audio", "timestamp"]
