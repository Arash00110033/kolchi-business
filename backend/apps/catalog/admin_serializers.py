from rest_framework import serializers

from .models import Category, Product
from apps.stores.models import Store


class AdminCategorySerializer(serializers.ModelSerializer):
    store = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Category
        fields = (
            "id",
            "store",
            "name",
            "slug",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "store",
            "created_at",
            "updated_at",
        )


class AdminProductSerializer(serializers.ModelSerializer):
    store = serializers.PrimaryKeyRelatedField(read_only=True)
    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    class Meta:
        model = Product
        fields = (
            "id",
            "store",
            "category",
            "category_name",
            "name",
            "slug",
            "description",
            "price",
            "stock",
            "image_url",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "store",
            "category_name",
            "created_at",
            "updated_at",
        )

    def validate_category(self, category):
        store = self.context["store"]

        if category.store_id != store.id:
            raise serializers.ValidationError(
                "Category does not belong to this store."
            )

        return category
