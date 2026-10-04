from django.test import TestCase

from apps.users.models import User
from apps.stores.models import Store, StoreMembership, StoreMembershipPermission
from apps.core.permissions.store_permissions import (
    STORE_PERMISSION_DEFINITIONS,
    get_store_permissions,
    has_store_permission,
)


class StorePermissionTests(TestCase):

    def setUp(self):
        self.owner = User.objects.create_user(
            username="permission-owner",
            email="permission-owner@test.local",
            password="StrongPass123!",
        )

        self.admin = User.objects.create_user(
            username="permission-admin",
            email="permission-admin@test.local",
            password="StrongPass123!",
        )

        self.editor = User.objects.create_user(
            username="permission-editor",
            email="permission-editor@test.local",
            password="StrongPass123!",
        )

        self.other_owner = User.objects.create_user(
            username="permission-other-owner",
            email="permission-other-owner@test.local",
            password="StrongPass123!",
        )

        self.store = Store.objects.create(
            owner=self.owner,
            name="Permission Store",
            slug="permission-store",
        )

        self.other_store = Store.objects.create(
            owner=self.other_owner,
            name="Other Permission Store",
            slug="other-permission-store",
        )

        self.admin_membership = StoreMembership.objects.create(
            store=self.store,
            user=self.admin,
            role=StoreMembership.Role.ADMIN,
        )

        self.editor_membership = StoreMembership.objects.create(
            store=self.store,
            user=self.editor,
            role=StoreMembership.Role.EDITOR,
        )

    def test_permission_catalog_is_modular(self):
        self.assertIn("products", STORE_PERMISSION_DEFINITIONS)
        self.assertIn("orders", STORE_PERMISSION_DEFINITIONS)
        self.assertIn("inventory", STORE_PERMISSION_DEFINITIONS)

    def test_owner_has_all_permissions(self):
        self.assertTrue(
            has_store_permission(
                self.owner,
                self.store,
                "products",
            )
        )
        self.assertEqual(
            get_store_permissions(self.owner, self.store),
            set(STORE_PERMISSION_DEFINITIONS),
        )

    def test_admin_without_permission_is_denied(self):
        self.assertFalse(
            has_store_permission(
                self.admin,
                self.store,
                "products",
            )
        )

    def test_admin_with_permission_is_allowed(self):
        StoreMembershipPermission.objects.create(
            membership=self.admin_membership,
            code="products",
        )

        self.assertTrue(
            has_store_permission(
                self.admin,
                self.store,
                "products",
            )
        )

        self.assertFalse(
            has_store_permission(
                self.admin,
                self.store,
                "orders",
            )
        )

    def test_permissions_are_store_scoped(self):
        StoreMembershipPermission.objects.create(
            membership=self.admin_membership,
            code="products",
        )

        other_membership = StoreMembership.objects.create(
            store=self.other_store,
            user=self.admin,
            role=StoreMembership.Role.ADMIN,
        )

        StoreMembershipPermission.objects.create(
            membership=other_membership,
            code="orders",
        )

        self.assertTrue(
            has_store_permission(
                self.admin,
                self.store,
                "products",
            )
        )

        self.assertFalse(
            has_store_permission(
                self.admin,
                self.store,
                "orders",
            )
        )

        self.assertTrue(
            has_store_permission(
                self.admin,
                self.other_store,
                "orders",
            )
        )

    def test_editor_uses_same_permission_engine(self):
        StoreMembershipPermission.objects.create(
            membership=self.editor_membership,
            code="categories",
        )

        self.assertTrue(
            has_store_permission(
                self.editor,
                self.store,
                "categories",
            )
        )

    def test_invalid_permission_is_denied(self):
        self.assertFalse(
            has_store_permission(
                self.admin,
                self.store,
                "not_a_real_permission",
            )
        )

    def test_inactive_store_is_denied(self):
        StoreMembershipPermission.objects.create(
            membership=self.admin_membership,
            code="products",
        )

        self.store.is_active = False
        self.store.save(update_fields=["is_active"])

        self.assertFalse(
            has_store_permission(
                self.admin,
                self.store,
                "products",
            )
        )