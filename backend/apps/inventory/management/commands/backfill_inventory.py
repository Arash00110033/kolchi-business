from django.core.management.base import BaseCommand

from apps.catalog.models import Product
from apps.inventory.models import InventoryItem


class Command(BaseCommand):
    help = "Create missing inventory items from current Product.stock values."

    def handle(self, *args, **options):
        created = 0
        skipped = 0

        for product in Product.objects.select_related("store").order_by("id"):
            if product.store_id is None:
                self.stdout.write(
                    self.style.WARNING(
                        f"SKIP product={product.id} name={product.name}: no store"
                    )
                )
                skipped += 1
                continue

            item, was_created = InventoryItem.objects.get_or_create(
                product=product,
                defaults={
                    "store_id": product.store_id,
                    "quantity": product.stock,
                },
            )

            if was_created:
                created += 1
                self.stdout.write(
                    f"CREATE product={product.id} "
                    f"name={product.name} "
                    f"quantity={product.stock}"
                )
            else:
                skipped += 1
                self.stdout.write(
                    f"SKIP product={product.id} "
                    f"name={product.name}: inventory already exists"
                )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"Backfill complete: created={created}, skipped={skipped}"
            )
        )
