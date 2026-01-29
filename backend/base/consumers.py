from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json
from django.core.exceptions import PermissionDenied
from .models import HubMembership, Message
from asgiref.sync import sync_to_async
import redis.asyncio as redis


# ONLINE_USERS = {}
REDIS_URL = "redis://localhost:6379"
class HubChatConsumer(AsyncWebsocketConsumer):
    def user_payload(self):
        return {
            "id": self.user.id,
            "username": self.user.username,
        }

    # async def connect(self):
    #     self.hub_id = self.scope["url_route"]["kwargs"]["hub_id"]
    #     self.user = self.scope["user"]

    #     if not self.user or self.user.is_anonymous or not self.user.username:
    #         await self.close()
    #         return

    #     is_member = await self.is_approved_member()
    #     if not is_member:
    #         await self.close()
    #         return

    #     self.room_group_name = f"hub_{self.hub_id}"
    #     await self.channel_layer.group_add(self.room_group_name, self.channel_name)
    #     await self.accept()

    #     # Add to global online users set
    #     ONLINE_USERS.setdefault(self.hub_id, set()).add(self.user.username)

    #     # Send current online users to this client
    #     await self.send(text_data=json.dumps({
    #         "type": "online_users",
    #         "users": [{"username": u} for u in ONLINE_USERS[self.hub_id]]
    #     }))

    #     # Broadcast online presence to others
    #     await self.channel_layer.group_send(
    #         self.room_group_name,
    #         {
    #             "type": "presence_event",
    #             "action": "online",
    #             "user": self.user_payload(),
    #         }
    #     )

    # async def disconnect(self, close_code):
    #     if hasattr(self, "room_group_name"):
    #         await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    #         # Remove from global set
    #         if self.hub_id in ONLINE_USERS:
    #             ONLINE_USERS[self.hub_id].discard(self.user.username)
            
    #         # Broadcast offline
    #         await self.channel_layer.group_send(
    #             self.room_group_name,
    #             {
    #                 "type": "presence_event",
    #                 "action": "offline",
    #                 "user": self.user_payload(),
    #             }
    #         )

    async def connect(self):
        self.hub_id = self.scope["url_route"]["kwargs"]["hub_id"]
        self.user = self.scope["user"]

        if not self.user or self.user.is_anonymous or not self.user.username:
            await self.close()
            return

        is_member = await self.is_approved_member()
        if not is_member:
            await self.close()
            return

        self.room_group_name = f"hub_{self.hub_id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Connect to Redis
        self.redis = await redis.from_url(REDIS_URL, decode_responses=True)
        self.redis_key = f"hub:{self.hub_id}:online_users"

        # Add user to Redis set
        await self.redis.sadd(self.redis_key, self.user.username)

        # Fetch current online users and send to this client
        online_users = await self.redis.smembers(self.redis_key)
        await self.send(text_data=json.dumps({
            "type": "online_users",
            "users": [{"username": u} for u in online_users]
        }))

        # Broadcast online presence to the group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "presence_event",
                "action": "online",
                "user": self.user_payload(),
            }
        )

    async def disconnect(self, close_code):
        # Remove from group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        # Remove user from Redis set
        await self.redis.srem(self.redis_key, self.user.username)

        # Broadcast offline
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "presence_event",
                "action": "offline",
                "user": self.user_payload(),
            }
        )

    async def presence_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "presence",
            "action": event["action"],
            "user": event["user"],
        }))


    async def receive(self, text_data):
        data = json.loads(text_data)

        # ✍️ typing indicator (ephemeral)
        if data.get("type") == "typing":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "typing_indicator",
                    "user": self.user.username,
                    "is_typing": data.get("is_typing", False),
                }
            )
            return

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

    async def typing_indicator(self, event):
        await self.send(text_data=json.dumps({
            "type": "typing",
            "user": event["user"],
            "is_typing": event["is_typing"],
        }))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": event["message"]
        }))

    async def event_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "event_update",
            "event": event["event"]
        }))

    async def event_notification(self, event):
        await self.send(text_data=json.dumps({
            "type": "event_notification",
            "event": event["event"]
        }))


    @database_sync_to_async
    def is_approved_member(self):
        from .models import Hub  # import inside method if circular
        hub = Hub.objects.get(id=self.hub_id)
        return self.user == hub.admin or HubMembership.objects.filter(
            hub_id=self.hub_id,
            user=self.user,
            is_approved=True
        ).exists()

    @database_sync_to_async
    def save_message(self, content, parent_id=None):
        if parent_id in ("undefined", "", None):
            parent_id = None

        return Message.objects.create(
            hub_id=self.hub_id,
            sender=self.user,
            content=content,
            parent_id=parent_id,
        )

