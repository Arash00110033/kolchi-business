from django.shortcuts import get_object_or_404

from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Store


class StorePublicConfigAPIView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, store_id):
        store = get_object_or_404(
            Store,
            pk=store_id,
            is_active=True,
        )

        enabled_locales = list(store.enabled_locales or [])
        default_locale = store.default_locale or "fa"

        if default_locale not in enabled_locales:
            enabled_locales.insert(0, default_locale)

        return Response(
            {
                "store_id": store.id,
                "default_locale": default_locale,
                "enabled_locales": enabled_locales,
            }
        )