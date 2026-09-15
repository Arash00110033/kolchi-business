from apps.stores.models import Store, StoreMembership


def is_store_owner(user, store):
    return bool(
        user
        and user.is_authenticated
        and store
        and store.owner_id == user.id
    )


def get_store_role(user, store):
    if not user or not user.is_authenticated or not store:
        return None

    if store.owner_id == user.id:
        return "owner"

    membership = StoreMembership.objects.filter(
        store=store,
        user=user,
    ).only("role").first()

    return membership.role if membership else None


def can_manage_store_languages(user, store):
    return is_store_owner(user, store)

def can_manage_store(user, store):
    if not user or not user.is_authenticated or not store:
        return False

    if user.is_superuser:
        return True

    return get_store_role(user, store) in {
        "owner",
        StoreMembership.Role.ADMIN,
    }


def can_edit_store_content(user, store):
    if not user or not user.is_authenticated or not store:
        return False

    if user.is_superuser:
        return True

    return get_store_role(user, store) in {
        "owner",
        StoreMembership.Role.ADMIN,
        StoreMembership.Role.EDITOR,
    }


def can_access_store(user, store):
    if not user or not user.is_authenticated or not store:
        return False

    if user.is_superuser:
        return True

    return get_store_role(user, store) in {
        "owner",
        StoreMembership.Role.ADMIN,
        StoreMembership.Role.EDITOR,
    }
