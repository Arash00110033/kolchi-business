from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)

    phone_number = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.username


class PlatformOwner(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="platform_owner_profile",
    )
    is_active = models.BooleanField(default=True)

    store_creation_limit = models.PositiveIntegerField(
        default=5,
        help_text="Maximum number of stores this platform owner can create.",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"Platform Owner: {self.user.username}"
