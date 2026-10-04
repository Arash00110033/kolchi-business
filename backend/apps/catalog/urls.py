from django.urls import include, path

from .views import (
    CategoryListAPIView,
    ProductDetailAPIView,
    ProductListAPIView,
)


urlpatterns = [
    path("admin/", include("apps.catalog.admin_urls")),
    path(
        "stores/<int:store_id>/categories/",
        CategoryListAPIView.as_view(),
        name="store-category-list",
    ),
    path(
        "stores/<int:store_id>/products/",
        ProductListAPIView.as_view(),
        name="store-product-list",
    ),
    path(
        "stores/<int:store_id>/products/<slug:slug>/",
        ProductDetailAPIView.as_view(),
        name="store-product-detail",
    ),
]