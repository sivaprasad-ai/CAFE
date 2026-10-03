from rest_framework import serializers

from .models import Order


class OrderSerializer(serializers.ModelSerializer):
    # Field names match the camelCase shape the React frontend already uses.
    orderType = serializers.ChoiceField(source="order_type", choices=Order.ORDER_TYPE_CHOICES, default="dinein")
    packingCharge = serializers.IntegerField(source="packing_charge", default=0)
    placedAt = serializers.DateTimeField(source="placed_at", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "table",
            "orderType",
            "items",
            "subtotal",
            "packingCharge",
            "total",
            "status",
            "source",
            "placedAt",
        ]
        read_only_fields = ["id", "placedAt"]
