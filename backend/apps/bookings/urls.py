from django.urls import path
from .views import (
    BookingCreateView, MyBookingsView, BookingListView,
    BookingDetailView, BookingStatusUpdateView, BookingAvailabilityView,
    BookingCancelView
)

urlpatterns = [
    path('', BookingCreateView.as_view(), name='booking_create'),
    path('my/', MyBookingsView.as_view(), name='my_bookings'),
    path('all/', BookingListView.as_view(), name='booking_list_admin'),
    path('<int:pk>/', BookingDetailView.as_view(), name='booking_detail'),
    path('<int:pk>/status/', BookingStatusUpdateView.as_view(), name='booking_status_update'),
    path('<int:pk>/cancel/', BookingCancelView.as_view(), name='booking_cancel'),
    path('availability/<int:car_id>/', BookingAvailabilityView.as_view(), name='booking_availability'),
]

