from .views import (
    BookingCreateView, MyBookingsView, BookingListView,
    BookingDetailView, BookingStatusUpdateView, BookingAvailabilityView,
    BookingCancelView, MyFinesView, WaitlistViewSet
)
from rest_framework.routers import SimpleRouter
from django.urls import path, include

router = SimpleRouter()
router.register(r'waitlist', WaitlistViewSet, basename='waitlist')

urlpatterns = [
    path('', BookingCreateView.as_view(), name='booking_create_root'),
    path('', include(router.urls)),
    path('create/', BookingCreateView.as_view(), name='booking_create'),
    path('my/', MyBookingsView.as_view(), name='my_bookings'),
    path('my-fines/', MyFinesView.as_view(), name='my_fines'),
    path('all/', BookingListView.as_view(), name='booking_list_admin'),
    path('<int:pk>/', BookingDetailView.as_view(), name='booking_detail'),
    path('<int:pk>/status/', BookingStatusUpdateView.as_view(), name='booking_status_update'),
    path('<int:pk>/cancel/', BookingCancelView.as_view(), name='booking_cancel'),
    path('availability/<int:car_id>/', BookingAvailabilityView.as_view(), name='booking_availability'),
]

