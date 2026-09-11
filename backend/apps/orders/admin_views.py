from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import generics, permissions, status
from rest_framework.response import Response

from apps.catalog.models import Product
from apps.core.permissions.store import (
    can_access_store,
    can_manage_store,
)
from apps.stores.models import Store

from .admin_serializers import AdminOrderSerializer
from .models import Order


class AdminOrderStoreMixin:
    def get_store(self):
        return get_object_or_404(
            Store,
            pk=self.kwargs["store_id"],
            is_active=True,
        )

    def check_store_access(self, store, management=False):
        allowed = (
            can_manage_store(self.request.user, store)
            if management
            else can_access_store(self.request.user, store)
        )

        if not allowed:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied(
                "You do not have permission for this store."
            )


class AdminOrderListAPIView(
    AdminOrderStoreMixin,
    generics.ListAPIView,
):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = AdminOrderSerializer

    def get_queryset(self):
        store = self.get_store()

        if not can_access_store(self.request.user, store):
            from django.http import Http404
            raise Http404("Store not found.")

        return (
            Order.objects.filter(store=store)
            .select_related("user", "store")
            .prefetch_related("items")
        )


class AdminOrderDetailAPIView(
    AdminOrderStoreMixin,
    generics.RetrieveAPIView,
):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = AdminOrderSerializer

    def get_queryset(self):
        store = self.get_store()

        if not can_access_store(self.request.user, store):
            from django.http import Http404
            raise Http404("Store not found.")

        return (
            Order.objects.filter(store=store)
            .select_related("user", "store")
            .prefetch_related("items")
        )


class AdminOrderStatusAPIView(
    AdminOrderStoreMixin,
    generics.UpdateAPIView,
):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = AdminOrderSerializer
    http_method_names = ["patch", "options"]

    def get_queryset(self):
        store = self.get_store()
        self.check_store_access(store, management=True)

        return (
            Order.objects.filter(store=store)
            .select_related("user", "store")
            .prefetch_related("items")
        )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        store = self.get_store()
        self.check_store_access(store, management=True)

        order = get_object_or_404(
            Order.objects.select_for_update(),
            pk=kwargs["pk"],
            store=store,
        )

        unexpected_fields = set(request.data.keys()) - {"status"}

        if unexpected_fields:
            return Response(
                {"detail": "Only order status can be changed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(
            order,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data.get("status")

        if new_status is None:
            return Response(
                {"detail": "Only order status can be changed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_status == Order.Status.CANCELLED:
            items = list(order.items.all())

            products = Product.objects.select_for_update().filter(
                id__in=[item.product_id for item in items],
            )

            products_by_id = {
                product.id: product
                for product in products
            }

            for item in items:
                product = products_by_id.get(item.product_id)

                if product is None:
                    return Response(
                        {
                            "detail": (
                                f"Product {item.product_id} "
                                "is unavailable."
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                product.stock += item.quantity
                product.save(
                    update_fields=["stock", "updated_at"],
                )

        order.transition_to(new_status)

        return Response(
            AdminOrderSerializer(order).data,
            status=status.HTTP_200_OK,
        )

