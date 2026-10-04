from rest_framework import serializers

from .models import Store, StoreMembership, StoreMembershipPermission


class AccessibleStoreSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = Store
        fields = (
            "id",
            "name",
            "slug",
            "role",
            "permissions",
        )

    def get_membership(self, store):
        memberships = self.context.get("memberships", {})
        return memberships.get(store.id)

    def get_role(self, store):
        if store.owner_id == self.context["user"].id:
            return "owner"

        membership = self.get_membership(store)
        return membership.role if membership else None

    def get_permissions(self, store):
        user = self.context["user"]

        if user.is_superuser or store.owner_id == user.id:
            return list(self.context["permission_catalog"])

        membership = self.get_membership(store)

        if not membership:
            return []

        return sorted(
            permission.code
            for permission in membership.permissions.all()
        )


class StorePermissionSerializer(serializers.Serializer):
    code = serializers.CharField(read_only=True)
    label = serializers.CharField(read_only=True)
    enabled = serializers.BooleanField(read_only=True)


class StoreMembershipPermissionsSerializer(serializers.Serializer):
    permissions = serializers.ListField(
        child=serializers.CharField(max_length=80),
        allow_empty=True,
    )

    def validate_permissions(self, values):
        catalog = self.context["permission_catalog"]

        invalid = [
            value
            for value in values
            if value not in catalog
        ]

        if invalid:
            raise serializers.ValidationError(
                {
                    "invalid_permissions": invalid,
                }
            )

        if len(values) != len(set(values)):
            raise serializers.ValidationError(
                "Duplicate permissions are not allowed."
            )

        return values
