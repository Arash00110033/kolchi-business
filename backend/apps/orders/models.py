from django.conf import settings
from django.db import models
from apps.stores.models import Store


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        PAID = "paid", "Paid"
        SHIPPED = "shipped", "Shipped"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    store = models.ForeignKey(
        Store,
        on_delete=models.PROTECT,
        related_name="orders",
        null=True,
        blank=True,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="orders",
    )

    shipping_address = models.TextField(
        blank=True,
        default="",
    )

    shipping_phone = models.CharField(
        max_length=20,
        blank=True,
        default="",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def can_transition_to(self, new_status):
        allowed = {
            self.Status.PENDING: {
                self.Status.CONFIRMED,
                self.Status.PAID,
                self.Status.CANCELLED,
            },
            self.Status.CONFIRMED: {
                self.Status.PAID,
                self.Status.SHIPPED,
                self.Status.CANCELLED,
            },
            self.Status.PAID: {
                self.Status.SHIPPED,
            },
            self.Status.SHIPPED: {
                self.Status.DELIVERED,
            },
            self.Status.DELIVERED: set(),
            self.Status.CANCELLED: set(),
        }

        return new_status in allowed.get(self.status, set())

    def transition_to(self, new_status):
        if not self.can_transition_to(new_status):
            raise ValueError(
                f"Invalid order transition: "
                f"{self.status} -> {new_status}"
            )

        self.status = new_status
        self.save(update_fields=["status", "updated_at"])

    def __str__(self):
        return f"Order #{self.pk} - {self.user.username}"


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    product = models.ForeignKey(
        "catalog.Product",
        on_delete=models.PROTECT,
        related_name="order_items",
    )

    product_name = models.CharField(max_length=200)

    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    quantity = models.PositiveIntegerField()

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"
