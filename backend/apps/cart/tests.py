from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.catalog.models import Category, Product

from .models import Cart


User = get_user_model()


class CartAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="cartuser",
            email="cartuser@example.com",
            phone_number="09121111111",
            password="TestPass123!",
        )

        self.category = Category.objects.create(
            name="Coffee",
            slug="coffee",
        )

        self.product = Product.objects.create(
            category=self.category,
            name="Ethiopian",
            slug="ethiopian",
            description="Premium Ethiopian coffee.",
            price="450000.00",
            stock=9,
            is_active=True,
        )

        self.client.force_authenticate(user=self.user)

    def test_get_cart_creates_cart(self):
        response = self.client.get("/api/v1/cart/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["items"], [])
        self.assertEqual(response.data["total"], 0)

        self.assertTrue(
            Cart.objects.filter(user=self.user).exists()
        )

    def test_add_product_to_cart(self):
        response = self.client.post(
            "/api/v1/cart/items/",
            {
                "product": self.product.id,
                "quantity": 2,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(response.data["items"]), 1)
        self.assertEqual(
            response.data["items"][0]["quantity"],
            2,
        )
        self.assertEqual(
            response.data["items"][0]["subtotal"],
            900000.0,
        )
        self.assertEqual(
            response.data["total"],
            900000.0,
        )

    def test_add_same_product_increases_quantity(self):
        self.client.post(
            "/api/v1/cart/items/",
            {
                "product": self.product.id,
                "quantity": 2,
            },
            format="json",
        )

        response = self.client.post(
            "/api/v1/cart/items/",
            {
                "product": self.product.id,
                "quantity": 2,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["items"][0]["quantity"],
            4,
        )
        self.assertEqual(
            response.data["items"][0]["subtotal"],
            1800000.0,
        )

    def test_add_product_exceeding_stock(self):
        response = self.client.post(
            "/api/v1/cart/items/",
            {
                "product": self.product.id,
                "quantity": 10,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.data["detail"],
            "Insufficient stock.",
        )

    def test_add_inactive_product_fails(self):
        self.product.is_active = False
        self.product.save(
            update_fields=["is_active"]
        )

        response = self.client.post(
            "/api/v1/cart/items/",
            {
                "product": self.product.id,
                "quantity": 1,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 404)

    def test_add_without_product_fails(self):
        response = self.client.post(
            "/api/v1/cart/items/",
            {
                "quantity": 1,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_add_with_invalid_quantity_fails(self):
        response = self.client.post(
            "/api/v1/cart/items/",
            {
                "product": self.product.id,
                "quantity": 0,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_update_cart_item_quantity(self):
        self.client.post(
            "/api/v1/cart/items/",
            {
                "product": self.product.id,
                "quantity": 2,
            },
            format="json",
        )

        item = self.user.cart.items.first()

        response = self.client.patch(
            f"/api/v1/cart/items/{item.id}/",
            {
                "quantity": 3,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["items"][0]["quantity"],
            3,
        )
        self.assertEqual(
            response.data["total"],
            1350000.0,
        )

    def test_delete_cart_item(self):
        self.client.post(
            "/api/v1/cart/items/",
            {
                "product": self.product.id,
                "quantity": 2,
            },
            format="json",
        )

        item = self.user.cart.items.first()

        response = self.client.delete(
            f"/api/v1/cart/items/{item.id}/delete/",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["items"],
            [],
        )
        self.assertEqual(
            response.data["total"],
            0,
        )

    def test_clear_cart(self):
        self.client.post(
            "/api/v1/cart/items/",
            {
                "product": self.product.id,
                "quantity": 2,
            },
            format="json",
        )

        response = self.client.delete(
            "/api/v1/cart/clear/",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["items"],
            [],
        )
        self.assertEqual(
            response.data["total"],
            0,
        )
        self.assertTrue(
            Cart.objects.filter(user=self.user).exists()
        )

    def test_update_cart_item_exceeding_stock_fails(self):
        self.client.post(
            "/api/v1/cart/items/",
            {
                "product": self.product.id,
                "quantity": 2,
            },
            format="json",
        )

        item = self.user.cart.items.first()

        response = self.client.patch(
            f"/api/v1/cart/items/{item.id}/",
            {
                "quantity": 10,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.data["detail"],
            "Insufficient stock.",
        )

    def test_user_cannot_update_another_users_cart_item(self):
        self.client.post(
            "/api/v1/cart/items/",
            {
                "product": self.product.id,
                "quantity": 2,
            },
            format="json",
        )

        item = self.user.cart.items.first()

        another_user = User.objects.create_user(
            username="anotheruser",
            email="another@example.com",
            phone_number="09122222222",
            password="TestPass123!",
        )

        self.client.force_authenticate(user=another_user)

        response = self.client.patch(
            f"/api/v1/cart/items/{item.id}/",
            {
                "quantity": 3,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 404)

    def test_user_cannot_delete_another_users_cart_item(self):
        self.client.post(
            "/api/v1/cart/items/",
            {
                "product": self.product.id,
                "quantity": 2,
            },
            format="json",
        )

        item = self.user.cart.items.first()

        another_user = User.objects.create_user(
            username="anotheruser",
            email="another@example.com",
            phone_number="09122222222",
            password="TestPass123!",
        )

        self.client.force_authenticate(user=another_user)

        response = self.client.delete(
            f"/api/v1/cart/items/{item.id}/delete/",
        )

        self.assertEqual(response.status_code, 404)

    def test_cart_requires_authentication(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(
            "/api/v1/cart/"
        )

        self.assertEqual(
            response.status_code,
            401,
        )