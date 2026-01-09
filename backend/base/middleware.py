from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()


@database_sync_to_async
def get_user(user_id):
    return User.objects.get(id=user_id)


class JWTAuthMiddleware:
    """
    Custom JWT auth middleware for Django Channels
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        params = parse_qs(query_string)

        token = params.get("token")

        if token:
            try:
                access = AccessToken(token[0])
                scope["user"] = await get_user(access["user_id"])
            except Exception:
                scope["user"] = None
        else:
            scope["user"] = None

        return await self.app(scope, receive, send)
