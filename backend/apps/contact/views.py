from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import ContactMessage
from .serializers import ContactMessageSerializer


class ContactMessageCreateView(generics.CreateAPIView):
    """Har kim xabar yuborishi mumkin."""
    serializer_class = ContactMessageSerializer
    permission_classes = (permissions.AllowAny,)


class ContactMessageListView(generics.ListAPIView):
    """Faqat admin ko'rishi mumkin."""
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = (permissions.IsAdminUser,)


class ContactMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin xabarni o'qigan deb belgilashi yoki o'chirishi mumkin."""
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = (permissions.IsAdminUser,)
