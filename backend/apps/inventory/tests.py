from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.catalog.models import Category, Product
from apps.inventory.models import InventoryItem, InventoryTransaction
from apps.inventory.services import InventoryError, InventoryService
from apps.stores.models import Store


class InventoryServiceTests(TestCase):

    def setUp(self):
        User = get_user_model()

        self.user = User.objects.create_user(
            username="inventory_test_user",
            password="TestPass123!",
        )

        self.store = Store.objects.create(
            owner=self.user,
            name="Inventory Test Store",
            slug="inventory-test-store",
            is_active=True,
        )

        self.category = Category.objects.create(
            store=self.store,
            name="Inventory Test Category",
            slug="inventory-test-category",
            is_active=True,
        )

        self.product = Product.objects.create(
            store=self.store,
            category=self.category,
            name="Inventory Test Product",
            slug="inventory-test-product",
            price=Decimal("100000"),
            stock=10,
            is_active=True,
        )

    def test_get_or_create_item_uses_product_stock(self):
        item = InventoryService.get_or_create_item(self.product)

        self.assertEqual(item.quantity, 10)
        self.assertEqual(item.product_id, self.product.id)
        self.assertEqual(item.store_id, self.store.id)

    def test_increase_updates_quantity_and_creates_transaction(self):
        transaction = InventoryService.increase(
            self.product,
            5,
            reference="TEST-RESTOCK",
        )

        item = InventoryItem.objects.get(product=self.product)

        self.assertEqual(item.quantity, 15)
        self.assertEqual(transaction.quantity, 5)
        self.assertEqual(transaction.quantity_before, 10)
        self.assertEqual(transaction.quantity_after, 15)
        self.assertEqual(
            transaction.transaction_type,
            InventoryTransaction.TransactionType.RESTOCK,
        )

    def test_decrease_updates_quantity_and_creates_transaction(self):
        transaction = InventoryService.decrease(
            self.product,
            4,
            reference="TEST-SALE",
        )

        item = InventoryItem.objects.get(product=self.product)

        self.assertEqual(item.quantity, 6)
        self.assertEqual(transaction.quantity, -4)
        self.assertEqual(transaction.quantity_before, 10)
        self.assertEqual(transaction.quantity_after, 6)
        self.assertEqual(
            transaction.transaction_type,
            InventoryTransaction.TransactionType.SALE,
        )

    def test_decrease_rejects_insufficient_inventory(self):
        with self.assertRaises(InventoryError):
            InventoryService.decrease(self.product, 11)

        self.assertFalse(
            InventoryItem.objects.filter(product=self.product).exists()
        )

    def test_zero_or_negative_quantity_is_rejected(self):
        with self.assertRaises(InventoryError):
            InventoryService.increase(self.product, 0)

        with self.assertRaises(InventoryError):
            InventoryService.decrease(self.product, 0)

        with self.assertRaises(InventoryError):
            InventoryService.increase(self.product, -1)

        with self.assertRaises(InventoryError):
            InventoryService.decrease(self.product, -1)

    def test_product_without_store_is_rejected(self):
        self.product.store = None
        self.product.save(update_fields=["store"])

        with self.assertRaises(InventoryError):
            InventoryService.get_or_create_item(self.product)

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.cart.models import Cart, CartItem
from apps.catalog.models import Category, Product
from apps.stores.models import Store


