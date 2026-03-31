from django.urls import path
from .views import FavoriteToggleView, MyFavoritesView

urlpatterns = [
    path('my/', MyFavoritesView.as_view(), name='my_favorites'),
    path('<int:car_id>/', FavoriteToggleView.as_view(), name='favorite_toggle'),
]
