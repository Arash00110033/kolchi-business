from django.db import transaction

from ..models import InventoryItem, InventoryTransaction


class InventoryError(Exception):
    pass


class InventoryService:

    @staticmethod
    def _get_locked_item(product):
        item = (
            InventoryItem.objects
            .select_for_update()
            .filter(product=product)
            .first()
        )

        if item is not None:
            return item

        if product.store_id is None:
            raise InventoryError(
                "Product must belong to a store."
            )

        # Lock the product before creating the first inventory row.
        locked_product = (
            product.__class__.objects
            .select_for_update()
            .get(pk=product.pk)
        )

        # Re-check after acquiring the product lock.
        item = (
            InventoryItem.objects
            .select_for_update()
            .filter(product=locked_product)
            .first()
        )

        if item is None:
            item = InventoryItem.objects.create(
                product=locked_product,
                store_id=locked_product.store_id,
                quantity=locked_product.stock,
            )

        return item

    @staticmethod
    @transaction.atomic
    def get_or_create_item(product):
        return InventoryService._get_locked_item(product)

    @staticmethod
    @transaction.atomic
    def increase(
        product,
        quantity,
        transaction_type=InventoryTransaction.TransactionType.RESTOCK,
        reference="",
        note="",
    ):
        if quantity <= 0:
            raise InventoryError(
                "Increase quantity must be greater than zero."
            )

        item = InventoryService._get_locked_item(product)

        before = item.quantity
        after = before + quantity

        item.quantity = after
        item.save(update_fields=["quantity", "updated_at"])

        return InventoryTransaction.objects.create(
            inventory_item=item,
            transaction_type=transaction_type,
            quantity=quantity,
            quantity_before=before,
            quantity_after=after,
            reference=reference,
            note=note,
        )

    @staticmethod
    @transaction.atomic
    def decrease(
        product,
        quantity,
        transaction_type=InventoryTransaction.TransactionType.SALE,
        reference="",
        note="",
    ):
        if quantity <= 0:
            raise InventoryError(
                "Decrease quantity must be greater than zero."
            )

        item = InventoryService._get_locked_item(product)

        if quantity > item.quantity:
            raise InventoryError(
                f"Insufficient inventory for {product.name}."
            )

        before = item.quantity
        after = before - quantity

        item.quantity = after
        item.save(update_fields=["quantity", "updated_at"])

        return InventoryTransaction.objects.create(
            inventory_item=item,
            transaction_type=transaction_type,
            quantity=-quantity,
            quantity_before=before,
            quantity_after=after,
            reference=reference,
            note=note,
        )
