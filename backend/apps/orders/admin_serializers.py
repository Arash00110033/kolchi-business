from rest_framework import serializers

from .models import Order, OrderItem


class AdminOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product",
            "product_name",
            "unit_price",
            "quantity",
            "subtotal",
        )
        read_only_fields = fields


class AdminOrderSerializer(serializers.ModelSerializer):
    items = AdminOrderItemSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Order
        fields = (
            "id",
            "store",
            "user",
            "status",
            "total",
            "shipping_address",
            "shipping_phone",
            "items",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "store",
            "user",
            "total",
            "shipping_address",
            "shipping_phone",
            "items",
            "created_at",
            "updated_at",
        )

    def validate_status(self, value):
        order = self.instance

        if order is None:
            raise serializers.ValidationError(
                "Order status cannot be set during creation."
            )

        if not order.can_transition_to(value):
            raise serializers.ValidationError(
                f"Invalid order transition: "
                f"{order.status} -> {value}"
            )

        return value
