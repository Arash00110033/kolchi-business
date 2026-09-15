from rest_framework import serializers

from .models import InventoryItem, InventoryTransaction


class InventoryItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )
    product_id = serializers.IntegerField(
        source="product.id",
        read_only=True,
    )

    class Meta:
        model = InventoryItem
        fields = (
            "id",
            "product_id",
            "product_name",
            "store",
            "quantity",
            "updated_at",
        )
        read_only_fields = fields


class InventoryAdjustSerializer(serializers.Serializer):
    quantity = serializers.IntegerField()
    transaction_type = serializers.ChoiceField(
        choices=InventoryTransaction.TransactionType.choices,
    )
    reference = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=100,
    )
    note = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    def validate_quantity(self, value):
        if value == 0:
            raise serializers.ValidationError(
                "Quantity cannot be zero."
            )

        return value
