from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.cart.models import Cart, CartItem
from apps.catalog.models import Category, Product
from apps.stores.models import Store

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

        self.store = Store.objects.create(
            owner=self.user,
            name="Test Store",
            slug="test-store",
        )

        self.category = Category.objects.create(
            store=self.store,
            name="Coffee",
            slug="coffee",
        )

        self.product = Product.objects.create(
            store=self.store,
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
            {
                "shipping_address": "Test Address",
                "shipping_phone": "09120000000",
            },
            format="json",
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
            {
                "shipping_address": "Test Address",
                "shipping_phone": "09120000000",
            },
            format="json",
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
            {
                "shipping_address": "Test Address",
                "shipping_phone": "09120000000",
            },
            format="json",
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

    def test_create_order_with_short_address_fails(self):
        cart = Cart.objects.create(
            user=self.user,
        )

        CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=1,
        )

        response = self.client.post(
            "/api/v1/orders/",
            {
                "shipping_address": "خیابان",
                "shipping_phone": "09120000000",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            400,
        )

        self.assertEqual(
            response.data["detail"],
            "Shipping address must be between 10 and 500 characters.",
        )

    def test_create_order_with_invalid_phone_fails(self):
        cart = Cart.objects.create(
            user=self.user,
        )

        CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=1,
        )

        response = self.client.post(
            "/api/v1/orders/",
            {
                "shipping_address": "خیابان اصلی، پلاک ۱۰",
                "shipping_phone": "12345",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            400,
        )

        self.assertEqual(
            response.data["detail"],
            "Invalid shipping phone.",
        )

    def test_get_order_detail(self):
        order = Order.objects.create(
            user=self.user,
            store=self.store,
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
            store=self.store,
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

    def test_owner_can_cancel_pending_order_and_restore_stock(self):
        order = Order.objects.create(
            user=self.user,
            store=self.store,
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

        self.product.stock = 7
        self.product.save()

        response = self.client.patch(
            f"/api/v1/orders/{order.id}/cancel/",
            {},
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        order.refresh_from_db()
        self.product.refresh_from_db()

        self.assertEqual(order.status, Order.Status.CANCELLED)
        self.assertEqual(self.product.stock, 9)

    def test_cancelled_order_cannot_be_cancelled_again(self):
        order = Order.objects.create(
            user=self.user,
            store=self.store,
            status=Order.Status.CANCELLED,
            total="900000.00",
        )

        response = self.client.patch(
            f"/api/v1/orders/{order.id}/cancel/",
            {},
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_paid_order_cannot_be_cancelled(self):
        order = Order.objects.create(
            user=self.user,
            store=self.store,
            status=Order.Status.PAID,
            total="900000.00",
        )

        response = self.client.patch(
            f"/api/v1/orders/{order.id}/cancel/",
            {},
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_user_cannot_cancel_another_users_order(self):
        order = Order.objects.create(
            user=self.user,
            store=self.store,
            total="900000.00",
        )

        another_user = User.objects.create_user(
            username="cancelother",
            email="cancelother@example.com",
            phone_number="09125555555",
            password="TestPass123!",
        )

        self.client.force_authenticate(user=another_user)

        response = self.client.patch(
            f"/api/v1/orders/{order.id}/cancel/",
            {},
            format="json",
        )

        self.assertEqual(response.status_code, 404)

    def test_valid_order_state_transitions(self):
        valid_paths = [
            (Order.Status.PENDING, Order.Status.CONFIRMED),
            (Order.Status.PENDING, Order.Status.PAID),
            (Order.Status.PENDING, Order.Status.CANCELLED),
            (Order.Status.CONFIRMED, Order.Status.PAID),
            (Order.Status.CONFIRMED, Order.Status.SHIPPED),
            (Order.Status.CONFIRMED, Order.Status.CANCELLED),
            (Order.Status.PAID, Order.Status.SHIPPED),
            (Order.Status.SHIPPED, Order.Status.DELIVERED),
        ]

        for current, target in valid_paths:
            order = Order.objects.create(
                user=self.user,
                store=self.store,
                status=current,
                total="100000.00",
            )

            self.assertTrue(order.can_transition_to(target))

    def test_invalid_order_state_transitions(self):
        invalid_paths = [
            (Order.Status.CANCELLED, Order.Status.PAID),
            (Order.Status.CANCELLED, Order.Status.SHIPPED),
            (Order.Status.DELIVERED, Order.Status.PAID),
            (Order.Status.DELIVERED, Order.Status.CANCELLED),
            (Order.Status.PAID, Order.Status.CONFIRMED),
            (Order.Status.SHIPPED, Order.Status.PAID),
        ]

        for current, target in invalid_paths:
            order = Order.objects.create(
                user=self.user,
                store=self.store,
                status=current,
                total="100000.00",
            )

            self.assertFalse(order.can_transition_to(target))

    def test_transition_to_updates_status(self):
        order = Order.objects.create(
            user=self.user,
            store=self.store,
            status=Order.Status.PENDING,
            total="100000.00",
        )

        order.transition_to(Order.Status.CONFIRMED)
        order.refresh_from_db()

        self.assertEqual(
            order.status,
            Order.Status.CONFIRMED,
        )

    def test_transition_to_rejects_invalid_transition(self):
        order = Order.objects.create(
            user=self.user,
            store=self.store,
            status=Order.Status.CANCELLED,
            total="100000.00",
        )

        with self.assertRaises(ValueError):
            order.transition_to(Order.Status.PAID)

    def test_failed_order_creation_does_not_change_stock(self):
        cart = Cart.objects.create(
            user=self.user,
        )

        CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=10,
        )

        stock_before = self.product.stock

        response = self.client.post(
            "/api/v1/orders/",
            {
                "shipping_address": "Test Address",
                "shipping_phone": "09120000000",
            },
            format="json",
        )

        self.product.refresh_from_db()

        self.assertEqual(response.status_code, 400)
        self.assertEqual(self.product.stock, stock_before)
        self.assertFalse(
            Order.objects.filter(user=self.user).exists()
        )

    def test_order_creation_is_atomic_when_cart_contains_unavailable_product(self):
        cart = Cart.objects.create(
            user=self.user,
        )

        inactive = Product.objects.create(
            store=self.store,
            category=self.category,
            name="Inactive Coffee",
            slug="inactive-coffee",
            description="Inactive product.",
            price="300000.00",
            stock=5,
            is_active=False,
        )

        CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=1,
        )

        CartItem.objects.create(
            cart=cart,
            product=inactive,
            quantity=1,
        )

        stock_before = self.product.stock

        response = self.client.post(
            "/api/v1/orders/",
            {
                "shipping_address": "Test Address",
                "shipping_phone": "09120000000",
            },
            format="json",
        )

        self.product.refresh_from_db()

        self.assertEqual(response.status_code, 400)
        self.assertEqual(self.product.stock, stock_before)
        self.assertFalse(
            Order.objects.filter(user=self.user).exists()
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
        
