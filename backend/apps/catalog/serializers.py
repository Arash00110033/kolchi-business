from rest_framework import serializers

from .models import Category, Product, ProductAttribute


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )


class ProductAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductAttribute
        fields = (
            "id",
            "key",
            "value",
            "value_type",
        )
        read_only_fields = ("id",)


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    attributes = ProductAttributeSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Product
        fields = (
            "id",
            "category",
            "category_name",
            "name",
            "slug",
            "description",
            "price",
            "stock",
            "image_url",
            "is_active",
            "attributes",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "category_name",
            "attributes",
            "created_at",
            "updated_at",
        )
