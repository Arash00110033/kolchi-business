from django.db import IntegrityError
from django.shortcuts import get_object_or_404

from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.core.permissions.store import can_manage_store

from .admin_membership_serializers import AdminMembershipSerializer
from .models import Store, StoreMembership


class AdminMembershipStoreMixin:
    def get_store(self):
        return get_object_or_404(
            Store,
            pk=self.kwargs["store_id"],
            is_active=True,
        )

    def check_management_access(self, store):
        if not can_manage_store(self.request.user, store):
            raise PermissionDenied(
                "You do not have permission to manage this store."
            )


class AdminMembershipListCreateAPIView(
    AdminMembershipStoreMixin,
    generics.ListCreateAPIView,
):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = AdminMembershipSerializer

    def get_queryset(self):
        store = self.get_store()
        self.check_management_access(store)

        return (
            StoreMembership.objects
            .filter(store=store)
            .select_related("user")
            .order_by("user__username")
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["store"] = self.get_store()
        return context

    def perform_create(self, serializer):
        store = self.get_store()
        self.check_management_access(store)

        try:
            serializer.save(store=store)
        except IntegrityError:
            raise ValidationError(
                {
                    "user_id": (
                        "This user is already a member of this store."
                    )
                }
            )


class AdminMembershipDetailAPIView(
    AdminMembershipStoreMixin,
    generics.RetrieveUpdateDestroyAPIView,
):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = AdminMembershipSerializer
    http_method_names = ["get", "patch", "delete", "options"]

    def get_queryset(self):
        store = self.get_store()
        self.check_management_access(store)

        return (
            StoreMembership.objects
            .filter(store=store)
            .select_related("user")
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["store"] = self.get_store()
        return context

    def perform_update(self, serializer):
        store = self.get_store()
        self.check_management_access(store)

        serializer.save(store=store)

    def perform_destroy(self, instance):
        store = self.get_store()
        self.check_management_access(store)

        instance.delete()
