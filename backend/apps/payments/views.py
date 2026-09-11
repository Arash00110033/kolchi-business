from uuid import uuid4

from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order

from .models import Payment
from .serializers import PaymentSerializer


class PaymentListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Payment.objects.filter(
            user=self.request.user,
        ).select_related(
            "order",
        )

    def create(self, request, *args, **kwargs):
        order_id = request.data.get("order")

        if not order_id:
            return Response(
                {"detail": "Order is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order = get_object_or_404(
            Order.objects.select_related("user"),
            id=order_id,
            user=request.user,
        )

        if order.status == Order.Status.CANCELLED:
            return Response(
                {"detail": "Cancelled orders cannot be paid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order.status == Order.Status.PAID:
            return Response(
                {"detail": "This order is already paid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment, created = Payment.objects.get_or_create(
            order=order,
            defaults={
                "user": request.user,
                "amount": order.total,
                "method": Payment.Method.ONLINE,
                "status": Payment.Status.PENDING,
            },
        )

        if payment.user_id != request.user.id:
            return Response(
                {"detail": "Payment does not belong to this user."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if payment.status == Payment.Status.PAID:
            return Response(
                {"detail": "This payment is already completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if payment.amount != order.total:
            payment.amount = order.total
            payment.save(
                update_fields=["amount", "updated_at"],
            )

        response_status = (
            status.HTTP_201_CREATED
            if created
            else status.HTTP_200_OK
        )

        return Response(
            PaymentSerializer(payment).data,
            status=response_status,
        )


class PaymentConfirmAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def post(self, request, payment_id):
        payment = get_object_or_404(
            Payment.objects.select_for_update().select_related("order"),
            id=payment_id,
            user=request.user,
        )

        order = Order.objects.select_for_update().get(
            id=payment.order_id,
        )

        if payment.user_id != order.user_id:
            return Response(
                {"detail": "Payment ownership is invalid."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if payment.amount != order.total:
            return Response(
                {"detail": "Payment amount does not match order total."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order.status == Order.Status.CANCELLED:
            return Response(
                {"detail": "Cancelled orders cannot be paid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if payment.status == Payment.Status.PAID:
            return Response(
                PaymentSerializer(payment).data,
                status=status.HTTP_200_OK,
            )

        if order.status == Order.Status.PAID:
            return Response(
                {"detail": "Order is already marked as paid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment.status = Payment.Status.PAID
        payment.transaction_id = uuid4().hex
        payment.save(
            update_fields=[
                "status",
                "transaction_id",
                "updated_at",
            ],
        )

        order.status = Order.Status.PAID
        order.save(
            update_fields=[
                "status",
                "updated_at",
            ],
        )

        return Response(
            PaymentSerializer(payment).data,
            status=status.HTTP_200_OK,
        )
