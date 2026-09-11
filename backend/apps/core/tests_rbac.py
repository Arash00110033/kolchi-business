from django.test import SimpleTestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from apps.core.permissions import IsStoreAdmin

User = get_user_model()


class IsStoreAdminTests(SimpleTestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.permission = IsStoreAdmin()

    def check(self, user):
        request = self.factory.get("/test/")
        request.user = user
        return self.permission.has_permission(request, None)

    def test_normal_user_denied(self):
        user = User(
            username="normal",
            is_staff=False,
            is_superuser=False,
        )
        self.assertFalse(self.check(user))

    def test_staff_user_allowed(self):
        user = User(
            username="staff",
            is_staff=True,
            is_superuser=False,
        )
        self.assertTrue(self.check(user))

    def test_superuser_allowed(self):
        user = User(
            username="super",
            is_staff=False,
            is_superuser=True,
        )
        self.assertTrue(self.check(user))

    def test_anonymous_denied(self):
        request = self.factory.get("/test/")
        request.user = type(
            "AnonymousUser",
            (),
            {
                "is_authenticated": False,
                "is_staff": False,
                "is_superuser": False,
            },
        )()
        self.assertFalse(self.permission.has_permission(request, None))