class InventoryOrderIntegrationTestCase(TestCase):
    def setUp(self):
        User = get_user_model()

        self.user = User.objects.create_user(
            username="inventory_test_user",
            password="TestPassword123!",
        )

        self.store = Store.objects.create(
            name="Inventory Test Store",
            owner=self.user,
            is_active=True,
        )

        self.category = Category.objects.create(
            name="Inventory Test Category",
            slug="inventory-test-category",
            store=self.store,
            is_active=True,
        )

        self.product = Product.objects.create(
            store=self.store,
            category=self.category,
            name="Inventory Test Product",
            slug="inventory-test-product",
            price=100000,
            stock=10,
            is_active=True,
        )

        self.cart = Cart.objects.create(user=self.user)

        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2,
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_order_creation_creates_inventory_sale_transaction(self):
        response = self.client.post(
            "/api/v1/orders/",
            {
                "shipping_address": "Tehran, Example Street 123",
                "shipping_phone": "09123456789",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)

        item = InventoryItem.objects.get(product=self.product)

        self.assertEqual(item.quantity, 8)

        transaction = InventoryTransaction.objects.get(
            inventory_item=item,
            transaction_type=InventoryTransaction.TransactionType.SALE,
        )

        self.assertEqual(transaction.quantity, -2)
        self.assertEqual(transaction.quantity_before, 10)
        self.assertEqual(transaction.quantity_after, 8)

    def test_order_cancellation_creates_inventory_return_transaction(self):
        response = self.client.post(
            "/api/v1/orders/",
            {
                "shipping_address": "Tehran, Example Street 123",
                "shipping_phone": "09123456789",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)

        order_id = response.data["id"]

        cancel_response = self.client.patch(
            f"/api/v1/orders/{order_id}/cancel/",
            {},
            format="json",
        )

        self.assertEqual(cancel_response.status_code, 200)

        item = InventoryItem.objects.get(product=self.product)

        self.assertEqual(item.quantity, 10)

        transaction = InventoryTransaction.objects.filter(
            inventory_item=item,
            transaction_type=InventoryTransaction.TransactionType.RETURN,
        ).latest("id")

        self.assertEqual(transaction.quantity, 2)
        self.assertEqual(transaction.quantity_before, 8)
        self.assertEqual(transaction.quantity_after, 10)



class InventoryAdminAPITests(TestCase):

    def setUp(self):
        User = get_user_model()

        self.client = APIClient()

        self.owner_a = User.objects.create_user(
            username="inventory_owner_a",
            email="inventory-owner-a@test.local",
            password="TestPassword123!",
        )

        self.owner_b = User.objects.create_user(
            username="inventory_owner_b",
            email="inventory-owner-b@test.local",
            password="TestPassword123!",
        )

        self.admin_a = User.objects.create_user(
            username="inventory_admin_a",
            email="inventory-admin-a@test.local",
            password="TestPassword123!",
        )

        self.editor_a = User.objects.create_user(
            username="inventory_editor_a",
            email="inventory-editor-a@test.local",
            password="TestPassword123!",
        )

        self.store_a = Store.objects.create(
            owner=self.owner_a,
            name="Inventory Store A",
            slug="inventory-store-a",
            is_active=True,
        )

        self.store_b = Store.objects.create(
            owner=self.owner_b,
            name="Inventory Store B",
            slug="inventory-store-b",
            is_active=True,
        )

        from apps.stores.models import StoreMembership

        StoreMembership.objects.create(
            store=self.store_a,
            user=self.admin_a,
            role=StoreMembership.Role.ADMIN,
        )

        StoreMembership.objects.create(
            store=self.store_a,
            user=self.editor_a,
            role=StoreMembership.Role.EDITOR,
        )

        self.category_a = Category.objects.create(
            store=self.store_a,
            name="Inventory Coffee",
            slug="inventory-admin-category",
        )

        self.category_b = Category.objects.create(
            store=self.store_b,
            name="Other Coffee",
            slug="inventory-other-category",
        )

        self.product_a = Product.objects.create(
            store=self.store_a,
            category=self.category_a,
            name="Inventory Product A",
            slug="inventory-admin-product-a",
            price=100000,
            stock=10,
        )

        self.product_b = Product.objects.create(
            store=self.store_b,
            category=self.category_b,
            name="Inventory Product B",
            slug="inventory-admin-product-b",
            price=100000,
            stock=20,
        )

        InventoryService.get_or_create_item(self.product_a)
        InventoryService.get_or_create_item(self.product_b)

    def auth(self, user):
        self.client.force_authenticate(user=user)

    def inventory_url(self, store_id):
        return f"/api/v1/admin/stores/{store_id}/inventory/"

    def adjust_url(self, store_id, product_id):
        return (
            f"/api/v1/admin/stores/{store_id}/"
            f"inventory/{product_id}/adjust/"
        )

    def test_owner_can_list_inventory(self):
        self.auth(self.owner_a)

        response = self.client.get(
            self.inventory_url(self.store_a.id),
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(
            response.data["results"][0]["quantity"],
            10,
        )

    def test_editor_can_list_inventory(self):
        self.auth(self.editor_a)

        response = self.client.get(
            self.inventory_url(self.store_a.id),
        )

        self.assertEqual(response.status_code, 200)

    def test_cross_store_inventory_is_hidden(self):
        self.auth(self.owner_b)

        response = self.client.get(
            self.inventory_url(self.store_a.id),
        )

        self.assertEqual(response.status_code, 404)

    def test_editor_cannot_adjust_inventory(self):
        self.auth(self.editor_a)

        response = self.client.post(
            self.adjust_url(
                self.store_a.id,
                self.product_a.id,
            ),
            {
                "quantity": 5,
                "transaction_type": "restock",
                "note": "Editor attempt",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 403)

    def test_owner_can_adjust_inventory(self):
        self.auth(self.owner_a)

        response = self.client.post(
            self.adjust_url(
                self.store_a.id,
                self.product_a.id,
            ),
            {
                "quantity": 5,
                "transaction_type": "restock",
                "note": "Admin restock",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        item = InventoryItem.objects.get(
            product=self.product_a,
        )

        self.assertEqual(item.quantity, 15)

        transaction = InventoryTransaction.objects.latest("id")

        self.assertEqual(transaction.quantity, 5)
        self.assertEqual(transaction.quantity_before, 10)
        self.assertEqual(transaction.quantity_after, 15)
        self.assertEqual(
            transaction.transaction_type,
            InventoryTransaction.TransactionType.RESTOCK,
        )

    def test_admin_can_adjust_inventory(self):
        self.auth(self.admin_a)

        response = self.client.post(
            self.adjust_url(
                self.store_a.id,
                self.product_a.id,
            ),
            {
                "quantity": -3,
                "transaction_type": "adjustment",
                "note": "Inventory correction",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        item = InventoryItem.objects.get(
            product=self.product_a,
        )

        self.assertEqual(item.quantity, 7)

    def test_cross_store_product_cannot_be_adjusted(self):
        self.auth(self.owner_a)

        response = self.client.post(
            self.adjust_url(
                self.store_a.id,
                self.product_b.id,
            ),
            {
                "quantity": 5,
                "transaction_type": "restock",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 404)
