from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CarViewSet, CarModelViewSet, MaintenanceViewSet

router = DefaultRouter()
router.register(r'car-models', CarModelViewSet, basename='carmodels')
router.register(r'maintenance', MaintenanceViewSet)
router.register(r'', CarViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
