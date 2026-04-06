from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import LoyaltyTier, LoyaltyAccount
from .serializers import LoyaltyTierSerializer, LoyaltyAccountSerializer


class LoyaltyTierViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LoyaltyTier.objects.all().order_by('min_points')
    serializer_class = LoyaltyTierSerializer
    permission_classes = [permissions.AllowAny]


class LoyaltyAccountViewSet(viewsets.ModelViewSet):
    queryset = LoyaltyAccount.objects.select_related('user', 'tier').prefetch_related('transactions').all()
    serializer_class = LoyaltyAccountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return self.queryset
        return self.queryset.filter(user=user)

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        account, _ = LoyaltyAccount.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(account)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='redeem')
    def redeem(self, request):
        account, _ = LoyaltyAccount.objects.get_or_create(user=request.user)
        amount = int(request.data.get('points', 0))
        reason = request.data.get('reason', 'Reward redemption')

        try:
            account.redeem_points(amount, reason)
            return Response({'status': 'ok', 'points': account.points})
        except ValueError:
            return Response({'error': 'Not enough points'}, status=status.HTTP_400_BAD_REQUEST)
