from django.urls import include, path

from .views import (
    CategoryListAPIView,
    ProductDetailAPIView,
    ProductListAPIView,
)


urlpatterns = [
    path("admin/", include("apps.catalog.admin_urls")),
    path(
        "categories/",
        CategoryListAPIView.as_view(),
        name="category-list",
    ),
    path(
        "products/",
        ProductListAPIView.as_view(),
        name="product-list",
    ),
    path(
        "products/<slug:slug>/",
        ProductDetailAPIView.as_view(),
        name="product-detail",
    ),
]
