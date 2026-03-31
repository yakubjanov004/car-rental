from django.urls import path
from .views import ReviewListCreateView

urlpatterns = [
    path('<int:car_id>/', ReviewListCreateView.as_view(), name='review_list_create'),
]
