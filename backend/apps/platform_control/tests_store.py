from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from apps.stores.models import Store
from apps.users.models import PlatformOwner


User = get_user_model()


class OwnerStoreManagementTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            username="store_owner_test",
            email="store-owner@test.local",
            password="TestPassword123!",
        )
        PlatformOwner.objects.create(user=self.owner)

        self.normal_user = User.objects.create_user(
            username="normal_store_test",
            email="normal-store@test.local",
            password="TestPassword123!",
        )

        self.store = Store.objects.create(
            owner=self.owner,
            name="Owner Store",
            slug="owner-store-test",
            description="Initial description",
            default_locale="fa",
            enabled_locales=["fa"],
            is_active=True,
        )

        self.second_store = Store.objects.create(
            owner=self.owner,
            name="Second Store",
            slug="second-store-test",
            description="Second description",
            default_locale="fa",
            enabled_locales=["fa"],
            is_active=False,
        )

    def test_owner_can_list_all_stores(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.get(reverse("owner-stores"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        if isinstance(data, dict) and "results" in data:
            data = data["results"]

        self.assertEqual(len(data), 2)

        store_ids = {item["id"] for item in data}
        self.assertEqual(
            store_ids,
            {self.store.id, self.second_store.id},
        )

    def test_owner_can_view_store(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.get(
            reverse(
                "owner-store-detail",
                kwargs={"pk": self.store.id},
            )
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.store.id)
        self.assertEqual(response.data["name"], "Owner Store")

    def test_owner_can_update_store(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.patch(
            reverse(
                "owner-store-detail",
                kwargs={"pk": self.store.id},
            ),
            {
                "name": "Updated Owner Store",
                "description": "Updated description",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.store.refresh_from_db()

        self.assertEqual(self.store.name, "Updated Owner Store")
        self.assertEqual(
            self.store.description,
            "Updated description",
        )

    def test_owner_can_activate_and_deactivate_store(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.patch(
            reverse(
                "owner-store-detail",
                kwargs={"pk": self.store.id},
            ),
            {"is_active": False},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.store.refresh_from_db()
        self.assertFalse(self.store.is_active)

        response = self.client.patch(
            reverse(
                "owner-store-detail",
                kwargs={"pk": self.store.id},
            ),
            {"is_active": True},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.store.refresh_from_db()
        self.assertTrue(self.store.is_active)

    def test_owner_cannot_change_store_owner(self):
        another_user = User.objects.create_user(
            username="another_owner_target",
            email="another-owner-target@test.local",
            password="TestPassword123!",
        )

        self.client.force_authenticate(user=self.owner)

        response = self.client.patch(
            reverse(
                "owner-store-detail",
                kwargs={"pk": self.store.id},
            ),
            {"owner": another_user.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.store.refresh_from_db()

        self.assertEqual(self.store.owner_id, self.owner.id)

    def test_normal_user_cannot_access_owner_store_list(self):
        self.client.force_authenticate(user=self.normal_user)

        response = self.client.get(reverse("owner-stores"))

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_normal_user_cannot_access_owner_store_detail(self):
        self.client.force_authenticate(user=self.normal_user)

        response = self.client.get(
            reverse(
                "owner-store-detail",
                kwargs={"pk": self.store.id},
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_unauthenticated_user_gets_401(self):
        response = self.client.get(reverse("owner-stores"))

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )


from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from apps.stores.models import Store
from apps.users.models import PlatformOwner


class OwnerStoreCreationTests(APITestCase):
    def setUp(self):
        self.User = get_user_model()
        self.client = APIClient()
        self.url = "/api/v1/owner/stores/"

    def make_user(self, username):
        return self.User.objects.create_user(
            username=username,
            email=f"{username}@example.com",
            password="TestPass123!",
        )

    def make_owner(self, username, limit=5, active=True):
        user = self.make_user(username)

        PlatformOwner.objects.create(
            user=user,
            store_creation_limit=limit,
            is_active=active,
        )

        return user

    def test_owner_can_create_store_within_limit(self):
        owner = self.make_owner("creation_owner_1", limit=2)
        self.client.force_authenticate(user=owner)

        response = self.client.post(
            self.url,
            {
                "name": "Created Store",
                "slug": "created-store",
                "description": "Test store",
                "default_locale": "fa",
                "enabled_locales": ["fa"],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        store = Store.objects.get(slug="created-store")
        self.assertEqual(store.owner_id, owner.id)
        self.assertTrue(store.is_active)

    def test_owner_cannot_create_store_at_limit(self):
        owner = self.make_owner("creation_owner_2", limit=1)

        Store.objects.create(
            owner=owner,
            name="Existing Store",
            slug="existing-store",
            default_locale="fa",
            enabled_locales=["fa"],
        )

        self.client.force_authenticate(user=owner)

        response = self.client.post(
            self.url,
            {
                "name": "Blocked Store",
                "slug": "blocked-store",
                "default_locale": "fa",
                "enabled_locales": ["fa"],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(
            Store.objects.filter(slug="blocked-store").exists()
        )

    def test_non_owner_cannot_create_store(self):
        user = self.make_user("creation_user_1")
        self.client.force_authenticate(user=user)

        response = self.client.post(
            self.url,
            {
                "name": "Unauthorized Store",
                "slug": "unauthorized-store",
                "default_locale": "fa",
                "enabled_locales": ["fa"],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_inactive_owner_cannot_create_store(self):
        owner = self.make_owner(
            "creation_owner_3",
            limit=5,
            active=False,
        )
        self.client.force_authenticate(user=owner)

        response = self.client.post(
            self.url,
            {
                "name": "Inactive Owner Store",
                "slug": "inactive-owner-store",
                "default_locale": "fa",
                "enabled_locales": ["fa"],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_cannot_override_owner_from_request_body(self):
        owner = self.make_owner("creation_owner_4", limit=1)
        another_user = self.make_user("creation_other_1")

        self.client.force_authenticate(user=owner)

        response = self.client.post(
            self.url,
            {
                "owner": another_user.id,
                "name": "Owner Protected Store",
                "slug": "owner-protected-store",
                "default_locale": "fa",
                "enabled_locales": ["fa"],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        store = Store.objects.get(slug="owner-protected-store")
        self.assertEqual(store.owner_id, owner.id)

    def test_duplicate_slug_is_rejected(self):
        owner = self.make_owner("creation_owner_5", limit=2)

        Store.objects.create(
            owner=owner,
            name="Existing Slug Store",
            slug="duplicate-slug",
            default_locale="fa",
            enabled_locales=["fa"],
        )

        self.client.force_authenticate(user=owner)

        response = self.client.post(
            self.url,
            {
                "name": "Duplicate Slug Store",
                "slug": "duplicate-slug",
                "default_locale": "fa",
                "enabled_locales": ["fa"],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
