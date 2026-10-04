from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from apps.core.permissions.store_permissions import (
    has_store_permission,
)
from apps.core.permissions.store import can_manage_store
from apps.stores.models import Store

from .admin_serializers import (
    AdminCategorySerializer,
    AdminProductSerializer,
)
from .models import Category, Product


class StoreScopedPermissionMixin:
    def get_store(self):
        return get_object_or_404(
            Store,
            pk=self.kwargs["store_id"],
            is_active=True,
        )

    def check_store_access(
        self,
        store,
        permission_code,
        management=False,
    ):
        if not has_store_permission(
            self.request.user,
            store,
            permission_code,
        ):

            raise PermissionDenied(
                "You do not have permission for this store."
            )

        if management and not can_manage_store(
            self.request.user,
            store,
        ):
            raise PermissionDenied(
                "You do not have management permission for this store."
            )


class AdminCategoryListCreateAPIView(
    StoreScopedPermissionMixin,
    generics.ListCreateAPIView,
):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = AdminCategorySerializer

    def get_queryset(self):
        store = self.get_store()
        self.check_store_access(store, "categories")
        return Category.objects.filter(store=store)

    def perform_create(self, serializer):
        store = self.get_store()
        self.check_store_access(store, "categories")
        serializer.save(store=store)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["store"] = self.get_store()
        return context


class AdminCategoryDetailAPIView(
    StoreScopedPermissionMixin,
    generics.RetrieveUpdateDestroyAPIView,
):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = AdminCategorySerializer

    def get_queryset(self):
        store = self.get_store()
        self.check_store_access(store, "categories")
        return Category.objects.filter(store=store)

    def perform_update(self, serializer):
        store = self.get_store()
        self.check_store_access(store, "categories")
        serializer.save(store=store)

    def perform_destroy(self, instance):
        store = self.get_store()
        self.check_store_access(store, "categories")
        instance.delete()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["store"] = self.get_store()
        return context


class AdminProductListCreateAPIView(
    StoreScopedPermissionMixin,
    generics.ListCreateAPIView,
):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = AdminProductSerializer

    def get_queryset(self):
        store = self.get_store()
        self.check_store_access(store, "products")
        return Product.objects.filter(
            store=store,
        ).select_related("category")

    def perform_create(self, serializer):
        store = self.get_store()
        self.check_store_access(store, "products")
        serializer.save(store=store)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["store"] = self.get_store()
        return context


class AdminProductDetailAPIView(
    StoreScopedPermissionMixin,
    generics.RetrieveUpdateDestroyAPIView,
):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = AdminProductSerializer

    def get_queryset(self):
        store = self.get_store()
        self.check_store_access(store, "products")
        return Product.objects.filter(
            store=store,
        ).select_related("category")

    def perform_update(self, serializer):
        store = self.get_store()
        self.check_store_access(store, "products")
        serializer.save(store=store)

    def perform_destroy(self, instance):
        store = self.get_store()
        self.check_store_access(store, "products", management=True)
        instance.delete()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["store"] = self.get_store()
        return context
