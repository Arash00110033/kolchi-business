from django.contrib.auth import get_user_model

from rest_framework import generics, permissions
from rest_framework.response import Response

from apps.core.permissions.platform import (
    can_create_store,
    is_platform_owner,
)
from apps.stores.models import Store
from apps.users.models import PlatformOwner

from .owner_store_serializers import OwnerStoreCreateSerializer
from .serializers import OwnerStoreSerializer


User = get_user_model()


class PlatformOwnerRequired(permissions.BasePermission):
    message = "Platform owner permission required."

    def has_permission(self, request, view):
        return is_platform_owner(request.user)


class OwnerMeAPIView(generics.GenericAPIView):
    permission_classes = (PlatformOwnerRequired,)

    def get(self, request):
        owner = PlatformOwner.objects.select_related("user").get(
            user_id=request.user.id,
            is_active=True,
        )

        return Response(
            {
                "id": owner.user_id,
                "username": owner.user.username,
                "email": owner.user.email,
                "is_active": owner.is_active,
            }
        )


class OwnerOverviewAPIView(generics.GenericAPIView):
    permission_classes = (PlatformOwnerRequired,)

    def get(self, request):
        return Response(
            {
                "stores": {
                    "total": Store.objects.count(),
                    "active": Store.objects.filter(is_active=True).count(),
                },
                "users": {
                    "total": User.objects.count(),
                    "staff": User.objects.filter(is_staff=True).count(),
                },
                "platform_owner": {
                    "id": request.user.id,
                    "username": request.user.username,
                },
            }
        )


class OwnerStoreListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = (PlatformOwnerRequired,)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return OwnerStoreCreateSerializer
        return OwnerStoreSerializer

    def get_queryset(self):
        return Store.objects.select_related("owner").all()

    def create(self, request, *args, **kwargs):
        if not can_create_store(request.user):
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied(
                "Store creation limit reached."
            )

        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class OwnerStoreDetailAPIView(generics.RetrieveUpdateAPIView):
    permission_classes = (PlatformOwnerRequired,)
    serializer_class = OwnerStoreSerializer
    queryset = Store.objects.select_related("owner").all()
    http_method_names = ["get", "patch", "options"]
