from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum
from apps.bookings.models import Booking
from apps.cars.models import Car
from apps.contact.models import ContactMessage

from django.db.models.functions import TruncMonth
from django.db.models import Count

class AdminStatsView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        total_bookings = Booking.objects.count()
        active_cars = Car.objects.filter(is_available=True).count()
        total_messages = ContactMessage.objects.count()
        unread_messages = ContactMessage.objects.filter(is_read=False).count()
        
        revenue_data = Booking.objects.filter(status__in=['approved', 'completed']).aggregate(total=Sum('total_price'))
        total_revenue = float(revenue_data['total'] or 0)

        # Advanced stats for Chart.js
        status_counts = list(Booking.objects.values('status').annotate(count=Count('id')))
        monthly_revenue = list(
            Booking.objects.filter(status__in=['approved', 'completed'])
            .annotate(month=TruncMonth('start_date'))
            .values('month')
            .annotate(revenue=Sum('total_price'))
            .order_by('month')
        )

        return Response({
            'total_bookings': total_bookings,
            'active_cars': active_cars,
            'total_messages': total_messages,
            'unread_messages': unread_messages,
            'total_revenue': total_revenue,
            'recent_bookings_count': Booking.objects.filter(status='pending').count(),
            'status_counts': status_counts,
            'monthly_revenue': monthly_revenue
        })

