from django.contrib import admin

from .models import Order


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "table", "order_type", "status", "total", "source", "placed_at"]
    list_filter = ["status", "order_type", "source"]
    ordering = ["-placed_at"]
