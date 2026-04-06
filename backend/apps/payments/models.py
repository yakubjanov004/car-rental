from django.db import models
from django.conf import settings
from apps.bookings.models import Booking

class PaymentMethod(models.Model):
    CARD_TYPES = [
        ('uzcard', 'Uzcard'),
        ('humo', 'Humo'),
        ('visa', 'Visa'),
        ('mastercard', 'Mastercard'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payment_methods')
    card_type = models.CharField(max_length=20, choices=CARD_TYPES)
    masked_pan = models.CharField(max_length=20)  # e.g., 8600 **** **** 1234
    expiry_month = models.CharField(max_length=2)
    expiry_year = models.CharField(max_length=2)
    card_holder = models.CharField(max_length=255, blank=True, null=True)
    is_default = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.card_type.upper()} {self.masked_pan} - {self.user.username}"


class PaymentTransaction(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Kutilmoqda'),
        ('otp_sent', 'OTP Yuborildi'),
        ('paid', 'To\'landi'),
        ('failed', 'Xatolik'),
        ('cancelled', 'Bekor qilindi'),
        ('refunded', 'Qaytarildi'),
    ]

    PAYMENT_TYPES = [
        ('card', 'Saqlangan Karta'),
        ('new_card', 'Yangi Karta'),
        ('qr', 'QR orqali'),
        ('deposit', 'Depozit'),
        ('full_payment', 'To\'liq to\'lov'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPES)
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Fake verification
    otp_code = models.CharField(max_length=6, blank=True, null=True)

    def __str__(self):
        return f"TXN {self.id} - {self.amount} UZS - {self.status}"


class BillingInvoice(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='invoices')
    transaction = models.OneToOneField(PaymentTransaction, on_delete=models.CASCADE, related_name='invoice')
    invoice_number = models.CharField(max_length=50, unique=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, default='paid', choices=[('pending', 'Kutilmoqda'), ('paid', 'To\'langan'), ('cancelled', 'Bekor qilingan')])
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.user.username}"


class PaymentReceipt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='receipts', null=True)
    transaction = models.OneToOneField(PaymentTransaction, on_delete=models.CASCADE, related_name='receipt', null=True)
    invoice = models.OneToOneField(BillingInvoice, on_delete=models.CASCADE, related_name='receipt', null=True)
    receipt_number = models.CharField(max_length=50, unique=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid_at = models.DateTimeField(auto_now_add=True)
    pdf_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"Receipt {self.receipt_number} for {self.invoice.invoice_number}"


class RefundRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Kutilmoqda'),
        ('approved', 'Tasdiqlandi'),
        ('rejected', 'Rad etildi'),
        ('completed', 'Yakunlandi'),
    ]
    transaction = models.ForeignKey(PaymentTransaction, on_delete=models.CASCADE, related_name='refunds')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Refund {self.amount} for TXN {self.transaction.id}"



class DepositHold(models.Model):
    STATUS_CHOICES = [
        ('held', 'Ushlab turilibdi'),
        ('released', 'Qaytarildi'),
        ('partially_released', 'Qisman qaytarildi'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='deposits')
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='deposits')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='held')
    transaction = models.OneToOneField(PaymentTransaction, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    released_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Deposit {self.amount} for {self.booking.id} - {self.status}"
class PromoCode(models.Model):
    DISCOUNT_TYPES = [
        ('percentage', 'Foiz (%)'),
        ('fixed', 'Belgilangan summa (UZS)'),
    ]

    code = models.CharField(max_length=20, unique=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPES, default='percentage')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    valid_until = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.code} - {self.discount_value}{'%' if self.discount_type == 'percentage' else ' UZS'}"
