from django.contrib.auth import get_user_model
from django.test import TestCase

from .models import Store, StoreMembership


User = get_user_model()


class StoreModelTests(TestCase):

    def setUp(self):
        self.owner = User.objects.create_user(
            username="store_owner_test",
            email="store-owner@test.local",
            password="TestPassword123!",
        )
        self.editor = User.objects.create_user(
            username="store_editor_test",
            email="store-editor@test.local",
            password="TestPassword123!",
        )

    def test_store_owner_relationship(self):
        store = Store.objects.create(
            owner=self.owner,
            name="Test Store",
            slug="test-store",
        )

        self.assertEqual(store.owner_id, self.owner.id)
        self.assertIn(store, self.owner.owned_stores.all())

    def test_store_membership_roles(self):
        store = Store.objects.create(
            owner=self.owner,
            name="Test Store",
            slug="test-store",
        )

        membership = StoreMembership.objects.create(
            store=store,
            user=self.editor,
            role=StoreMembership.Role.EDITOR,
        )

        self.assertEqual(membership.role, StoreMembership.Role.EDITOR)
        self.assertEqual(membership.store_id, store.id)
        self.assertEqual(membership.user_id, self.editor.id)

    def test_duplicate_membership_is_blocked(self):
        store = Store.objects.create(
            owner=self.owner,
            name="Test Store",
            slug="test-store",
        )

        StoreMembership.objects.create(
            store=store,
            user=self.editor,
            role=StoreMembership.Role.ADMIN,
        )

        with self.assertRaises(Exception):
            StoreMembership.objects.create(
                store=store,
                user=self.editor,
                role=StoreMembership.Role.EDITOR,
            )
