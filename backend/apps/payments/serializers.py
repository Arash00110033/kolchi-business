from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = (
            "id",
            "order",
            "user",
            "amount",
            "method",
            "status",
            "transaction_id",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "user",
            "amount",
            "status",
            "transaction_id",
            "created_at",
            "updated_at",
        )
