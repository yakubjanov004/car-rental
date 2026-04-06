from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/cars/', include('apps.cars.urls')),
    path('api/districts/', include('apps.districts.urls')),
    path('api/bookings/', include('apps.bookings.urls')),
    path('api/reviews/', include('apps.reviews.urls')),
    path('api/favorites/', include('apps.favorites.urls')),
    path('api/contact/', include('apps.contact.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/maintenance/', include('apps.maintenance.urls')),
    path('api/insurance/', include('apps.insurance.urls')),
    path('api/loyalty/', include('apps.loyalty.urls')),
    path('api/pricing/', include('apps.pricing.urls')),
    path('api/admin-panel/', include('apps.admin_panel.urls')),
    # Swagger
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
