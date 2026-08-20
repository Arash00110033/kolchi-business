from django.contrib import admin
from django.urls import include, path

from apps.core.views import health_check


urlpatterns = [
    path("admin/", admin.site.urls),

    path(
        "api/v1/health/",
        health_check,
        name="health-check",
    ),

    path(
        "api/v1/",
        include("apps.catalog.urls"),
    ),

    path(
        "api/v1/auth/",
        include("apps.users.urls"),
    ),

    path(
        "api/v1/cart/",
        include("apps.cart.urls"),
    ),
]