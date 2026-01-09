# routing.py
from django.urls import path
from .consumers import HubChatConsumer

websocket_urlpatterns = [
    path("ws/hub/<int:hub_id>/", HubChatConsumer.as_asgi()),
]
