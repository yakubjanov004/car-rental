from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters
from .models import Car
from .serializers import CarSerializer


class CarFilter(django_filters.FilterSet):
    minPrice = django_filters.NumberFilter(field_name='daily_price', lookup_expr='gte')
    maxPrice = django_filters.NumberFilter(field_name='daily_price', lookup_expr='lte')

    class Meta:
        model = Car
        fields = ['district', 'transmission', 'fuel_type', 'seats', 'brand', 'minPrice', 'maxPrice']


class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CarFilter
    search_fields = ['brand', 'model', 'address']
    ordering_fields = ['daily_price', 'year', 'created_at', 'rating']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
