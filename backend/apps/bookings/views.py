from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Booking, Fine, Waitlist
from .serializers import BookingSerializer, FineSerializer, WaitlistSerializer

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
        return Booking.objects.filter(user=self.request.user).order_by('-created_at')


class BookingListView(generics.ListAPIView):
    """Admin — barcha bronlarni ko'rish."""
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingSerializer
    permission_classes = (permissions.IsAdminUser,)


class BookingDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = BookingSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if self.request.user.is_staff:
            return Booking.objects.all()
        return Booking.objects.filter(user=self.request.user)


class BookingStatusUpdateView(APIView):
    """Admin — bron statusini o'zgartirish (pending/approved/rejected/cancelled)."""
    permission_classes = (permissions.IsAdminUser,)

    def patch(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({'detail': 'Topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        valid_statuses = ['pending', 'approved', 'rejected', 'cancelled', 'completed']
        if new_status not in valid_statuses:
            return Response(
                {'detail': f"Noto'g'ri status. Mumkin: {', '.join(valid_statuses)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.status = new_status
        booking.save()
        serializer = BookingSerializer(booking)
        return Response(serializer.data)


class BookingAvailabilityView(APIView):
    """Avtomobil bandligini tekshirish."""
    permission_classes = (permissions.AllowAny,)

    def get(self, request, car_id):
        from_date = request.query_params.get('from')
        to_date = request.query_params.get('to')

        if not from_date or not to_date:
            return Response({'detail': 'from va to parametrlari kerak.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from_date = datetime.strptime(from_date, '%Y-%m-%d').date()
            to_date = datetime.strptime(to_date, '%Y-%m-%d').date()
        except ValueError:
            return Response({'detail': 'Sana formati: YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)

        conflicting = Booking.objects.filter(
            car_id=car_id,
            status__in=['pending', 'approved'],
            start_date__lte=to_date,
            end_date__gte=from_date,
        )

        booked_dates = []
        for b in conflicting:
            booked_dates.append({
                'start_date': b.start_date.isoformat(),
                'end_date': b.end_date.isoformat(),
                'status': b.status,
            })

        return Response({
            'available': not conflicting.exists(),
            'booked_ranges': booked_dates,
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

