from datetime import datetime
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import PricingRule
from .serializers import PricingRuleSerializer
from .engine import PriceEngine
from apps.cars.models import Car


class PricingRuleViewSet(viewsets.ModelViewSet):
    queryset = PricingRule.objects.all().order_by('-priority')
    serializer_class = PricingRuleSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'calculate']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    @action(detail=False, methods=['get'], url_path='calculate')
    def calculate(self, request):
        car_id = request.query_params.get('car_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not all([car_id, start_date, end_date]):
            return Response(
                {'error': 'car_id, start_date, end_date required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            car = Car.objects.select_related('model_info').get(id=car_id)
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
        except (Car.DoesNotExist, ValueError):
            return Response({'error': 'Invalid input values'}, status=status.HTTP_400_BAD_REQUEST)

        engine = PriceEngine(car=car, start_date=start, end_date=end)
        return Response(engine.calculate())
