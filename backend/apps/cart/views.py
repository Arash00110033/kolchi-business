from django.shortcuts import get_object_or_404

from rest_framework import generics, permissions, status
from rest_framework.response import Response

from apps.catalog.models import Product

from .models import Cart, CartItem
from .serializers import CartSerializer


class CartAPIView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        cart, _ = Cart.objects.get_or_create(
            user=self.request.user,
        )
        return cart


class CartItemCreateAPIView(generics.CreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        product_id = request.data.get("product")
        quantity = request.data.get("quantity", 1)

        if not product_id:
            return Response(
                {"detail": "Product is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {"detail": "Quantity must be a positive integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity < 1:
            return Response(
                {"detail": "Quantity must be a positive integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product = get_object_or_404(
            Product,
            id=product_id,
            is_active=True,
        )

        if quantity > product.stock:
            return Response(
                {"detail": "Insufficient stock."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart, _ = Cart.objects.get_or_create(
            user=request.user,
        )

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={"quantity": quantity},
        )

        if not created:
            new_quantity = item.quantity + quantity

            if new_quantity > product.stock:
                return Response(
                    {"detail": "Insufficient stock."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            item.quantity = new_quantity
            item.save(update_fields=["quantity", "updated_at"])

        return Response(
            CartSerializer(cart).data,
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            ),
        )


class CartItemUpdateAPIView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def patch(self, request, *args, **kwargs):
        item = get_object_or_404(
            CartItem,
            id=kwargs["item_id"],
            cart__user=request.user,
        )

        quantity = request.data.get("quantity")

        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {"detail": "Quantity must be a positive integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity < 1:
            return Response(
                {"detail": "Quantity must be a positive integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity > item.product.stock:
            return Response(
                {"detail": "Insufficient stock."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        item.quantity = quantity
        item.save(update_fields=["quantity", "updated_at"])

        return Response(
            CartSerializer(item.cart).data,
            status=status.HTTP_200_OK,
        )
    
class CartItemDeleteAPIView(generics.DestroyAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return CartItem.objects.filter(
            cart__user=self.request.user,
        )

    def destroy(self, request, *args, **kwargs):
        item = get_object_or_404(
            self.get_queryset(),
            id=kwargs["item_id"],
        )

        cart = item.cart
        item.delete()

        return Response(
            CartSerializer(cart).data,
            status=status.HTTP_200_OK,
        )

class CartClearAPIView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def delete(self, request, *args, **kwargs):
        cart, _ = Cart.objects.get_or_create(
            user=request.user,
        )

        cart.items.all().delete()

        return Response(
            CartSerializer(cart).data,
            status=status.HTTP_200_OK,
        )