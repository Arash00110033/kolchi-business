from rest_framework import serializers

from apps.users.models import User

from .models import StoreMembership


class AdminMembershipSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(
        source="user",
        queryset=User.objects.all(),
        write_only=True,
    )

    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    class Meta:
        model = StoreMembership
        fields = (
            "id",
            "user_id",
            "username",
            "email",
            "role",
            "created_at",
        )
        read_only_fields = (
            "id",
            "username",
            "email",
            "created_at",
        )

    def validate_user_id(self, user):
        store = self.context["store"]

        if store.owner_id == user.id:
            raise serializers.ValidationError(
                "Store owner cannot be added as a membership."
            )

        return user

    def validate_role(self, value):
        if value not in {
            StoreMembership.Role.ADMIN,
            StoreMembership.Role.EDITOR,
        }:
            raise serializers.ValidationError(
                "Invalid store membership role."
            )

        return value

