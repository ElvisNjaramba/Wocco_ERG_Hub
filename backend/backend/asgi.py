# import os

# from django.core.asgi import get_asgi_application

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# application = get_asgi_application()


import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import base.routing  # your app routing for WebSockets

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

# Standard Django ASGI application (HTTP)
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,  # keep standard HTTP requests working
    "websocket": AuthMiddlewareStack(
        URLRouter(
            base.routing.websocket_urlpatterns  # WebSocket routes for hubs
        )
    ),
})
