from django.urls import path

from .membership_views import (
    OwnerMembershipDetailAPIView,
    OwnerMembershipListCreateAPIView,
)
from .views import (
    OwnerMeAPIView,
    OwnerOverviewAPIView,
    OwnerStoreDetailAPIView,
    OwnerStoreListCreateAPIView,
)


urlpatterns = [
    path("me/", OwnerMeAPIView.as_view(), name="owner-me"),
    path("overview/", OwnerOverviewAPIView.as_view(), name="owner-overview"),

    path(
        "stores/",
        OwnerStoreListCreateAPIView.as_view(),
        name="owner-stores",
    ),
    path(
        "stores/<int:pk>/",
        OwnerStoreDetailAPIView.as_view(),
        name="owner-store-detail",
    ),

    path(
        "stores/<int:store_id>/members/",
        OwnerMembershipListCreateAPIView.as_view(),
        name="owner-store-members-list",
    ),
    path(
        "stores/<int:store_id>/members/<int:pk>/",
        OwnerMembershipDetailAPIView.as_view(),
        name="owner-store-member-detail",
    ),
]
