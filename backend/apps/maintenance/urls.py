from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import MaintenanceTypeViewSet, MaintenanceRecordViewSet

router = SimpleRouter()
router.register(r'types', MaintenanceTypeViewSet, basename='maintenance-types')
router.register(r'records', MaintenanceRecordViewSet, basename='maintenance-records')

urlpatterns = [
    path('', include(router.urls)),
]
