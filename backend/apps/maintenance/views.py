from rest_framework import viewsets, permissions
from .models import MaintenanceType, MaintenanceRecord
from .serializers import MaintenanceTypeSerializer, MaintenanceRecordSerializer


class MaintenanceTypeViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceType.objects.all().order_by('name')
    serializer_class = MaintenanceTypeSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]


class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRecord.objects.select_related('car', 'maintenance_type').all()
    serializer_class = MaintenanceRecordSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]
