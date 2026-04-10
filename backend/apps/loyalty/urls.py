from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import LoyaltyTierViewSet, LoyaltyAccountViewSet

router = SimpleRouter()
router.register(r'tiers', LoyaltyTierViewSet, basename='loyalty-tiers')
router.register(r'accounts', LoyaltyAccountViewSet, basename='loyalty-accounts')

urlpatterns = [
    path('', include(router.urls)),
]
