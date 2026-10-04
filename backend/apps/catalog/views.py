from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import generics, permissions

from apps.stores.models import Store

from .filters import ProductQuerySerializer
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class StoreScopedCatalogMixin:
    def get_store(self):
        return get_object_or_404(
            Store,
            pk=self.kwargs["store_id"],
            is_active=True,
        )


class CategoryListAPIView(StoreScopedCatalogMixin, generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        store = self.get_store()
        return Category.objects.filter(
            store=store,
            is_active=True,
        )


class ProductListAPIView(StoreScopedCatalogMixin, generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        store = self.get_store()

        query_serializer = ProductQuerySerializer(
            data=self.request.query_params,
        )
        query_serializer.is_valid(raise_exception=True)

        params = query_serializer.validated_data

        queryset = Product.objects.filter(
            store=store,
            is_active=True,
        ).select_related("category")

        query = params.get("query")
        category = params.get("category")
        sort = params.get("sort")

        if query:
            queryset = queryset.filter(
                Q(name__icontains=query)
                | Q(description__icontains=query)
            )

        if category:
            queryset = queryset.filter(
                category__slug=category,
            )

        if sort == "price_asc":
            queryset = queryset.order_by("price")
        elif sort == "price_desc":
            queryset = queryset.order_by("-price")
        elif sort == "name":
            queryset = queryset.order_by("name")
        else:
            queryset = queryset.order_by("-created_at")

        return queryset


class ProductDetailAPIView(StoreScopedCatalogMixin, generics.RetrieveAPIView):
    serializer_class = ProductSerializer
    permission_classes = (permissions.AllowAny,)

    lookup_field = "slug"
    lookup_url_kwarg = "slug"

    def get_queryset(self):
        store = self.get_store()
        return Product.objects.filter(
            store=store,
            is_active=True,
        ).select_related("category")