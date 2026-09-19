from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.core.permissions.platform import is_platform_owner
from apps.users.models import PlatformOwner


User = get_user_model()


class PlatformOwnerTests(TestCase):
    def test_platform_owner_is_recognized(self):
        user = User.objects.create_user(
            username="platform_owner_test",
            email="platform-owner@test.local",
            password="TestPassword123!",
        )

        PlatformOwner.objects.create(user=user)

        self.assertTrue(is_platform_owner(user))

    def test_normal_user_is_not_platform_owner(self):
        user = User.objects.create_user(
            username="normal_user_test",
            email="normal-user@test.local",
            password="TestPassword123!",
        )

        self.assertFalse(is_platform_owner(user))

    def test_inactive_platform_owner_is_not_recognized(self):
        user = User.objects.create_user(
            username="inactive_owner_test",
            email="inactive-owner@test.local",
            password="TestPassword123!",
        )

        PlatformOwner.objects.create(
            user=user,
            is_active=False,
        )

        self.assertFalse(is_platform_owner(user))

    def test_superuser_alone_is_not_platform_owner(self):
        user = User.objects.create_superuser(
            username="superuser_only_test",
            email="superuser-only@test.local",
            password="TestPassword123!",
        )

        self.assertFalse(is_platform_owner(user))

    def test_owner_can_create_store_within_limit(self):
        from apps.stores.models import Store
        from apps.core.permissions.platform import can_create_store

        user = User.objects.create_user(
            username="limited_owner",
            email="limited-owner@test.local",
            password="TestPassword123!",
        )

        PlatformOwner.objects.create(
            user=user,
            store_creation_limit=2,
        )

        Store.objects.create(
            owner=user,
            name="First Store",
            slug="first-limited-store",
        )

        self.assertTrue(can_create_store(user))


    def test_owner_cannot_create_store_at_limit(self):
        from apps.stores.models import Store
        from apps.core.permissions.platform import can_create_store

        user = User.objects.create_user(
            username="full_owner",
            email="full-owner@test.local",
            password="TestPassword123!",
        )

        PlatformOwner.objects.create(
            user=user,
            store_creation_limit=1,
        )

        Store.objects.create(
            owner=user,
            name="Only Store",
            slug="only-limited-store",
        )

        self.assertFalse(can_create_store(user))


    def test_non_owner_cannot_create_store(self):
        from apps.core.permissions.platform import can_create_store

        user = User.objects.create_user(
            username="regular_limit_user",
            email="regular-limit-user@test.local",
            password="TestPassword123!",
        )

        self.assertFalse(can_create_store(user))


    def test_inactive_owner_cannot_create_store(self):
        from apps.core.permissions.platform import can_create_store

        user = User.objects.create_user(
            username="inactive_limit_owner",
            email="inactive-limit-owner@test.local",
            password="TestPassword123!",
        )

        PlatformOwner.objects.create(
            user=user,
            is_active=False,
            store_creation_limit=5,
        )

        self.assertFalse(can_create_store(user))
