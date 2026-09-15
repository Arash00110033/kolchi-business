from django.db import transaction
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from apps.cart.models import Cart
from apps.catalog.models import Product
from apps.inventory.services import InventoryError, InventoryService
from apps.stores.models import Store

from .models import Order, OrderItem
from .serializers import OrderSerializer


class OrderListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .select_related("store")
            .prefetch_related("items")
        )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        shipping_address = str(
            request.data.get("shipping_address", "")
        ).strip()
        shipping_phone = str(
            request.data.get("shipping_phone", "")
        ).strip()

        if len(shipping_address) < 10 or len(shipping_address) > 500:
            return Response(
                {"detail": "Shipping address must be between 10 and 500 characters."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        import re

        if not re.fullmatch(r"09\d{9}", shipping_phone):
            return Response(
                {"detail": "Invalid shipping phone."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart = (
            Cart.objects
            .filter(user=request.user)
            .prefetch_related("items__product")
            .first()
        )

        if cart is None:
            return Response(
                {"detail": "Cart is empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart_items = list(cart.items.all())

        if not cart_items:
            return Response(
                {"detail": "Cart is empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        products = Product.objects.select_for_update().filter(
            id__in=[item.product_id for item in cart_items],
            is_active=True,
        )

        products_by_id = {
            product.id: product
            for product in products
        }

        if len(products_by_id) != len(cart_items):
            return Response(
                {"detail": "One or more products are unavailable."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        store_ids = {
            products_by_id[item.product_id].store_id
            for item in cart_items
        }

        if len(store_ids) != 1:
            return Response(
                {"detail": "All order items must belong to one store."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        store = Store.objects.filter(
            id=next(iter(store_ids)),
            is_active=True,
        ).first()

        if store is None:
            return Response(
                {"detail": "Store is unavailable."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for cart_item in cart_items:
            product = products_by_id[cart_item.product_id]

            if cart_item.quantity > product.stock:
                return Response(
                    {
                        "detail": (
                            f"Insufficient stock for "
                            f"{product.name}."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        order = Order.objects.create(
            user=request.user,
            store=store,
            shipping_address=shipping_address,
            shipping_phone=shipping_phone,
            status=Order.Status.PENDING,
            total=0,
        )

        total = 0

        try:
            for cart_item in cart_items:
                product = products_by_id[cart_item.product_id]

                subtotal = product.price * cart_item.quantity
                total += subtotal

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name=product.name,
                    unit_price=product.price,
                    quantity=cart_item.quantity,
                    subtotal=subtotal,
                )

                InventoryService.decrease(
                    product,
                    cart_item.quantity,
                    reference=f"ORDER-{order.id}",
                    note="Order creation",
                )

                product.stock -= cart_item.quantity
                product.save(
                    update_fields=[
                        "stock",
                        "updated_at",
                    ]
                )
        except InventoryError as exc:
            raise ValidationError({"detail": str(exc)})

        order.total = total
        order.save(update_fields=["total"])

        cart.items.all().delete()

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


class OrderDetailAPIView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .select_related("store")
            .prefetch_related("items")
        )


class OrderCancelAPIView(generics.UpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        order = generics.get_object_or_404(
            Order.objects.select_for_update(),
            id=kwargs["pk"],
            user=request.user,
        )

        if order.status == Order.Status.CANCELLED:
            return Response(
                {"detail": "Order is already cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order.status not in {
            Order.Status.PENDING,
            Order.Status.CONFIRMED,
        }:
            return Response(
                {"detail": "This order cannot be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        items = list(order.items.all())

        products = Product.objects.select_for_update().filter(
            id__in=[item.product_id for item in items],
        )

        products_by_id = {
            product.id: product
            for product in products
        }

        try:
            for item in items:
                product = products_by_id[item.product_id]

                InventoryService.increase(
                    product,
                    item.quantity,
                    transaction_type="return",
                    reference=f"ORDER-{order.id}",
                    note="Order cancellation",
                )

                product.stock += item.quantity
                product.save(
                    update_fields=[
                        "stock",
                        "updated_at",
                    ]
                )
        except InventoryError as exc:
            raise ValidationError({"detail": str(exc)})

        order.status = Order.Status.CANCELLED
        order.save(update_fields=["status", "updated_at"])

        return Response(OrderSerializer(order).data)


