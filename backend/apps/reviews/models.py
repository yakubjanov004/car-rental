from django.db import models
from django.conf import settings
from apps.cars.models import Car


class Review(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField(default=5)  # 1-5
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'car')  # Har bir user faqat 1 marta sharh qoldira oladi
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.car.brand} {self.car.model} ({self.rating}⭐)"
