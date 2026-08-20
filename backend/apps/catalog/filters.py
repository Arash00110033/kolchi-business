from rest_framework import serializers


class ProductQuerySerializer(serializers.Serializer):
    query = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=100,
    )

    category = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=120,
    )

    sort = serializers.ChoiceField(
        required=False,
        choices=(
            ("price_asc", "Price ascending"),
            ("price_desc", "Price descending"),
            ("name", "Name"),
        ),
    )