from django.urls import path
from .views import DistrictListView

urlpatterns = [
    path('', DistrictListView.as_view(), name='district_list'),
]
