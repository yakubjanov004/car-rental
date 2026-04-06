from django.db import models
from django.utils import timezone
from apps.cars.models import Car


class MaintenanceType(models.Model):
    name = models.CharField(max_length=100)
    code = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon_name = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.name


class MaintenanceRecord(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('overdue', 'Overdue'),
    ]

    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='maintenance_records')
    maintenance_type = models.ForeignKey(MaintenanceType, on_delete=models.PROTECT)
    scheduled_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    mileage_at_service = models.PositiveIntegerField(null=True, blank=True)
    next_service_mileage = models.PositiveIntegerField(null=True, blank=True)
    cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    performed_by = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-scheduled_date']
        indexes = [
            models.Index(fields=['car', 'status']),
            models.Index(fields=['scheduled_date']),
        ]

    @property
    def is_overdue(self):
        return self.status == 'scheduled' and self.scheduled_date < timezone.now().date()

    def __str__(self):
        return f"{self.car} - {self.maintenance_type.name} ({self.scheduled_date})"
