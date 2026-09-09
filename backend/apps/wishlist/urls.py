from django.urls import path

from .views import (
    WishlistItemCreateAPIView,
    WishlistItemDeleteAPIView,
    WishlistListAPIView,
)


urlpatterns = [
    path(
        "",
        WishlistListAPIView.as_view(),
        name="wishlist-list",
    ),
    path(
        "items/",
        WishlistItemCreateAPIView.as_view(),
        name="wishlist-item-create",
    ),
    path(
        "items/<int:pk>/",
        WishlistItemDeleteAPIView.as_view(),
        name="wishlist-item-delete",
    ),
]