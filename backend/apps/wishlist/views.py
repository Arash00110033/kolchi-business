from django.shortcuts import get_object_or_404

from rest_framework import generics, permissions, status
from rest_framework.response import Response

from apps.catalog.models import Product

from .models import WishlistItem
from .serializers import WishlistItemSerializer


class WishlistListAPIView(generics.ListAPIView):
    serializer_class = WishlistItemSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return WishlistItem.objects.filter(
            user=self.request.user,
            product__is_active=True,
        ).select_related(
            "product",
            "product__category",
        )


class WishlistItemCreateAPIView(generics.CreateAPIView):
    serializer_class = WishlistItemSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        product_id = request.data.get("product")

        if not product_id:
            return Response(
                {"detail": "Product is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product = get_object_or_404(
            Product,
            id=product_id,
            is_active=True,
        )

        item, created = WishlistItem.objects.get_or_create(
            user=request.user,
            product=product,
        )

        return Response(
            WishlistItemSerializer(item).data,
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            ),
        )


class WishlistItemDeleteAPIView(generics.DestroyAPIView):
    serializer_class = WishlistItemSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return WishlistItem.objects.filter(
            user=self.request.user,
        )