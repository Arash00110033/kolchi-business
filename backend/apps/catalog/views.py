from django.db.models import Q
from rest_framework import generics

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class CategoryListAPIView(generics.ListAPIView):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.filter(is_active=True)


class ProductListAPIView(generics.ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.filter(
            is_active=True,
        ).select_related("category")

        query = self.request.query_params.get("query")
        category = self.request.query_params.get("category")
        brand = self.request.query_params.get("brand")
        sort = self.request.query_params.get("sort")

        if query:
            queryset = queryset.filter(
                Q(name__icontains=query)
                | Q(description__icontains=query)
            )

        if category:
            queryset = queryset.filter(
                category__slug=category,
            )

        # Product model currently has no brand field.
        # Brand filtering will be added when the catalog model supports it.

        if sort == "price_asc":
            queryset = queryset.order_by("price")
        elif sort == "price_desc":
            queryset = queryset.order_by("-price")
        elif sort == "name":
            queryset = queryset.order_by("name")
        else:
            queryset = queryset.order_by("-created_at")

        return queryset


class ProductDetailAPIView(generics.RetrieveAPIView):
    serializer_class = ProductSerializer

    queryset = Product.objects.filter(
        is_active=True,
    ).select_related("category")