from django.contrib.auth import get_user_model
from django.test import TestCase

from rest_framework import status
from rest_framework.test import APIClient

from apps.catalog.models import Category, Product

from .models import WishlistItem


User = get_user_model()


class WishlistAPITestCase(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="wishlistuser",
            email="wishlistuser@example.com",
            password="StrongPass123!",
            phone_number="09123334444",
        )

        self.other_user = User.objects.create_user(
            username="otherwishlistuser",
            email="otherwishlistuser@example.com",
            password="StrongPass123!",
            phone_number="09123335555",
        )

        self.category = Category.objects.create(
            name="Wishlist Coffee",
            slug="wishlist-coffee",
        )

        self.product = Product.objects.create(
            category=self.category,
            name="Wishlist Product",
            slug="wishlist-product",
            description="Wishlist test product.",
            price="450000.00",
            stock=10,
            is_active=True,
        )

        self.inactive_product = Product.objects.create(
            category=self.category,
            name="Inactive Wishlist Product",
            slug="inactive-wishlist-product",
            description="Inactive wishlist test product.",
            price="500000.00",
            stock=10,
            is_active=False,
        )

        self.client.force_authenticate(user=self.user)

    def test_authenticated_user_can_add_product_to_wishlist(self):
        response = self.client.post(
            "/api/v1/wishlist/items/",
            {"product": self.product.id},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            WishlistItem.objects.filter(
                user=self.user,
                product=self.product,
            ).exists()
        )

    def test_wishlist_item_belongs_to_authenticated_user(self):
        response = self.client.post(
            "/api/v1/wishlist/items/",
            {"product": self.product.id},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        item = WishlistItem.objects.get(
            product=self.product,
        )

        self.assertEqual(
            item.user,
            self.user,
        )

        self.client.force_authenticate(user=self.other_user)

        response = self.client.get(
            "/api/v1/wishlist/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            0,
        )

    def test_user_cannot_access_another_users_wishlist_item(self):
        item = WishlistItem.objects.create(
            user=self.user,
            product=self.product,
        )

        self.client.force_authenticate(user=self.other_user)

        response = self.client.get(
            "/api/v1/wishlist/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            0,
        )

        response = self.client.delete(
            f"/api/v1/wishlist/items/{item.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertTrue(
            WishlistItem.objects.filter(
                id=item.id,
                user=self.user,
            ).exists()
        )

    def test_duplicate_wishlist_item_is_not_created(self):
        first_response = self.client.post(
            "/api/v1/wishlist/items/",
            {"product": self.product.id},
            format="json",
        )

        second_response = self.client.post(
            "/api/v1/wishlist/items/",
            {"product": self.product.id},
            format="json",
        )

        self.assertEqual(
            first_response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            second_response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            WishlistItem.objects.filter(
                user=self.user,
                product=self.product,
            ).count(),
            1,
        )

    def test_inactive_product_cannot_be_added_to_wishlist(self):
        response = self.client.post(
            "/api/v1/wishlist/items/",
            {"product": self.inactive_product.id},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertFalse(
            WishlistItem.objects.filter(
                user=self.user,
                product=self.inactive_product,
            ).exists()
        )

    def test_unauthenticated_user_cannot_access_wishlist(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(
            "/api/v1/wishlist/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_authenticated_user_can_remove_own_wishlist_item(self):
        item = WishlistItem.objects.create(
            user=self.user,
            product=self.product,
        )

        response = self.client.delete(
            f"/api/v1/wishlist/items/{item.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            WishlistItem.objects.filter(
                id=item.id,
            ).exists()
        )
