from django.db import models
from apps.bookings.models import Booking


class InsurancePlan(models.Model):
    COVERAGE_LEVELS = [
        ('basic', 'Basic'),
        ('standard', 'Standard'),
        ('premium', 'Premium'),
        ('elite', 'Elite'),
    ]

    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    coverage_level = models.CharField(max_length=20, choices=COVERAGE_LEVELS)
    daily_price = models.DecimalField(max_digits=10, decimal_places=2)
    deductible = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    covers_collision = models.BooleanField(default=False)
    covers_theft = models.BooleanField(default=False)
    covers_natural_disaster = models.BooleanField(default=False)
    covers_roadside_assistance = models.BooleanField(default=False)
    covers_personal_accident = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order']

    def __str__(self):
        return self.name


class BookingInsurance(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='insurance')
    plan = models.ForeignKey(InsurancePlan, on_delete=models.PROTECT)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    policy_number = models.CharField(max_length=50, unique=True, blank=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateField()

    def save(self, *args, **kwargs):
        if not self.policy_number:
            import uuid

            self.policy_number = f"RL-INS-{uuid.uuid4().hex[:8].upper()}"

        if not self.total_cost:
            days = max(1, (self.booking.end_date - self.booking.start_date).days)
            self.total_cost = self.plan.daily_price * days

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Insurance {self.policy_number}"
