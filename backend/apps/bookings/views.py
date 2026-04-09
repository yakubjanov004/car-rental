from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Booking, Fine, Waitlist
from .serializers import BookingSerializer, FineSerializer, WaitlistSerializer
import logging

logger = logging.getLogger('apps.bookings')

class WaitlistViewSet(viewsets.ModelViewSet):
    serializer_class = WaitlistSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Waitlist.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
from apps.cars.models import Car
from datetime import datetime


class BookingCreateView(generics.CreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        booking = serializer.save(user=self.request.user)
        logger.info(f"Booking created: {booking.booking_code} by user {self.request.user.username}")
        
        # Award loyalty points: 1 point for every 100,000 UZS
        points = int(booking.total_price // 100000)
        if points > 0:
            user = self.request.user
            user.loyalty_points += points
            user.save()
            
            # Send notification about points (Simulated)
            from apps.users.models import Notification
            Notification.objects.create(
                user=user,
                title="Sodiqlik ballari!",
                message=f"Tabriklaymiz! Ushbu buyurtma uchun siz {points} ball to'pladingiz."
            )


class MyBookingsView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related('car', 'user').order_by('-created_at')


class BookingListView(generics.ListAPIView):
    """Admin — barcha bronlarni ko'rish."""
    queryset = Booking.objects.all().select_related('car', 'user').order_by('-created_at')
    serializer_class = BookingSerializer
    permission_classes = (permissions.IsAdminUser,)


class BookingDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = BookingSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if self.request.user.is_staff:
            return Booking.objects.all().select_related('car', 'user')
        return Booking.objects.filter(user=self.request.user).select_related('car', 'user')


class BookingStatusUpdateView(APIView):
    """Admin — bron statusini o'zgartirish."""
    permission_classes = (permissions.IsAdminUser,)

    def patch(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({'detail': 'Topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        valid_statuses = [s[0] for s in Booking.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {'detail': f"Noto'g'ri status. Mumkin: {', '.join(valid_statuses)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.status = new_status
        reason = request.data.get('rejection_reason')
        if reason:
            booking.rejection_reason = reason
        booking.save()
        serializer = BookingSerializer(booking)
        return Response(serializer.data)


class BookingAvailabilityView(APIView):
    """Avtomobil bandligini tekshirish."""
    permission_classes = (permissions.AllowAny,)

    def get(self, request, car_id):
        from_dt_str = request.query_params.get('from')
        to_dt_str = request.query_params.get('to')

        if not from_dt_str or not to_dt_str:
            return Response({'detail': 'from va to (ISO format) parametrlari kerak.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Handle both date and datetime formats for flexibility
            if len(from_dt_str) <= 10:
                from_dt = datetime.strptime(from_dt_str, '%Y-%m-%d')
                to_dt = datetime.strptime(to_dt_str, '%Y-%m-%d')
            else:
                from_dt = datetime.fromisoformat(from_dt_str.replace('Z', '+00:00'))
                to_dt = datetime.fromisoformat(to_dt_str.replace('Z', '+00:00'))
        except ValueError:
            return Response({'detail': 'Sana formati: YYYY-MM-DD yoki ISO DateTime'}, status=status.HTTP_400_BAD_REQUEST)

        conflicting = Booking.objects.filter(
            car_id=car_id,
            status__in=['pending', 'payment_pending', 'confirmed', 'active'],
            start_datetime__lt=to_dt,
            end_datetime__gt=from_dt,
        )

        from apps.cars.models import MaintenanceRecord
        maintenance = MaintenanceRecord.objects.filter(
            car_id=car_id,
            start_datetime__lt=to_dt,
            end_datetime__gt=from_dt,
        )

        booked_ranges = []
        for b in conflicting:
            booked_ranges.append({
                'start': b.start_datetime.isoformat(),
                'end': b.end_datetime.isoformat(),
                'status': b.status,
                'type': 'booking'
            })
            
        for m in maintenance:
            booked_ranges.append({
                'start': m.start_datetime.isoformat(),
                'end': m.end_datetime.isoformat(),
                'status': 'maintenance',
                'type': 'maintenance',
                'reason': m.reason
            })

        return Response({
            'available': not conflicting.exists() and not maintenance.exists(),
            'booked_ranges': booked_ranges,
        })


class BookingCancelView(APIView):
    """Foydalanuvchi o'zining 'pending' statusdagi bronini bekor qilishi."""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk, user=request.user)
        except Booking.DoesNotExist:
            return Response({'detail': 'Bron topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        if booking.status != 'pending':
            return Response(
                {'detail': "Faqat 'kutilayotgan' (pending) statusdagi bronlarni bekor qilish mumkin."},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.status = 'cancelled'
        booking.save()
        serializer = BookingSerializer(booking)
        return Response(serializer.data)


class MyFinesView(generics.ListAPIView):
    serializer_class = FineSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Fine.objects.filter(booking__user=self.request.user).order_by('-issued_at')

