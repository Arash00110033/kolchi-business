from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db.models import Q

from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from apps.core.permissions.store_permissions import (
    STORE_PERMISSION_DEFINITIONS,
)
from apps.core.permissions.store import is_store_owner

from .admin_permission_serializers import (
    AccessibleStoreSerializer,
    StoreMembershipPermissionsSerializer,
)
from .models import Store, StoreMembership, StoreMembershipPermission


class AccessibleStoresAPIView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = AccessibleStoreSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return (
                Store.objects
                .filter(is_active=True)
                .order_by("name")
            )

        return (
            Store.objects
            .filter(
                is_active=True,
            )
            .filter(
                Q(owner=user)
                | Q(memberships__user=user)
            )
            .distinct()
            .order_by("name")
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()

        user = self.request.user

        memberships = {
            membership.store_id: membership
            for membership in (
                StoreMembership.objects
                .filter(
                    user=user,
                    store__is_active=True,
                )
                .prefetch_related("permissions")
            )
        }

        context.update(
            {
                "user": user,
                "memberships": memberships,
                "permission_catalog": tuple(
                    STORE_PERMISSION_DEFINITIONS
                ),
            }
        )

        return context


class StoreMembershipPermissionAPIView(
    generics.RetrieveUpdateAPIView,
):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = StoreMembershipPermissionsSerializer
    http_method_names = ["get", "patch", "options"]

    def get_store(self):
        return get_object_or_404(
            Store,
            pk=self.kwargs["store_id"],
            is_active=True,
        )

    def get_membership(self):
        store = self.get_store()

        return get_object_or_404(
            StoreMembership,
            pk=self.kwargs["pk"],
            store=store,
        )

    def check_owner_access(self, store):
        if not is_store_owner(self.request.user, store):
            raise PermissionDenied(
                "Only the store owner can manage member permissions."
            )

    def get_object(self):
        store = self.get_store()
        self.check_owner_access(store)

        return self.get_membership()

    def get(self, request, *args, **kwargs):
        membership = self.get_object()

        enabled = {
            permission.code
            for permission in membership.permissions.all()
        }

        return Response(
            {
                "membership_id": membership.id,
                "store_id": membership.store_id,
                "role": membership.role,
                "permissions": [
                    {
                        "code": code,
                        "label": label,
                        "enabled": code in enabled,
                    }
                    for code, label in STORE_PERMISSION_DEFINITIONS.items()
                ],
            }
        )

    @transaction.atomic
    def patch(self, request, *args, **kwargs):
        membership = self.get_object()

        serializer = self.get_serializer(
            data=request.data,
            context={
                "permission_catalog": STORE_PERMISSION_DEFINITIONS,
            },
        )
        serializer.is_valid(raise_exception=True)

        selected = set(serializer.validated_data["permissions"])

        StoreMembershipPermission.objects.filter(
            membership=membership,
        ).exclude(
            code__in=selected,
        ).delete()

        existing = set(
            StoreMembershipPermission.objects.filter(
                membership=membership,
                code__in=selected,
            ).values_list("code", flat=True)
        )

        StoreMembershipPermission.objects.bulk_create(
            [
                StoreMembershipPermission(
                    membership=membership,
                    code=code,
                )
                for code in selected - existing
            ]
        )

        return self.get(request, *args, **kwargs)
