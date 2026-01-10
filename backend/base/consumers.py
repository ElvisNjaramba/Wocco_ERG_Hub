from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json
from django.core.exceptions import PermissionDenied
from .models import HubMembership, Message


class HubChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.hub_id = self.scope["url_route"]["kwargs"]["hub_id"]
        self.user = self.scope["user"]

        if not self.user or self.user.is_anonymous:
            await self.close()
            return

        is_member = await self.is_approved_member()
        if not is_member:
            await self.close()
            return

        self.room_group_name = f"hub_{self.hub_id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)


    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            content = data.get("content")
            parent_id = data.get("parent")

            if not content:
                return

            msg = await self.save_message(content, parent_id)

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": {
                        "id": msg.id,
                        "sender": msg.sender.username,
                        "content": msg.content,
                        "parent_id": msg.parent_id,
                        "timestamp": msg.timestamp.isoformat(),
                    },
                }
            )
        except Exception as e:
            print("🔥 WS ERROR:", e)


    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": event["message"]
        }))

    @database_sync_to_async
    def is_approved_member(self):
        return HubMembership.objects.filter(
            hub_id=self.hub_id,
            user=self.user,
            is_approved=True
        ).exists()

    @database_sync_to_async
    def save_message(self, content, parent_id=None):
        return Message.objects.create(
            hub_id=self.hub_id,
            sender=self.user,
            content=content,
            parent_id=parent_id,
        )

