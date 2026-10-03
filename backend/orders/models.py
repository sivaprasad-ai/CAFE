from django.db import models


class Order(models.Model):
    STATUS_CHOICES = [
        ("new", "New"),
        ("preparing", "Preparing"),
        ("completed", "Completed"),
    ]
    ORDER_TYPE_CHOICES = [
        ("dinein", "Dine-in"),
        ("takeaway", "Takeaway"),
    ]
    SOURCE_CHOICES = [
        ("customer", "Customer (QR)"),
        ("staff", "Staff Entry"),
    ]

    table = models.CharField(max_length=20)
    order_type = models.CharField(max_length=10, choices=ORDER_TYPE_CHOICES, default="dinein")
    items = models.JSONField()  # [{name, qty, price}, ...] snapshot at order time
    subtotal = models.PositiveIntegerField()
    packing_charge = models.PositiveIntegerField(default=0)
    total = models.PositiveIntegerField()
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default="new")
    source = models.CharField(max_length=10, choices=SOURCE_CHOICES, default="customer")
    placed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-placed_at"]

    def __str__(self):
        return f"Order #{self.id} — Table {self.table} (₹{self.total})"
