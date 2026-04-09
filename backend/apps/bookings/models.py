from django.db import models
from django.conf import settings
from apps.cars.models import Car

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('payment_pending', 'Payment Pending'),
        ('confirmed', 'Confirmed'),
        ('active', 'Active Rental'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('failed', 'Payment Failed'),
        ('rejected', 'Rejected by Admin'),
    ]

    booking_code = models.CharField(max_length=10, unique=True, db_index=True, null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='bookings')
    start_datetime = models.DateTimeField(db_index=True)
    end_datetime = models.DateTimeField(db_index=True)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    comment = models.TextField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    # Chauffeur Service
    is_chauffeur = models.BooleanField(default=False)
    chauffeur_details = models.TextField(blank=True, null=True, help_text="Pickup location, flight num, etc.")
    
    # Return Control
    return_condition = models.TextField(blank=True, null=True, help_text="Yaxshi, chizilgan, iflos va hkz")
    returned_at = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.booking_code:
            from apps.bookings.utils import generate_booking_code
            self.booking_code = generate_booking_code()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Booking {self.id} - {self.booking_code} by {self.user.username}"

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
