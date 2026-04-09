from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    # CRM & Scoring fields
    passport_number = models.CharField(max_length=20, blank=True, null=True)
    driver_license = models.CharField(max_length=50, blank=True, null=True)
    
    # Document verification
    VERIFICATION_CHOICES = [
        ('unverified', 'Kiritilmagan'),
        ('pending', 'Kutilmoqda'),
        ('verified', 'Tasdiqlangan'),
        ('rejected', 'Rad etilgan'),
    ]
    passport_image = models.ImageField(upload_to='documents/passports/', blank=True, null=True)
    driver_license_image = models.ImageField(upload_to='documents/licenses/', blank=True, null=True)
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_CHOICES, default='unverified')

    is_blacklisted = models.BooleanField(default=False)
    loyalty_points = models.PositiveIntegerField(default=0)
    
    # B2B / Corporate
    is_corporate = models.BooleanField(default=False)
    company_name = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.username
class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('booking_created', 'New Booking Created'),
        ('payment_completed', 'Payment Successful'),
        ('booking_pending_admin', 'Booking Pending Admin Review'),
        ('booking_approved', 'Booking Approved'),
        ('booking_rejected', 'Booking Rejected'),
        ('kyc_submitted', 'KYC Documents Submitted'),
        ('kyc_approved', 'KYC Approved'),
        ('kyc_rejected', 'KYC Rejected'),
        ('system', 'System Message'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    admin_only = models.BooleanField(default=False)
    type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES, default='system')
    title = models.CharField(max_length=255)
    message = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.type}] {self.title} - {self.user.username if self.user else 'ADMIN'}"


class KYCProfile(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='kyc')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    full_name = models.CharField(max_length=255, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    nationality = models.CharField(max_length=100, default="Uzbekistan")

    passport_series = models.CharField(max_length=10, blank=True)
    passport_issued_by = models.CharField(max_length=255, blank=True)
    passport_issue_date = models.DateField(null=True, blank=True)
    passport_expiry_date = models.DateField(null=True, blank=True)
    passport_front_image = models.ImageField(upload_to='kyc/passports/front/', null=True, blank=True)
    passport_back_image = models.ImageField(upload_to='kyc/passports/back/', null=True, blank=True)

    license_number = models.CharField(max_length=50, blank=True)
    license_category = models.CharField(max_length=20, blank=True)
    license_issue_date = models.DateField(null=True, blank=True)
    license_expiry_date = models.DateField(null=True, blank=True)
    license_image = models.ImageField(upload_to='kyc/licenses/', null=True, blank=True)
    selfie_with_document = models.ImageField(upload_to='kyc/selfies/', null=True, blank=True)

    reviewed_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='kyc_reviews',
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=['status'])]

    @property
    def is_valid(self):
        from django.utils import timezone

        return (
            self.status == 'approved'
            and self.passport_expiry_date
            and self.passport_expiry_date > timezone.now().date()
            and self.license_expiry_date
            and self.license_expiry_date > timezone.now().date()
        )

    def __str__(self):
        return f"KYC: {self.user.username} [{self.status}]"
