from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import CarViewSet, CarModelViewSet, MaintenanceViewSet

router = SimpleRouter()
router.register(r'car-models', CarModelViewSet, basename='carmodels')
router.register(r'maintenance', MaintenanceViewSet)
router.register(r'', CarViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
