from rest_framework import generics, permissions
from .models import District
from .serializers import DistrictSerializer

class DistrictListView(generics.ListAPIView):
    queryset = District.objects.all()
    serializer_class = DistrictSerializer
    permission_classes = (permissions.AllowAny,)
