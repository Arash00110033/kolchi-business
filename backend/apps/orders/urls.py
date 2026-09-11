from django.urls import path

from .views import (
    OrderCancelAPIView,
    OrderDetailAPIView,
    OrderListCreateAPIView,
)


urlpatterns = [
    path(
        "",
        OrderListCreateAPIView.as_view(),
        name="order-list-create",
    ),
    path(
        "<int:pk>/cancel/",
        OrderCancelAPIView.as_view(),
        name="order-cancel",
    ),
    path(
        "<int:pk>/",
        OrderDetailAPIView.as_view(),
        name="order-detail",
    ),
]