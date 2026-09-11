from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.catalog.models import Category, Product
from apps.core.permissions.store import (
    can_access_store,
    can_edit_store_content,
    can_manage_store,
    get_store_role,
    is_store_owner,
)
from apps.stores.models import Store, StoreMembership


User = get_user_model()


class StoreRBACTests(TestCase):

    def setUp(self):
        self.owner_a = User.objects.create_user(
            username="owner_a",
            email="owner-a@test.local",
            password="TestPassword123!",
        )

        self.admin_a = User.objects.create_user(
            username="admin_a",
            email="admin-a@test.local",
            password="TestPassword123!",
        )

        self.editor_a = User.objects.create_user(
            username="editor_a",
            email="editor-a@test.local",
            password="TestPassword123!",
        )

        self.staff_b = User.objects.create_user(
            username="staff_b",
            email="staff-b@test.local",
            password="TestPassword123!",
            is_staff=True,
        )

        self.owner_b = User.objects.create_user(
            username="owner_b",
            email="owner-b@test.local",
            password="TestPassword123!",
        )

        self.store_a = Store.objects.create(
            owner=self.owner_a,
            name="Store A",
            slug="store-a",
        )

        self.store_b = Store.objects.create(
            owner=self.owner_b,
            name="Store B",
            slug="store-b",
        )

        StoreMembership.objects.create(
            store=self.store_a,
            user=self.admin_a,
            role=StoreMembership.Role.ADMIN,
        )

        StoreMembership.objects.create(
            store=self.store_a,
            user=self.editor_a,
            role=StoreMembership.Role.EDITOR,
        )

    def test_owner_has_full_store_management(self):
        self.assertTrue(is_store_owner(self.owner_a, self.store_a))
        self.assertEqual(get_store_role(self.owner_a, self.store_a), "owner")
        self.assertTrue(can_manage_store(self.owner_a, self.store_a))
        self.assertTrue(can_edit_store_content(self.owner_a, self.store_a))

    def test_admin_can_manage_own_store(self):
        self.assertEqual(
            get_store_role(self.admin_a, self.store_a),
            StoreMembership.Role.ADMIN,
        )
        self.assertTrue(can_manage_store(self.admin_a, self.store_a))

    def test_editor_can_edit_but_not_manage(self):
        self.assertTrue(
            can_edit_store_content(self.editor_a, self.store_a)
        )
        self.assertFalse(
            can_manage_store(self.editor_a, self.store_a)
        )

    def test_staff_without_membership_is_denied(self):
        self.assertFalse(can_access_store(self.staff_b, self.store_a))
        self.assertFalse(can_manage_store(self.staff_b, self.store_a))

    def test_cross_store_isolation(self):
        self.assertFalse(can_access_store(self.admin_a, self.store_b))
        self.assertFalse(can_manage_store(self.admin_a, self.store_b))
        self.assertFalse(can_edit_store_content(self.editor_a, self.store_b))

    def test_owner_of_another_store_is_denied(self):
        self.assertTrue(can_manage_store(self.owner_b, self.store_b))
        self.assertFalse(can_manage_store(self.owner_b, self.store_a))

    def test_anonymous_is_denied(self):
        self.assertFalse(can_access_store(None, self.store_a))
        self.assertFalse(can_manage_store(None, self.store_a))

    def test_superuser_has_global_management(self):
        superuser = User.objects.create_superuser(
            username="global_admin",
            email="global-admin@test.local",
            password="TestPassword123!",
        )

        self.assertTrue(can_manage_store(superuser, self.store_a))
        self.assertTrue(can_manage_store(superuser, self.store_b))
