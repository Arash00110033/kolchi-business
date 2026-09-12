from django.shortcuts import get_object_or_404

from rest_framework import generics, permissions

from apps.core.permissions.store import (
    can_access_store,
    can_manage_store,
)

from .admin_serializers import AdminStoreSerializer
from .models import Store


class AdminStoreDetailAPIView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = AdminStoreSerializer
    http_method_names = ["get", "patch", "options"]

    def get_store(self):
        return get_object_or_404(
            Store,
            pk=self.kwargs["store_id"],
        )

    def get_object(self):
        store = self.get_store()

        if not can_access_store(self.request.user, store):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "You do not have permission for this store."
            )

        return store

    def update(self, request, *args, **kwargs):
        store = self.get_store()

        if not can_manage_store(self.request.user, store):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "You do not have permission to manage this store."
            )

        return super().update(request, *args, **kwargs)
