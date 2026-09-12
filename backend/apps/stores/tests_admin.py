from django.test import TestCase
from rest_framework.test import APIClient

from apps.stores.models import Store, StoreMembership
from apps.users.models import User


class AdminStoreAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.owner = User.objects.create_user(
            username="store-owner",
            email="store-owner@test.local",
            password="StrongPass123!",
        )

        self.admin = User.objects.create_user(
            username="store-admin",
            email="store-admin@test.local",
            password="StrongPass123!",
        )

        self.editor = User.objects.create_user(
            username="store-editor",
            email="store-editor@test.local",
            password="StrongPass123!",
        )

        self.other_user = User.objects.create_user(
            username="other-user",
            email="other-user@test.local",
            password="StrongPass123!",
        )

        self.store = Store.objects.create(
            owner=self.owner,
            name="Test Store",
            slug="test-store",
            description="Initial description",
        )

        StoreMembership.objects.create(
            store=self.store,
            user=self.admin,
            role=StoreMembership.Role.ADMIN,
        )

        StoreMembership.objects.create(
            store=self.store,
            user=self.editor,
            role=StoreMembership.Role.EDITOR,
        )

        self.other_store = Store.objects.create(
            owner=self.other_user,
            name="Other Store",
            slug="other-store",
        )

    def auth(self, user):
        self.client.force_authenticate(user=user)

    def test_owner_can_view_store(self):
        self.auth(self.owner)
        response = self.client.get(
            f"/api/v1/admin/stores/{self.store.id}/"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Test Store")

    def test_owner_can_update_store(self):
        self.auth(self.owner)
        response = self.client.patch(
            f"/api/v1/admin/stores/{self.store.id}/",
            {"name": "Updated Store"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.store.refresh_from_db()
        self.assertEqual(self.store.name, "Updated Store")

    def test_admin_can_update_store(self):
        self.auth(self.admin)
        response = self.client.patch(
            f"/api/v1/admin/stores/{self.store.id}/",
            {"description": "Updated description"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)

    def test_editor_can_view_but_not_update(self):
        self.auth(self.editor)

        get_response = self.client.get(
            f"/api/v1/admin/stores/{self.store.id}/"
        )
        self.assertEqual(get_response.status_code, 200)

        patch_response = self.client.patch(
            f"/api/v1/admin/stores/{self.store.id}/",
            {"name": "Forbidden"},
            format="json",
        )
        self.assertEqual(patch_response.status_code, 403)

    def test_unrelated_user_is_denied(self):
        self.auth(self.other_user)
        response = self.client.get(
            f"/api/v1/admin/stores/{self.store.id}/"
        )
        self.assertEqual(response.status_code, 403)

    def test_cross_store_update_is_denied(self):
        self.auth(self.owner)
        response = self.client.patch(
            f"/api/v1/admin/stores/{self.other_store.id}/",
            {"name": "Hacked"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_owner_cannot_be_changed(self):
        self.auth(self.owner)
        response = self.client.patch(
            f"/api/v1/admin/stores/{self.store.id}/",
            {"owner": self.other_user.id},
            format="json",
        )
        self.assertEqual(response.status_code, 200)

        self.store.refresh_from_db()
        self.assertEqual(self.store.owner_id, self.owner.id)

    def test_store_can_be_deactivated_and_reactivated(self):
        self.auth(self.owner)
        url = f"/api/v1/admin/stores/{self.store.id}/"

        response = self.client.patch(
            url,
            {"is_active": False},
            format="json",
        )
        self.assertEqual(response.status_code, 200)

        response = self.client.patch(
            url,
            {"is_active": True},
            format="json",
        )
        self.assertEqual(response.status_code, 200)

        self.store.refresh_from_db()
        self.assertTrue(self.store.is_active)

    def test_anonymous_user_is_rejected(self):
        response = self.client.get(
            f"/api/v1/admin/stores/{self.store.id}/"
        )
        self.assertEqual(response.status_code, 401)
