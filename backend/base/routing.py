from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path("ws/hub/<int:hub_id>/", consumers.HubConsumer.as_asgi()),
]
