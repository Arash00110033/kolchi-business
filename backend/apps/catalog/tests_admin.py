from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.stores.models import Store, StoreMembership

from .models import Category, Product


User = get_user_model()


class AdminCatalogAPITests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.owner_a = User.objects.create_user(
            username="catalog_owner_a",
            email="catalog-owner-a@test.local",
            password="TestPassword123!",
        )

        self.owner_b = User.objects.create_user(
            username="catalog_owner_b",
            email="catalog-owner-b@test.local",
            password="TestPassword123!",
        )

        self.editor_a = User.objects.create_user(
            username="catalog_editor_a",
            email="catalog-editor-a@test.local",
            password="TestPassword123!",
        )

        self.store_a = Store.objects.create(
            owner=self.owner_a,
            name="Catalog Store A",
            slug="catalog-store-a",
        )

        self.store_b = Store.objects.create(
            owner=self.owner_b,
            name="Catalog Store B",
            slug="catalog-store-b",
        )

        StoreMembership.objects.create(
            store=self.store_a,
            user=self.editor_a,
            role=StoreMembership.Role.EDITOR,
        )

        self.category_a = Category.objects.create(
            store=self.store_a,
            name="Coffee",
            slug="coffee-admin-test",
        )

        self.product_a = Product.objects.create(
            store=self.store_a,
            category=self.category_a,
            name="Coffee Product",
            slug="coffee-admin-product",
            price="100000.00",
            stock=5,
        )

    def auth(self, user):
        self.client.force_authenticate(user=user)

    def test_owner_can_list_products(self):
        self.auth(self.owner_a)

        response = self.client.get(
            f"/api/v1/admin/stores/{self.store_a.id}/products/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)

    def test_owner_can_create_product(self):
        self.auth(self.owner_a)

        response = self.client.post(
            f"/api/v1/admin/stores/{self.store_a.id}/products/",
            {
                "category": self.category_a.id,
                "name": "New Product",
                "slug": "new-admin-product",
                "description": "Created by store owner.",
                "price": "250000.00",
                "stock": 10,
                "image_url": "",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            response.data["store"],
            self.store_a.id,
        )

    def test_editor_can_update_product(self):
        self.auth(self.editor_a)

        response = self.client.patch(
            f"/api/v1/admin/stores/{self.store_a.id}/products/{self.product_a.id}/",
            {"name": "Updated Product"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["name"],
            "Updated Product",
        )

    def test_cross_store_product_is_hidden(self):
        self.auth(self.owner_b)

        response = self.client.get(
            f"/api/v1/admin/stores/{self.store_b.id}/products/{self.product_a.id}/"
        )

        self.assertEqual(response.status_code, 404)

    def test_cross_store_category_cannot_be_used(self):
        category_b = Category.objects.create(
            store=self.store_b,
            name="Other",
            slug="other-admin-test",
        )

        self.auth(self.owner_a)

        response = self.client.post(
            f"/api/v1/admin/stores/{self.store_a.id}/products/",
            {
                "category": category_b.id,
                "name": "Invalid Product",
                "slug": "invalid-cross-store-product",
                "price": "100000.00",
                "stock": 1,
                "image_url": "",
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_editor_cannot_delete_product(self):
        self.auth(self.editor_a)

        response = self.client.delete(
            f"/api/v1/admin/stores/{self.store_a.id}/products/{self.product_a.id}/"
        )

        self.assertEqual(response.status_code, 403)

    def test_owner_can_delete_product(self):
        self.auth(self.owner_a)

        response = self.client.delete(
            f"/api/v1/admin/stores/{self.store_a.id}/products/{self.product_a.id}/"
        )

        self.assertEqual(response.status_code, 204)
