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
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        df = pd.read_excel(file)
        created_users = []

        for _, row in df.iterrows():
            serializer = CreateUserSerializer(data={
                "first_name": row["first_name"],
                "last_name": row["last_name"],
                "email": row["email"]
            })
            if serializer.is_valid():
                result = serializer.save()
                created_users.append({
                    "username": result["username"],
                    "password": result["password"],
                    "email": row["email"]
                })

        return Response(created_users, status=status.HTTP_201_CREATED)

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
