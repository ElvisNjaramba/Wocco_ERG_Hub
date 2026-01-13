import pandas as pd
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from .serializers import ChangePasswordSerializer, ProfileSerializer, SuperUserRegisterSerializer, CreateUserSerializer
from .permissions import IsSuperUser
from django.utils.crypto import get_random_string
from rest_framework.exceptions import PermissionDenied


class AuthViewSet(viewsets.ViewSet):
    authentication_classes = []  # 🔥 DISABLE JWT HERE
    permission_classes = [AllowAny]

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        authentication_classes=[],
        url_path="register"
    )
    def register_superuser(self, request):
        serializer = SuperUserRegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        result = serializer.save()

        return Response(
            {
                "message": "Superuser created successfully",
                "username": result["username"],
                "password": result["password"],
                "email": result["user"].email,
            },
            status=201
        )

class SuperUserDashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsSuperUser]

    @action(detail=False, methods=["post"], url_path="create")
    def create_user(self, request):
        serializer = CreateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        return Response({
            "username": result["username"],
            "password": result["password"]
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="upload")
    def upload_excel(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file uploaded"}, status=400)

        df = pd.read_excel(file)
        created = []

        for _, row in df.iterrows():
            serializer = CreateUserSerializer(data=row)
            if serializer.is_valid():
                result = serializer.save()
                created.append({
                    "username": result["username"],
                    "email": row["email"]
                })

        return Response(created, status=201)

    # ✅ USERS TABLE
    @action(detail=False, methods=["get"], url_path="all-users")
    def all_users(self, request):
        users = User.objects.all().order_by("-date_joined")
        return Response([
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "is_superuser": u.is_superuser,
                "date_joined": u.date_joined,
            }
            for u in users
        ])

    # ✅ HUBS TABLE
    @action(detail=False, methods=["get"], url_path="hubs")
    def hubs(self, request):
        from base.models import Hub
        return Response([
            {
                "id": h.id,
                "name": h.name,
                "admin": h.admin.username,
                "created_at": h.created_at,
            }
            for h in Hub.objects.select_related("admin")
        ])

    # ✅ EVENTS TABLE
    @action(detail=False, methods=["get"], url_path="events")
    def events(self, request):
        from base.models import Event
        return Response([
            {
                "id": e.id,
                "title": e.title,
                "hub": e.hub.name,
                "created_by": e.created_by.username,
                "start_time": e.start_time,
            }
            for e in Event.objects.select_related("hub", "created_by")
        ])

class ProfileViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    # GET /api/profile/ → get profile info
    @action(detail=False, methods=["get"])
    def me(self, request):
        user = request.user
        profile = user.profile
        serializer = ProfileSerializer(profile)
        data = serializer.data

        # add read-only user info
        data.update({
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email
        })
        return Response(data)

    # PATCH /api/profile/ → update only avatar or phone (partial)
    @action(detail=False, methods=["patch"])
    def update_profile(self, request):
        profile = request.user.profile
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    # POST /api/profile/change-password/ → change password
    @action(detail=False, methods=["post"], url_path="change-password")
    def change_password(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data["old_password"]):
            return Response(
                {"old_password": "Incorrect password"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()

        return Response({"message": "Password updated successfully"})
