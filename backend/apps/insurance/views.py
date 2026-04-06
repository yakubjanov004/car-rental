from rest_framework import viewsets, permissions
from .models import InsurancePlan, BookingInsurance
from .serializers import InsurancePlanSerializer, BookingInsuranceSerializer


class InsurancePlanViewSet(viewsets.ModelViewSet):
    queryset = InsurancePlan.objects.all().order_by('sort_order', 'name')
    serializer_class = InsurancePlanSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class BookingInsuranceViewSet(viewsets.ModelViewSet):
    queryset = BookingInsurance.objects.select_related('booking', 'plan').all()
    serializer_class = BookingInsuranceSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return self.queryset
        return self.queryset.filter(booking__user=user)

    def get_permissions(self):
        return [permissions.IsAuthenticated()]
