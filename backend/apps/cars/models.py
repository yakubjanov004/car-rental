from django.db import models
from django.utils.text import slugify
from apps.districts.models import District

class Car(models.Model):
    FUEL_CHOICES = [('benzin', 'Benzin'), ('gaz', 'Gaz'), ('gibrid', 'Gibrid'), ('elektro', 'Elektro')]
    TRANSMISSION_CHOICES = [('manual', 'Manual'), ('automatic', 'Automatic')]

    brand = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    category = models.CharField(max_length=50, default='sedan')
    slug = models.SlugField(max_length=150, unique=True, blank=True)
    year = models.PositiveIntegerField()
    transmission = models.CharField(max_length=20, choices=TRANSMISSION_CHOICES)
    fuel_type = models.CharField(max_length=20, choices=FUEL_CHOICES)
    seats = models.PositiveIntegerField(default=5)
    color = models.CharField(max_length=30)
    daily_price = models.DecimalField(max_digits=10, decimal_places=2)
    deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='cars')
    address = models.TextField()
    main_image = models.ImageField(upload_to='cars/', null=True, blank=True)
    features = models.JSONField(default=list)
    is_available = models.BooleanField(default=True)
    rating = models.FloatField(default=0.0)
    review_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.brand}-{self.model}-{self.year}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.brand} {self.model} ({self.year})"

