from channels.generic.websocket import AsyncWebsocketConsumer
import json

class HubConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.hub_id = self.scope['url_route']['kwargs']['hub_id']
        self.room_group_name = f"hub_{self.hub_id}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "chat_message", "message": data["message"], "user": data["user"]}
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))
