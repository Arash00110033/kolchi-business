from django.urls import path

from .views import (
    AdminInventoryAdjustAPIView,
    AdminInventoryListAPIView,
)

urlpatterns = [
    path(
        "stores/<int:store_id>/inventory/",
        AdminInventoryListAPIView.as_view(),
        name="admin-inventory-list",
    ),
    path(
        "stores/<int:store_id>/inventory/<int:product_id>/adjust/",
        AdminInventoryAdjustAPIView.as_view(),
        name="admin-inventory-adjust",
    ),
]
