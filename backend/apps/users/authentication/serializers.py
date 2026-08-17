from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework import serializers


User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )

    password_confirm = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = (
            "username",
            "phone_number",
            "email",
            "password",
            "password_confirm",
        )
        extra_kwargs = {
            "email": {
                "required": False,
                "allow_blank": True,
            },
            "phone_number": {
                "required": True,
            },
        }

    def validate_username(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Username cannot be empty."
            )

        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                "This username is already in use."
            )

        return value

    def validate_phone_number(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Phone number is required."
            )

        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError(
                "This phone number is already registered."
            )

        return value

    def validate_email(self, value):
        value = value.strip().lower()

        if value and User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "This email address is already registered."
            )

        return value

    def validate(self, attrs):
        password = attrs.get("password")
        password_confirm = attrs.get("password_confirm")

        if password != password_confirm:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )

        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")

        password = validated_data.pop("password")

        try:
            user = User(**validated_data)
            user.set_password(password)
            user.save()
        except IntegrityError:
            raise serializers.ValidationError(
                "Unable to create the account with the provided information."
            )

        return user