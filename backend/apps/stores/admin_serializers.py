from rest_framework import serializers

from .models import Store


class AdminStoreSerializer(serializers.ModelSerializer):
    can_manage_languages = serializers.SerializerMethodField()

    def get_can_manage_languages(self, obj):
        request = self.context.get("request")

        if not request:
            return False

        from apps.core.permissions.store import can_manage_store_languages

        return can_manage_store_languages(request.user, obj)

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
            "enabled_locales",            "can_manage_languages",

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
