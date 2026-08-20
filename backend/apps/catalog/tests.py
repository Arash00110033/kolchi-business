from django.test import TestCase
from rest_framework.test import APIClient

from .models import Category, Product


class CatalogAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.coffee = Category.objects.create(
            name="Coffee",
            slug="coffee",
            description="Coffee products",
            is_active=True,
        )

        self.mugs = Category.objects.create(
            name="Mugs",
            slug="mugs",
            description="Mugs and drinkware products",
            is_active=True,
        )

        self.product_cheap = Product.objects.create(
            category=self.coffee,
            name="Ethiopian",
            slug="ethiopian",
            description="Premium Ethiopian coffee beans.",
            price="450000.00",
            stock=9,
            image_url="https://example.com/ethiopian.jpg",
            is_active=True,
        )

        self.product_expensive = Product.objects.create(
            category=self.mugs,
            name="Premium Mug",
            slug="premium-mug",
            description="Premium ceramic mug.",
            price="850000.00",
            stock=5,
            image_url="https://example.com/mug.jpg",
            is_active=True,
        )

        self.inactive_product = Product.objects.create(
            category=self.coffee,
            name="Inactive Coffee",
            slug="inactive-coffee",
            description="This product should not be public.",
            price="300000.00",
            stock=10,
            is_active=False,
        )

    def test_categories_endpoint(self):
        response = self.client.get("/api/v1/categories/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)

    def test_products_endpoint(self):
        response = self.client.get("/api/v1/products/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)

    def test_product_detail_endpoint(self):
        response = self.client.get(
            f"/api/v1/products/{self.product_cheap.id}/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Ethiopian")

    def test_inactive_product_is_not_public(self):
        response = self.client.get("/api/v1/products/")

        product_names = [
            product["name"]
            for product in response.data["results"]
        ]

        self.assertNotIn("Inactive Coffee", product_names)

    def test_search_filter(self):
        response = self.client.get(
            "/api/v1/products/?query=Ethiopian"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(
            response.data["results"][0]["name"],
            "Ethiopian",
        )

    def test_category_filter(self):
        response = self.client.get(
            "/api/v1/products/?category=mugs"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(
            response.data["results"][0]["name"],
            "Premium Mug",
        )

    def test_price_ascending_sort(self):
        response = self.client.get(
            "/api/v1/products/?sort=price_asc"
        )

        self.assertEqual(response.status_code, 200)

        prices = [
            product["price"]
            for product in response.data["results"]
        ]

        self.assertEqual(
            prices,
            ["450000.00", "850000.00"],
        )

    def test_price_descending_sort(self):
        response = self.client.get(
            "/api/v1/products/?sort=price_desc"
        )

        self.assertEqual(response.status_code, 200)

        prices = [
            product["price"]
            for product in response.data["results"]
        ]

        self.assertEqual(
            prices,
            ["850000.00", "450000.00"],
        )

    def test_invalid_sort_returns_bad_request(self):
        response = self.client.get(
            "/api/v1/products/?sort=invalid"
        )

        self.assertEqual(response.status_code, 400)

    def test_pagination(self):
        response = self.client.get("/api/v1/products/")

        self.assertEqual(response.status_code, 200)
        self.assertIn("count", response.data)
        self.assertIn("next", response.data)
        self.assertIn("previous", response.data)
        self.assertIn("results", response.data)
