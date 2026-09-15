from django.urls import path

from .views import StorePublicConfigAPIView

urlpatterns = [
    path(
        "stores/<int:store_id>/config/",
        StorePublicConfigAPIView.as_view(),
        name="store-public-config",
    ),
]