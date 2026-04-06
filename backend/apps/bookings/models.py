from django.db import models
from django.conf import settings
from apps.cars.models import Car

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    car = models.ForeignKey(Car, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    comment = models.TextField(blank=True, null=True)
    
    # Chauffeur Service
    is_chauffeur = models.BooleanField(default=False)
    chauffeur_details = models.TextField(blank=True, null=True, help_text="Pickup location, flight num, etc.")
    
    # Return Control
    return_condition = models.TextField(blank=True, null=True, help_text="Yaxshi, chizilgan, iflos va hkz")
    returned_at = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking {self.id} - {self.car.model_info.brand} {self.car.model_info.model_name} by {self.user.username}"

class Fine(models.Model):
    STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='fines')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unpaid')
    issued_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Fine {self.id} - {self.booking.user.username} - {self.amount} UZS"


class Waitlist(models.Model):
    STATUS_CHOICES = [
        ('active', 'Aktiv'),
        ('resolved', 'Hal qilindi'),
        ('cancelled', 'Bekor qilindi'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    car = models.ForeignKey(Car, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Waitlist {self.user.username} for {self.car.model_info.brand} {self.car.model_info.model_name}"
