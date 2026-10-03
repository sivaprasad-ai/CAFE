from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Order
from .serializers import OrderSerializer


class OrderViewSet(viewsets.ModelViewSet):
    """
    /api/orders/            GET (list), POST (create)
    /api/orders/<id>/       GET, PATCH, DELETE
    /api/orders/<id>/status/  PATCH {"status": "preparing"}
    """

    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    @action(detail=True, methods=["patch"])
    def status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get("status")
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({"detail": "Invalid status"}, status=400)
        order.status = new_status
        order.save(update_fields=["status"])
        return Response(self.get_serializer(order).data)
