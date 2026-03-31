from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Favorite
from .serializers import FavoriteSerializer
from apps.cars.models import Car


class FavoriteToggleView(generics.GenericAPIView):
    """POST — sevimliga qo'shish, DELETE — sevimlilardan olib tashlash."""
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = FavoriteSerializer

    def post(self, request, car_id):
        car = Car.objects.get(pk=car_id)
        fav, created = Favorite.objects.get_or_create(user=request.user, car=car)
        if not created:
            return Response({'detail': 'Allaqachon sevimlilar ro\'yxatida.'}, status=status.HTTP_200_OK)
        serializer = self.get_serializer(fav)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request, car_id):
        try:
            fav = Favorite.objects.get(user=request.user, car_id=car_id)
            fav.delete()
            return Response({'detail': 'Sevimlilardan olib tashlandi.'}, status=status.HTTP_204_NO_CONTENT)
        except Favorite.DoesNotExist:
            return Response({'detail': 'Sevimlilar ro\'yxatida topilmadi.'}, status=status.HTTP_404_NOT_FOUND)


class MyFavoritesView(generics.ListAPIView):
    """Foydalanuvchining sevimli avtomobillar ro'yxati."""
    serializer_class = FavoriteSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)
