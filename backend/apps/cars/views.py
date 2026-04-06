from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters
from .models import Car, CarModel
from .serializers import CarSerializer, CarModelSerializer


class CarFilter(django_filters.FilterSet):
    minPrice = django_filters.NumberFilter(field_name='daily_price', lookup_expr='gte')
    maxPrice = django_filters.NumberFilter(field_name='daily_price', lookup_expr='lte')

    class Meta:
        model = Car
        fields = {
            'district': ['exact'],
            'model_info__brand': ['icontains'],
            'model_info__transmission': ['exact'],
            'model_info__fuel_type': ['exact'],
            'model_info__seats': ['exact'],
        }

class CarModelViewSet(viewsets.ModelViewSet):
    queryset = CarModel.objects.prefetch_related('images', 'units', 'amenities').all()
    serializer_class = CarModelSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['allows_chauffeur']
    search_fields = ['brand', 'model_name']
    ordering_fields = ['base_daily_price', 'created_at']
    permission_classes = [permissions.AllowAny]

class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.select_related('model_info', 'district').prefetch_related(
        'model_info__images', 
        'model_info__amenities',
        'reviews',
        'reviews__user'
    ).all()
    serializer_class = CarSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CarFilter
    search_fields = ['brand', 'model', 'address']
    ordering_fields = ['daily_price', 'year', 'created_at', 'rating']

    def get_object(self):
        from django.http import Http404
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_val = self.kwargs[lookup_url_kwarg]
        
        # 1. Try slug
        obj = queryset.filter(slug=lookup_val).first()
        
        # 2. Try ID if numeric (for robustness)
        if not obj and str(lookup_val).isdigit():
            obj = queryset.filter(id=lookup_val).first()
            
        if not obj:
            raise Http404
            
        # Standard DRF permission checks
        self.check_object_permissions(self.request, obj)
        return obj

    @action(detail=True, methods=['get'])
    def availability(self, request, slug=None):
        car = self.get_object()
        from apps.bookings.models import Booking
        from django.db.models import Q
        
        # Get all bookings that are not cancelled or rejected
        from datetime import timedelta
        
        qs = Booking.objects.filter(
            car=car
        ).exclude(
            status__in=['cancelled', 'rejected']
        )
        
        booked_ranges = []
        booked_dates = []
        
        for b in qs:
            booked_ranges.append({
                "start": b.start_date.strftime('%Y-%m-%d'),
                "end": b.end_date.strftime('%Y-%m-%d')
            })
            # Also fill individual dates for easier frontend check
            curr = b.start_date
            while curr <= b.end_date:
                booked_dates.append(curr.strftime('%Y-%m-%d'))
                curr += timedelta(days=1)

        return Response({
            "booked_dates": list(set(booked_dates)),
            "booked_ranges": booked_ranges
        })

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'availability']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
