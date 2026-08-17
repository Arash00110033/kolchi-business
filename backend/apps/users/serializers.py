from django.contrib.auth import authenticate, get_user_model

from rest_framework import serializers

from rest_framework_simplejwt.tokens import RefreshToken


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

    def validate_username(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Username cannot be empty."
            )

        return value

    def validate_phone_number(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Phone number cannot be empty."
            )

        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError(
                "This phone number is already registered."
            )

        return value

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "This email is already registered."
            )

        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {
                    "password_confirm": "Passwords do not match."
                }
            )

        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")

        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "phone_number",
            "email",
        )
        read_only_fields = (
            "id",
            "username",
            "phone_number",
            "email",
        )


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()

    password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    def validate(self, attrs):
        username = attrs["username"].strip()
        password = attrs["password"]

        user = authenticate(
            username=username,
            password=password,
        )

        if user is None:
            raise serializers.ValidationError(
                "Invalid username or password."
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "This account is inactive."
            )

        attrs["user"] = user

        return attrs

    def create_token_response(self):
        user = self.validated_data["user"]

        refresh = RefreshToken.for_user(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

