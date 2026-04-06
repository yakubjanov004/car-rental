from django.db import models


class PricingRule(models.Model):
    RULE_TYPES = [
        ('weekend_surge', 'Weekend Surge'),
        ('peak_season', 'Peak Season'),
        ('low_season', 'Low Season'),
        ('holiday', 'Holiday'),
        ('last_minute', 'Last Minute Discount'),
        ('advance_booking', 'Advance Booking Discount'),
        ('long_rental', 'Long Rental Discount'),
    ]

    name = models.CharField(max_length=100)
    rule_type = models.CharField(max_length=30, choices=RULE_TYPES)
    applies_to_weekdays = models.CharField(max_length=20, blank=True)
    date_from = models.DateField(null=True, blank=True)
    date_to = models.DateField(null=True, blank=True)
    min_days = models.PositiveIntegerField(null=True, blank=True)
    days_before_start = models.PositiveIntegerField(null=True, blank=True)
    modifier_type = models.CharField(max_length=20, choices=[('multiply', 'Multiply'), ('add_percent', 'Add Percent')])
    modifier_value = models.DecimalField(max_digits=7, decimal_places=4)
    applies_to_all = models.BooleanField(default=True)
    applies_to_categories = models.CharField(max_length=255, blank=True)
    priority = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-priority']

    def __str__(self):
        return f"{self.name} ({self.modifier_value})"
