from apps.stores.models import Store, StoreMembership


STORE_PERMISSION_DEFINITIONS = {
    "products": "Products",
    "categories": "Categories",
    "inventory": "Inventory",
    "orders": "Orders",
    "members": "Members",
    "appearance": "Appearance",
    "store_settings": "Store Settings",
}


def is_valid_store_permission(code):
    return code in STORE_PERMISSION_DEFINITIONS


def get_store_permissions(user, store):
    if not user or not user.is_authenticated or not store:
        return set()

    if not store.is_active:
        return set()

    if user.is_superuser or store.owner_id == user.id:
        return set(STORE_PERMISSION_DEFINITIONS)

    membership = (
        StoreMembership.objects
        .filter(
            store=store,
            user=user,
        )
        .prefetch_related("permissions")
        .first()
    )

    if not membership:
        return set()

    return {
        permission.code
        for permission in membership.permissions.all()
        if permission.code in STORE_PERMISSION_DEFINITIONS
    }


def has_store_permission(user, store, code):
    if not is_valid_store_permission(code):
        return False

    if not user or not user.is_authenticated or not store:
        return False

    if not store.is_active:
        return False

    if user.is_superuser or store.owner_id == user.id:
        return True

    membership = StoreMembership.objects.filter(
        store=store,
        user=user,
    ).first()

    if not membership:
        return False

    return membership.permissions.filter(code=code).exists()
