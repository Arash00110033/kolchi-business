from django.urls import path

from .views import (
    CartAPIView,
    CartClearAPIView,
    CartItemCreateAPIView,
    CartItemDeleteAPIView,
    CartItemUpdateAPIView,
)


urlpatterns = [
    path(
        "",
        CartAPIView.as_view(),
        name="cart-detail",
    ),
    path(
        "clear/",
        CartClearAPIView.as_view(),
        name="cart-clear",
    ),
    path(
        "items/",
        CartItemCreateAPIView.as_view(),
        name="cart-item-create",
    ),
    path(
    "items/<int:item_id>/delete/",
    CartItemDeleteAPIView.as_view(),
    name="cart-item-delete",
    ),
    path(
        "items/<int:item_id>/",
        CartItemUpdateAPIView.as_view(),
        name="cart-item-update",
    ),
]