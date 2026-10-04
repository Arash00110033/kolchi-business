from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.stores.models import Store, StoreMembership, StoreMembershipPermission
from apps.core.permissions.store_permissions import STORE_PERMISSION_DEFINITIONS


User = get_user_model()


class StorePermissionsAPITests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.owner = User.objects.create_user(
            username="permission-api-owner",
            email="permission-api-owner@test.local",
            password="StrongPass123!",
        )

        self.admin = User.objects.create_user(
            username="permission-api-admin",
            email="permission-api-admin@test.local",
            password="StrongPass123!",
        )

        self.editor = User.objects.create_user(
            username="permission-api-editor",
            email="permission-api-editor@test.local",
            password="StrongPass123!",
        )

        self.other_owner = User.objects.create_user(
            username="permission-api-other-owner",
            email="permission-api-other-owner@test.local",
            password="StrongPass123!",
        )

        self.store = Store.objects.create(
            owner=self.owner,
            name="Permission API Store",
            slug="permission-api-store",
        )

        self.other_store = Store.objects.create(
            owner=self.other_owner,
            name="Other Permission API Store",
            slug="other-permission-api-store",
        )

        self.admin_membership = StoreMembership.objects.create(
            store=self.store,
            user=self.admin,
            role=StoreMembership.Role.ADMIN,
        )

        StoreMembership.objects.create(
            store=self.store,
            user=self.editor,
            role=StoreMembership.Role.EDITOR,
        )

    def auth(self, user):
        self.client.force_authenticate(user=user)

    def test_owner_can_list_accessible_store(self):
        self.auth(self.owner)

        response = self.client.get(
            "/api/v1/stores/accessible/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(
            response.data["results"][0]["role"],
            "owner",
        )

    def test_admin_can_list_only_accessible_store(self):
        self.auth(self.admin)

        response = self.client.get(
            "/api/v1/stores/accessible/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(
            response.data["results"][0]["id"],
            self.store.id,
        )
        self.assertEqual(
            response.data["results"][0]["role"],
            StoreMembership.Role.ADMIN,
        )

    def test_owner_can_read_permissions(self):
        self.auth(self.owner)

        response = self.client.get(
            f"/api/v1/admin/stores/{self.store.id}/"
            f"members/{self.admin_membership.id}/permissions/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            len(response.data["permissions"]),
            len(STORE_PERMISSION_DEFINITIONS),
        )

    def test_owner_can_set_categories_permission(self):
        self.auth(self.owner)

        response = self.client.patch(
            f"/api/v1/admin/stores/{self.store.id}/"
            f"members/{self.admin_membership.id}/permissions/",
            {
                "permissions": [
                    "categories",
                    "products",
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        self.assertTrue(
            StoreMembershipPermission.objects.filter(
                membership=self.admin_membership,
                code="categories",
            ).exists()
        )

        self.assertTrue(
            StoreMembershipPermission.objects.filter(
                membership=self.admin_membership,
                code="products",
            ).exists()
        )

    def test_admin_cannot_manage_permissions(self):
        self.auth(self.admin)

        response = self.client.patch(
            f"/api/v1/admin/stores/{self.store.id}/"
            f"members/{self.admin_membership.id}/permissions/",
            {
                "permissions": ["categories"],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 403)

    def test_cross_store_permission_management_is_denied(self):
        other_membership = StoreMembership.objects.create(
            store=self.other_store,
            user=self.admin,
            role=StoreMembership.Role.ADMIN,
        )

        self.auth(self.owner)

        response = self.client.patch(
            f"/api/v1/admin/stores/{self.store.id}/"
            f"members/{other_membership.id}/permissions/",
            {
                "permissions": ["categories"],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 404)

    def test_invalid_permission_is_rejected(self):
        self.auth(self.owner)

        response = self.client.patch(
            f"/api/v1/admin/stores/{self.store.id}/"
            f"members/{self.admin_membership.id}/permissions/",
            {
                "permissions": ["categories", "invalid"],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
