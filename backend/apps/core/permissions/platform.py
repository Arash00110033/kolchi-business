from rest_framework.permissions import BasePermission

from apps.users.models import PlatformOwner


def is_platform_owner(user):
    if not user or not user.is_authenticated:
        return False

    return PlatformOwner.objects.filter(
        user_id=user.id,
        is_active=True,
    ).exists()


class IsPlatformOwner(BasePermission):
    message = "Platform owner permission required."

    def has_permission(self, request, view):
        return is_platform_owner(request.user)

def can_create_store(user):
    if not user or not user.is_authenticated:
        return False

    owner = (
        PlatformOwner.objects
        .filter(
            user_id=user.id,
            is_active=True,
        )
        .first()
    )

    if not owner:
        return False

    from apps.stores.models import Store

    used = Store.objects.filter(owner_id=user.id).count()

    return used < owner.store_creation_limit
