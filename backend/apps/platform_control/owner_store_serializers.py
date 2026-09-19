from rest_framework import serializers

from apps.stores.models import Store


class OwnerStoreCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = (
            "id",
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
            "is_active",
            "created_at",
            "updated_at",
        )

    def validate_enabled_locales(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError(
                "enabled_locales must be a list."
            )

        return value
