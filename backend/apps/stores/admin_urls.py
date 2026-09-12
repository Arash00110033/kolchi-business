from django.urls import path

from .admin_membership_views import (
    AdminMembershipDetailAPIView,
    AdminMembershipListCreateAPIView,
)
from .admin_views import AdminStoreDetailAPIView


urlpatterns = [
    path(
        "stores/<int:store_id>/",
        AdminStoreDetailAPIView.as_view(),
        name="admin-store-detail",
    ),
    path(
        "stores/<int:store_id>/members/",
        AdminMembershipListCreateAPIView.as_view(),
        name="admin-store-members-list",
    ),
    path(
        "stores/<int:store_id>/members/<int:pk>/",
        AdminMembershipDetailAPIView.as_view(),
        name="admin-store-member-detail",
    ),
]
