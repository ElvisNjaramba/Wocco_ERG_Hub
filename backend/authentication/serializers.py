from django.contrib.auth.models import User
from rest_framework import serializers
from django.utils.crypto import get_random_string

from .models import GeneratedCredential, Profile

class SuperUserRegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()

    def create(self, validated_data):
        # 🔹 Generate username
        base_username = f"{validated_data['first_name'].lower()}.{validated_data['last_name'].lower()}"
        username = base_username

        if User.objects.filter(username=username).exists():
            username = f"{base_username}{get_random_string(4)}"

        # 🔹 Generate password
        password = get_random_string(12)

        # 🔹 Create superuser
        user = User.objects.create_superuser(
            username=username,
            email=validated_data["email"],
            password=password,
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )

        return {
            "user": user,
            "username": username,
            "password": password,
        }



class CreateUserSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()

    def create(self, validated_data):
        base_username = f"{validated_data['first_name'].lower()}.{validated_data['last_name'].lower()}"
        username = base_username

        if User.objects.filter(username=username).exists():
            username = f"{base_username}{get_random_string(4)}"

        password = get_random_string(10)

        user = User.objects.create_user(
            username=username,
            email=validated_data["email"],
            password=password,
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )

        GeneratedCredential.objects.create(
            user=user,
            plain_password=password
        )

        return {
            "user": user,
            "username": username,
            "password": password,
        }

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["phone", "avatar"]  # only editable fields


from django.contrib.auth.password_validation import validate_password

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField()

    def validate_new_password(self, value):
        validate_password(value)
        return value
