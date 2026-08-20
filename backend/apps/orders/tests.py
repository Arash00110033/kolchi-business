from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.cart.models import Cart, CartItem
from apps.catalog.models import Category, Product

from .models import Order, OrderItem


User = get_user_model()


class OrderAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="orderuser",
            email="orderuser@example.com",
            phone_number="09123333333",
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

        self.client.force_authenticate(
            user=self.user,
        )

    def test_get_orders_returns_empty_list(self):
        response = self.client.get(
            "/api/v1/orders/",
        )

        self.assertEqual(
            response.status_code,
            200,
        )
        self.assertEqual(
            response.data["results"],
            [],
        )

    def test_create_order_from_cart(self):
        cart = Cart.objects.create(
            user=self.user,
        )

        CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=2,
        )

        response = self.client.post(
            "/api/v1/orders/",
        )

        self.assertEqual(
            response.status_code,
            201,
        )

        self.assertEqual(
            response.data["status"],
            Order.Status.PENDING,
        )

        self.assertEqual(
            response.data["total"],
            "900000.00",
        )

        self.assertEqual(
            len(response.data["items"]),
            1,
        )

        self.assertEqual(
            response.data["items"][0]["quantity"],
            2,
        )

        self.product.refresh_from_db()

        self.assertEqual(
            self.product.stock,
            7,
        )

        self.assertEqual(
            cart.items.count(),
            0,
        )

        self.assertEqual(
            Order.objects.filter(
                user=self.user,
            ).count(),
            1,
        )

    def test_create_order_with_empty_cart_fails(self):
        Cart.objects.create(
            user=self.user,
        )

        response = self.client.post(
            "/api/v1/orders/",
        )

        self.assertEqual(
            response.status_code,
            400,
        )

        self.assertEqual(
            response.data["detail"],
            "Cart is empty.",
        )

    def test_create_order_with_insufficient_stock_fails(self):
        cart = Cart.objects.create(
            user=self.user,
        )

        CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=10,
        )

        response = self.client.post(
            "/api/v1/orders/",
        )

        self.assertEqual(
            response.status_code,
            400,
        )

        self.assertIn(
            "Insufficient stock",
            response.data["detail"],
        )

        self.assertFalse(
            Order.objects.filter(
                user=self.user,
            ).exists()
        )

    def test_get_order_detail(self):
        order = Order.objects.create(
            user=self.user,
            total="900000.00",
        )

        OrderItem.objects.create(
            order=order,
            product=self.product,
            product_name=self.product.name,
            unit_price=self.product.price,
            quantity=2,
            subtotal="900000.00",
        )

        response = self.client.get(
            f"/api/v1/orders/{order.id}/",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            response.data["id"],
            order.id,
        )

        self.assertEqual(
            response.data["total"],
            "900000.00",
        )

        self.assertEqual(
            len(response.data["items"]),
            1,
        )

    def test_user_cannot_access_another_users_order(self):
        order = Order.objects.create(
            user=self.user,
            total="900000.00",
        )

        another_user = User.objects.create_user(
            username="anotherorderuser",
            email="anotherorder@example.com",
            phone_number="09124444444",
            password="TestPass123!",
        )

        self.client.force_authenticate(
            user=another_user,
        )

        response = self.client.get(
            f"/api/v1/orders/{order.id}/",
        )

        self.assertEqual(
            response.status_code,
            404,
        )

    def test_orders_require_authentication(self):
        self.client.force_authenticate(
            user=None,
        )

        response = self.client.get(
            "/api/v1/orders/",
        )

        self.assertEqual(
            response.status_code,
            401,
        )


class OrderModelTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="orderuser",
            email="orderuser@example.com",
            phone_number="09123333333",
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

        self.order = Order.objects.create(
            user=self.user,
            total="900000.00",
        )

    def test_order_created_with_pending_status(self):
        self.assertEqual(
            self.order.status,
            Order.Status.PENDING,
        )

    def test_order_item_creation(self):
        item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            product_name=self.product.name,
            unit_price=self.product.price,
            quantity=2,
            subtotal="900000.00",
        )

        self.assertEqual(
            item.quantity,
            2,
        )

        self.assertEqual(
            item.unit_price,
            "450000.00",
        )

        self.assertEqual(
            item.subtotal,
            "900000.00",
        )

    def test_order_has_items(self):
        OrderItem.objects.create(
            order=self.order,
            product=self.product,
            product_name=self.product.name,
            unit_price=self.product.price,
            quantity=2,
            subtotal="900000.00",
        )

        self.assertEqual(
            self.order.items.count(),
            1,
        )