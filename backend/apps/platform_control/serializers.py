from rest_framework import serializers

from apps.stores.models import Store


class OwnerStoreSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Store
        fields = (
            "id",
            "owner",
            "name",
            "slug",
            "description",
            "default_locale",
            "enabled_locales",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "owner",
            "created_at",
            "updated_at",
        )
