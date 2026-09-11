from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions

from apps.core.permissions.store import (
    can_edit_store_content,
    can_manage_store,
)
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

    def check_store_access(self, store, management=False):
        allowed = (
            can_manage_store(self.request.user, store)
            if management
            else can_edit_store_content(self.request.user, store)
        )

        if not allowed:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "You do not have permission for this store."
            )


class AdminCategoryListCreateAPIView(
    StoreScopedPermissionMixin,
    generics.ListCreateAPIView,
):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = AdminCategorySerializer

    def get_queryset(self):
        store = self.get_store()
        self.check_store_access(store)
        return Category.objects.filter(store=store)

    def perform_create(self, serializer):
        store = self.get_store()
        self.check_store_access(store)
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
        self.check_store_access(store)
        return Category.objects.filter(store=store)

    def perform_update(self, serializer):
        store = self.get_store()
        self.check_store_access(store)
        serializer.save(store=store)

    def perform_destroy(self, instance):
        store = self.get_store()
        self.check_store_access(store, management=True)
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
        self.check_store_access(store)
        return Product.objects.filter(
            store=store,
        ).select_related("category")

    def perform_create(self, serializer):
        store = self.get_store()
        self.check_store_access(store)
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
        self.check_store_access(store)
        return Product.objects.filter(
            store=store,
        ).select_related("category")

    def perform_update(self, serializer):
        store = self.get_store()
        self.check_store_access(store)
        serializer.save(store=store)

    def perform_destroy(self, instance):
        store = self.get_store()
        self.check_store_access(store, management=True)
        instance.delete()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["store"] = self.get_store()
        return context
