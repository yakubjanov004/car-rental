from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Review
from .serializers import ReviewSerializer
from apps.cars.models import Car
from django.db.models import Avg


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        car_id = self.kwargs.get('car_id')
        return Review.objects.filter(car_id=car_id)

    def perform_create(self, serializer):
        car_id = self.kwargs.get('car_id')
        car = Car.objects.get(pk=car_id)
        serializer.save(user=self.request.user, car=car)

        # Avtomobil reyting va review_count ni yangilash
        reviews = Review.objects.filter(car=car)
        avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
        car.rating = round(avg_rating, 1)
        car.review_count = reviews.count()
        car.save()
