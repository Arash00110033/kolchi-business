from django.urls import path

from .admin_views import (
    AdminCategoryDetailAPIView,
    AdminCategoryListCreateAPIView,
    AdminProductDetailAPIView,
    AdminProductListCreateAPIView,
)

urlpatterns = [
    path(
        "stores/<int:store_id>/categories/",
        AdminCategoryListCreateAPIView.as_view(),
        name="admin-category-list-create",
    ),
    path(
        "stores/<int:store_id>/categories/<int:pk>/",
        AdminCategoryDetailAPIView.as_view(),
        name="admin-category-detail",
    ),
    path(
        "stores/<int:store_id>/products/",
        AdminProductListCreateAPIView.as_view(),
        name="admin-product-list-create",
    ),
    path(
        "stores/<int:store_id>/products/<int:pk>/",
        AdminProductDetailAPIView.as_view(),
        name="admin-product-detail",
    ),
]
