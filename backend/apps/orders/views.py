from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import generics, permissions, status
from rest_framework.response import Response

from apps.cart.models import Cart
from apps.catalog.models import Product

from .models import Order, OrderItem
from .serializers import OrderSerializer


class OrderListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Order.objects.filter(
            user=self.request.user,
        ).prefetch_related(
            "items",
        )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        cart = get_object_or_404(
            Cart.objects.prefetch_related(
                "items__product",
            ),
            user=request.user,
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

        for cart_item in cart_items:
            product = products_by_id.get(cart_item.product_id)

            if product is None:
                return Response(
                    {
                        "detail": (
                            f"Product {cart_item.product_id} "
                            "is unavailable."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

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
            status=Order.Status.PENDING,
            total=0,
        )

        total = 0

        for cart_item in cart_items:
            product = products_by_id[cart_item.product_id]

            subtotal = product.price * cart_item.quantity

            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                unit_price=product.price,
                quantity=cart_item.quantity,
                subtotal=subtotal,
            )

            product.stock -= cart_item.quantity
            product.save(
                update_fields=[
                    "stock",
                    "updated_at",
                ]
            )

            total += subtotal

        order.total = total
        order.save(
            update_fields=[
                "total",
                "updated_at",
            ]
        )

        cart.items.all().delete()

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


class OrderDetailAPIView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Order.objects.filter(
            user=self.request.user,
        ).prefetch_related(
            "items",
        )