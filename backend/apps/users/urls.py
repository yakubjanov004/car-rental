from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, UserProfileViewSet, LogoutView, AdminUserViewSet, NotificationViewSet
from .kyc_views import KYCProfileViewSet, AdminKYCViewSet

router = DefaultRouter()
router.register('admin/users', AdminUserViewSet, basename='admin_users')
router.register('admin/kyc', AdminKYCViewSet, basename='admin_kyc')
router.register('notifications', NotificationViewSet, basename='notifications')
router.register('me', UserProfileViewSet, basename='user_profile')
router.register('kyc', KYCProfileViewSet, basename='kyc')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
]
