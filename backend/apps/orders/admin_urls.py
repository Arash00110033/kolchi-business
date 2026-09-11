from django.urls import path

from .admin_views import (
    AdminOrderDetailAPIView,
    AdminOrderListAPIView,
    AdminOrderStatusAPIView,
)


urlpatterns = [
    path(
        "stores/<int:store_id>/orders/",
        AdminOrderListAPIView.as_view(),
        name="admin-order-list",
    ),
    path(
        "stores/<int:store_id>/orders/<int:pk>/",
        AdminOrderDetailAPIView.as_view(),
        name="admin-order-detail",
    ),
    path(
        "stores/<int:store_id>/orders/<int:pk>/status/",
        AdminOrderStatusAPIView.as_view(),
        name="admin-order-status",
    ),
]
