from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.catalog.models import Category, Product
from apps.stores.models import Store, StoreMembership

from .models import Order, OrderItem


User = get_user_model()


class AdminOrderAPITests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.owner_a = User.objects.create_user(
            username="order_admin_owner_a",
            email="order-admin-owner-a@test.local",
            password="TestPassword123!",
        )

        self.owner_b = User.objects.create_user(
            username="order_admin_owner_b",
            email="order-admin-owner-b@test.local",
            password="TestPassword123!",
        )

        self.editor_a = User.objects.create_user(
            username="order_admin_editor_a",
            email="order-admin-editor-a@test.local",
            password="TestPassword123!",
        )

        self.customer = User.objects.create_user(
            username="order_customer",
            email="order-customer@test.local",
            password="TestPassword123!",
        )

        self.store_a = Store.objects.create(
            owner=self.owner_a,
            name="Order Store A",
            slug="order-store-a",
        )

        self.store_b = Store.objects.create(
            owner=self.owner_b,
            name="Order Store B",
            slug="order-store-b",
        )

        StoreMembership.objects.create(
            store=self.store_a,
            user=self.editor_a,
            role=StoreMembership.Role.EDITOR,
        )

        self.category = Category.objects.create(
            store=self.store_a,
            name="Coffee",
            slug="order-admin-coffee",
        )

        self.product = Product.objects.create(
            store=self.store_a,
            category=self.category,
            name="Order Coffee",
            slug="order-admin-coffee-product",
            price="100000.00",
            stock=10,
            is_active=True,
        )

        self.order = Order.objects.create(
            store=self.store_a,
            user=self.customer,
            status=Order.Status.PENDING,
            total="200000.00",
            shipping_address="Test address 123456",
            shipping_phone="09123333333",
        )

        OrderItem.objects.create(
            order=self.order,
            product=self.product,
            product_name=self.product.name,
            unit_price=self.product.price,
            quantity=2,
            subtotal="200000.00",
        )

    def auth(self, user):
        self.client.force_authenticate(user=user)

    def url(self, suffix=""):
        return (
            f"/api/v1/admin/stores/{self.store_a.id}/orders/"
            f"{suffix}"
        )

    def test_owner_can_list_orders(self):
        self.auth(self.owner_a)

        response = self.client.get(self.url())

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)

    def test_editor_can_list_orders(self):
        self.auth(self.editor_a)

        response = self.client.get(self.url())

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)

    def test_owner_can_view_order_detail(self):
        self.auth(self.owner_a)

        response = self.client.get(
            self.url(f"{self.order.id}/")
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.order.id)
        self.assertEqual(
            response.data["store"],
            self.store_a.id,
        )

    def test_editor_cannot_change_order_status(self):
        self.auth(self.editor_a)

        response = self.client.patch(
            self.url(f"{self.order.id}/status/"),
            {"status": Order.Status.CONFIRMED},
            format="json",
        )

        self.assertEqual(response.status_code, 403)

    def test_owner_can_confirm_order(self):
        self.auth(self.owner_a)

        response = self.client.patch(
            self.url(f"{self.order.id}/status/"),
            {"status": Order.Status.CONFIRMED},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["status"],
            Order.Status.CONFIRMED,
        )

    def test_invalid_transition_is_rejected(self):
        self.auth(self.owner_a)

        response = self.client.patch(
            self.url(f"{self.order.id}/status/"),
            {"status": Order.Status.DELIVERED},
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_cross_store_order_is_hidden(self):
        self.auth(self.owner_b)

        response = self.client.get(
            self.url(f"{self.order.id}/")
        )

        self.assertEqual(response.status_code, 404)

    def test_cross_store_status_change_is_forbidden(self):
        self.auth(self.owner_b)

        response = self.client.patch(
            self.url(f"{self.order.id}/status/"),
            {"status": Order.Status.CONFIRMED},
            format="json",
        )

        self.assertEqual(response.status_code, 403)

        self.order.refresh_from_db()

        self.assertEqual(
            self.order.status,
            Order.Status.PENDING,
        )

    def test_admin_cancel_restores_stock(self):
        self.auth(self.owner_a)

        self.product.stock = 8
        self.product.save(update_fields=["stock", "updated_at"])

        response = self.client.patch(
            self.url(f"{self.order.id}/status/"),
            {"status": Order.Status.CANCELLED},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["status"],
            Order.Status.CANCELLED,
        )

        self.product.refresh_from_db()

        self.assertEqual(self.product.stock, 10)

    def test_admin_cannot_change_total(self):
        self.auth(self.owner_a)

        response = self.client.patch(
            self.url(f"{self.order.id}/status/"),
            {
                "status": Order.Status.CONFIRMED,
                "total": "1.00",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

        self.order.refresh_from_db()

        self.assertEqual(
            str(self.order.total),
            "200000.00",
        )
