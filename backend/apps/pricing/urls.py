from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import PricingRuleViewSet

router = SimpleRouter()
router.register(r'rules', PricingRuleViewSet, basename='pricing-rules')

urlpatterns = [
    path('', include(router.urls)),
]
