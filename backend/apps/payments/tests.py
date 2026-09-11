from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from apps.catalog.models import Category, Product
from apps.orders.models import Order

from .models import Payment


User = get_user_model()


class PaymentAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="payment-user",
            email="payment-user@kolchi.test",
            password="StrongPassword123!",
        )

        self.other_user = User.objects.create_user(
            username="other-payment-user",
            email="other-payment-user@kolchi.test",
            password="StrongPassword123!",
        )

        self.category = Category.objects.create(
            name="Coffee",
            slug="coffee",
        )

        self.product = Product.objects.create(
            category=self.category,
            name="Test Coffee",
            slug="test-coffee",
            price=Decimal("450000.00"),
            stock=10,
            is_active=True,
        )

        self.order = Order.objects.create(
            user=self.user,
            shipping_address="Test Address",
            shipping_phone="09120000000",
            status=Order.Status.PENDING,
            total=Decimal("450000.00"),
        )

        self.payment = Payment.objects.create(
            order=self.order,
            user=self.user,
            amount=self.order.total,
            method=Payment.Method.ONLINE,
            status=Payment.Status.PENDING,
        )

        self.payment_url = reverse("payment-list-create")
        self.confirm_url = reverse(
            "payment-confirm",
            kwargs={"payment_id": self.payment.id},
        )

    def authenticate(self, user=None):
        self.client.force_authenticate(user=user or self.user)

    def test_create_payment_for_owned_order(self):
        self.payment.delete()
        self.authenticate()

        response = self.client.post(
            self.payment_url,
            {"order": self.order.id},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        payment = Payment.objects.get(order=self.order)

        self.assertEqual(
            payment.status,
            Payment.Status.PENDING,
        )
        self.assertEqual(
            payment.amount,
            self.order.total,
        )

    def test_create_payment_rejects_other_users_order(self):
        self.authenticate(self.other_user)

        response = self.client.post(
            self.payment_url,
            {"order": self.order.id},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_confirm_payment_marks_payment_and_order_paid(self):
        self.authenticate()

        response = self.client.post(
            self.confirm_url,
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.payment.refresh_from_db()
        self.order.refresh_from_db()

        self.assertEqual(
            self.payment.status,
            Payment.Status.PAID,
        )
        self.assertEqual(
            self.order.status,
            Order.Status.PAID,
        )
        self.assertTrue(
            self.payment.transaction_id,
        )

    def test_confirm_payment_is_idempotent(self):
        self.authenticate()

        first_response = self.client.post(
            self.confirm_url,
            {},
            format="json",
        )

        self.payment.refresh_from_db()
        transaction_id = self.payment.transaction_id

        second_response = self.client.post(
            self.confirm_url,
            {},
            format="json",
        )

        self.payment.refresh_from_db()
        self.order.refresh_from_db()

        self.assertEqual(
            first_response.status_code,
            status.HTTP_200_OK,
        )
        self.assertEqual(
            second_response.status_code,
            status.HTTP_200_OK,
        )
        self.assertEqual(
            self.payment.status,
            Payment.Status.PAID,
        )
        self.assertEqual(
            self.order.status,
            Order.Status.PAID,
        )
        self.assertEqual(
            self.payment.transaction_id,
            transaction_id,
        )

    def test_confirm_payment_rejects_other_user(self):
        self.authenticate(self.other_user)

        response = self.client.post(
            self.confirm_url,
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.payment.refresh_from_db()
        self.order.refresh_from_db()

        self.assertEqual(
            self.payment.status,
            Payment.Status.PENDING,
        )
        self.assertEqual(
            self.order.status,
            Order.Status.PENDING,
        )

    def test_confirm_payment_rejects_amount_mismatch(self):
        self.authenticate()

        self.payment.amount = Decimal("1.00")
        self.payment.save(
            update_fields=["amount", "updated_at"],
        )

        response = self.client.post(
            self.confirm_url,
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.payment.refresh_from_db()
        self.order.refresh_from_db()

        self.assertEqual(
            self.payment.status,
            Payment.Status.PENDING,
        )
        self.assertEqual(
            self.order.status,
            Order.Status.PENDING,
        )

    def test_confirm_payment_rejects_cancelled_order(self):
        self.authenticate()

        self.order.status = Order.Status.CANCELLED
        self.order.save(
            update_fields=["status", "updated_at"],
        )

        response = self.client.post(
            self.confirm_url,
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.payment.refresh_from_db()

        self.assertEqual(
            self.payment.status,
            Payment.Status.PENDING,
        )

    def test_payment_requires_authentication(self):
        response = self.client.post(
            self.confirm_url,
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

