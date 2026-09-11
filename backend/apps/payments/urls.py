from django.urls import path

from .views import (
    PaymentConfirmAPIView,
    PaymentListCreateAPIView,
)


urlpatterns = [
    path(
        "",
        PaymentListCreateAPIView.as_view(),
        name="payment-list-create",
    ),
    path(
        "<int:payment_id>/confirm/",
        PaymentConfirmAPIView.as_view(),
        name="payment-confirm",
    ),
]
