from django.shortcuts import get_object_or_404
from django.db import transaction

from rest_framework import generics, permissions, status
from rest_framework.response import Response

from apps.catalog.models import Product
from apps.core.permissions.store import (
    can_access_store,
    can_manage_store,
)
from apps.stores.models import Store

from .models import InventoryItem
from .serializers import (
    InventoryAdjustSerializer,
    InventoryItemSerializer,
)
from .services import InventoryError, InventoryService


class InventoryStoreMixin:
    def get_store(self):
        return get_object_or_404(
            Store,
            pk=self.kwargs["store_id"],
            is_active=True,
        )


class AdminInventoryListAPIView(
    InventoryStoreMixin,
    generics.ListAPIView,
):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = InventoryItemSerializer

    def get_queryset(self):
        store = self.get_store()

        if not can_access_store(self.request.user, store):
            from django.http import Http404
            raise Http404("Store not found.")

        return (
            InventoryItem.objects
            .filter(store=store)
            .select_related("product")
        )


class AdminInventoryAdjustAPIView(
    InventoryStoreMixin,
    generics.GenericAPIView,
):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = InventoryAdjustSerializer

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        store = self.get_store()

        if not can_manage_store(self.request.user, store):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "You do not have permission for this store."
            )

        product = get_object_or_404(
            Product,
            pk=kwargs["product_id"],
            store=store,
            is_active=True,
        )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        quantity = serializer.validated_data["quantity"]
        transaction_type = serializer.validated_data[
            "transaction_type"
        ]
        reference = serializer.validated_data.get("reference", "")
        note = serializer.validated_data.get("note", "")

        try:
            if quantity > 0:
                transaction_record = InventoryService.increase(
                    product,
                    quantity,
                    transaction_type=transaction_type,
                    reference=reference,
                    note=note,
                )
            else:
                transaction_record = InventoryService.decrease(
                    product,
                    abs(quantity),
                    transaction_type=transaction_type,
                    reference=reference,
                    note=note,
                )
        except InventoryError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product.stock = transaction_record.quantity_after
        product.save(
            update_fields=["stock", "updated_at"],
        )

        item = InventoryItem.objects.select_related(
            "product",
        ).get(
            pk=transaction_record.inventory_item_id,
        )

        return Response(
            InventoryItemSerializer(item).data,
            status=status.HTTP_200_OK,
        )
