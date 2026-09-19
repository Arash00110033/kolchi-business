from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from apps.stores.models import Store
from apps.users.models import PlatformOwner


User = get_user_model()


class OwnerControlFoundationTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            username="owner_foundation",
            email="owner-foundation@test.local",
            password="TestPassword123!",
        )
        PlatformOwner.objects.create(user=self.owner)

        self.normal_user = User.objects.create_user(
            username="normal_foundation",
            email="normal-foundation@test.local",
            password="TestPassword123!",
        )

    def test_owner_me_requires_platform_owner(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.get(reverse("owner-me"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "owner_foundation")

    def test_normal_user_cannot_access_owner_me(self):
        self.client.force_authenticate(user=self.normal_user)

        response = self.client.get(reverse("owner-me"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_user_cannot_access_owner_me(self):
        response = self.client.get(reverse("owner-me"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_owner_overview(self):
        Store.objects.create(
            owner=self.owner,
            name="Owner Test Store",
            slug="owner-test-store",
            default_locale="fa",
            enabled_locales=["fa"],
        )

        self.client.force_authenticate(user=self.owner)

        response = self.client.get(reverse("owner-overview"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["stores"]["total"], 1)
        self.assertEqual(response.data["stores"]["active"], 1)
