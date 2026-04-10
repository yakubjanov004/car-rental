from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import InsurancePlanViewSet, BookingInsuranceViewSet

router = SimpleRouter()
router.register(r'plans', InsurancePlanViewSet, basename='insurance-plans')
router.register(r'booking-insurance', BookingInsuranceViewSet, basename='booking-insurance')

urlpatterns = [
    path('', include(router.urls)),
]
