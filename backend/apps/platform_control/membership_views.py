from django.shortcuts import get_object_or_404

from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from django.db import IntegrityError

from apps.core.permissions.platform import is_platform_owner
from apps.stores.admin_membership_serializers import AdminMembershipSerializer
from apps.stores.models import Store, StoreMembership


class PlatformOwnerRequired(permissions.BasePermission):
    message = "Platform owner permission required."

    def has_permission(self, request, view):
        return is_platform_owner(request.user)


class OwnerMembershipStoreMixin:
    def get_store(self):
        return get_object_or_404(
            Store,
            pk=self.kwargs["store_id"],
        )

    def get_membership_queryset(self):
        store = self.get_store()

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


class OwnerMembershipListCreateAPIView(
    OwnerMembershipStoreMixin,
    generics.ListCreateAPIView,
):
    permission_classes = (PlatformOwnerRequired,)
    serializer_class = AdminMembershipSerializer

    def get_queryset(self):
        return self.get_membership_queryset()

    def perform_create(self, serializer):
        store = self.get_store()

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


class OwnerMembershipDetailAPIView(
    OwnerMembershipStoreMixin,
    generics.RetrieveUpdateDestroyAPIView,
):
    permission_classes = (PlatformOwnerRequired,)
    serializer_class = AdminMembershipSerializer
    http_method_names = ["get", "patch", "delete", "options"]

    def get_queryset(self):
        return self.get_membership_queryset()

    def perform_update(self, serializer):
        serializer.save(store=self.get_store())

    def perform_destroy(self, instance):
        instance.delete()
