from django.db import models

from apps.catalog.models import Product
from apps.stores.models import Store


class InventoryItem(models.Model):
    product = models.OneToOneField(
        Product,
        on_delete=models.PROTECT,
        related_name="inventory_item",
    )
    store = models.ForeignKey(
        Store,
        on_delete=models.PROTECT,
        related_name="inventory_items",
    )
    quantity = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]

        indexes = [
            models.Index(fields=["store", "product"]),
        ]

    def __str__(self):
        return f"{self.product.name} - {self.quantity}"


class InventoryTransaction(models.Model):
    class TransactionType(models.TextChoices):
        RESTOCK = "restock", "Restock"
        SALE = "sale", "Sale"
        RETURN = "return", "Return"
        ADJUSTMENT = "adjustment", "Adjustment"

    inventory_item = models.ForeignKey(
        InventoryItem,
        on_delete=models.PROTECT,
        related_name="transactions",
    )
    transaction_type = models.CharField(
        max_length=20,
        choices=TransactionType.choices,
    )
    quantity = models.IntegerField()
    quantity_before = models.PositiveIntegerField()
    quantity_after = models.PositiveIntegerField()
    reference = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )
    note = models.TextField(
        blank=True,
        default="",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [
            models.Index(
                fields=["inventory_item", "-created_at"]
            ),
            models.Index(
                fields=["transaction_type", "-created_at"]
            ),
        ]

    def __str__(self):
        return (
            f"{self.inventory_item.product.name} "
            f"{self.transaction_type} "
            f"{self.quantity}"
        )
