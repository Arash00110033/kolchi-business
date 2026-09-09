from rest_framework import serializers

from .models import WishlistItem


class WishlistItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    price = serializers.DecimalField(
        source="product.price",
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )

    image_url = serializers.URLField(
        source="product.image_url",
        read_only=True,
    )

    slug = serializers.CharField(
        source="product.slug",
        read_only=True,
    )

    category_name = serializers.CharField(
        source="product.category.name",
        read_only=True,
    )

    class Meta:
        model = WishlistItem
        fields = (
            "id",
            "product",
            "product_name",
            "price",
            "image_url",
            "slug",
            "category_name",
            "created_at",
        )
        read_only_fields = (
            "id",
            "product_name",
            "price",
            "image_url",
            "slug",
            "category_name",
            "created_at",
        )