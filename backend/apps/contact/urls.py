from django.urls import path
from .views import ContactMessageCreateView, ContactMessageListView, ContactMessageDetailView

urlpatterns = [
    path('', ContactMessageCreateView.as_view(), name='contact_create'),
    path('list/', ContactMessageListView.as_view(), name='contact_list'),
    path('<int:pk>/', ContactMessageDetailView.as_view(), name='contact_detail'),
]
