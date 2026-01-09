from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async

from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Hub, Message

from .serializers import MessageSerializer


class HubChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.hub_id = self.scope["url_route"]["kwargs"]["hub_id"]
        self.room_group_name = f"hub_{self.hub_id}"

        # 🔑 Extract token
        query = parse_qs(self.scope["query_string"].decode())
        token = query.get("token", [None])[0]

        if not token:
            await self.close()
            return

        # 🔑 Authenticate user manually
        jwt_auth = JWTAuthentication()
        try:
            validated = jwt_auth.get_validated_token(token)
            self.user = jwt_auth.get_user(validated)
        except Exception:
            await self.close()
            return

        if not self.user or self.user.is_anonymous:
            await self.close()
            return

        self.scope["user"] = self.user

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive_json(self, content):
        text = content.get("content", "").strip()
        parent_id = content.get("parent")

        if not text:
            return

        message = await self.create_message(text, parent_id)
        serialized = MessageSerializer(
            message,
            context={"request": None}  # 👈 add context
        ).data


        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat.message",
                "message": serialized,
            }
        )

    async def chat_message(self, event):
        await self.send_json({
            "type": "chat_message",
            "message": event["message"]
        })

    @database_sync_to_async
    def create_message(self, text, parent_id):
        hub = Hub.objects.get(id=self.hub_id)
        parent = Message.objects.filter(id=parent_id).first()

        return Message.objects.create(
            hub=hub,
            sender=self.user,
            content=text,
            parent=parent,
        )
