from django.contrib.auth import get_user_model
from django.test import TestCase

from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken


User = get_user_model()


class AuthenticationAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user_data = {
            "username": "testuser",
            "phone_number": "09120000000",
            "email": "test@example.com",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
        }

    def create_user(self):
        return User.objects.create_user(
            username=self.user_data["username"],
            phone_number=self.user_data["phone_number"],
            email=self.user_data["email"],
            password=self.user_data["password"],
        )

    def test_register_success(self):
        response = self.client.post(
            "/api/v1/auth/register/",
            self.user_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            User.objects.filter(
                username="testuser",
            ).exists()
        )

    def test_register_password_mismatch(self):
        data = self.user_data.copy()
        data["password_confirm"] = "DifferentPass123!"

        response = self.client.post(
            "/api/v1/auth/register/",
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_register_duplicate_username(self):
        self.create_user()

        data = self.user_data.copy()
        data["phone_number"] = "09121111111"
        data["email"] = "another@example.com"

        response = self.client.post(
            "/api/v1/auth/register/",
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_register_duplicate_phone(self):
        self.create_user()

        data = self.user_data.copy()
        data["username"] = "anotheruser"
        data["email"] = "another@example.com"

        response = self.client.post(
            "/api/v1/auth/register/",
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_register_duplicate_email(self):
        self.create_user()

        data = self.user_data.copy()
        data["username"] = "anotheruser"
        data["phone_number"] = "09121111111"

        response = self.client.post(
            "/api/v1/auth/register/",
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_login_success(self):
        self.create_user()

        response = self.client.post(
            "/api/v1/auth/login/",
            {
                "username": self.user_data["username"],
                "password": self.user_data["password"],
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_invalid_password(self):
        self.create_user()

        response = self.client.post(
            "/api/v1/auth/login/",
            {
                "username": self.user_data["username"],
                "password": "WrongPassword123!",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_login_inactive_user(self):
        user = self.create_user()
        user.is_active = False
        user.save(update_fields=["is_active"])

        response = self.client.post(
            "/api/v1/auth/login/",
            {
                "username": self.user_data["username"],
                "password": self.user_data["password"],
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_me_requires_authentication(self):
        response = self.client.get(
            "/api/v1/auth/me/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_me_with_authentication(self):
        user = self.create_user()

        refresh = RefreshToken.for_user(user)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}"
        )

        response = self.client.get(
            "/api/v1/auth/me/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["username"],
            user.username,
        )

    def test_refresh_token(self):
        user = self.create_user()

        refresh = RefreshToken.for_user(user)

        response = self.client.post(
            "/api/v1/auth/refresh/",
            {
                "refresh": str(refresh),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn("access", response.data)

    def test_logout_blacklists_refresh_token(self):
        user = self.create_user()

        refresh = RefreshToken.for_user(user)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}"
        )

        response = self.client.post(
            "/api/v1/auth/logout/",
            {
                "refresh": str(refresh),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        refresh_response = self.client.post(
            "/api/v1/auth/refresh/",
            {
                "refresh": str(refresh),
            },
            format="json",
        )

        self.assertEqual(
            refresh_response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )