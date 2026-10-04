from django.urls import path

from .views import StorePublicConfigAPIView
from .admin_permission_views import AccessibleStoresAPIView

urlpatterns = [
    path(
        "stores/accessible/",
        AccessibleStoresAPIView.as_view(),
        name="accessible-stores",
    ),
    path(
        "stores/<int:store_id>/config/",
        StorePublicConfigAPIView.as_view(),
        name="store-public-config",
    ),
]
