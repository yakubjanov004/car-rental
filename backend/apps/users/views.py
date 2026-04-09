from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer, UserAdminSerializer

User = get_user_model()

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-id')
    serializer_class = UserAdminSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        user = self.get_object()
        v_status = request.data.get('status')
        reason = request.data.get('rejection_reason', "")
        
        if v_status in ['verified', 'rejected']:
            # Update User status (legacy compat)
            user.verification_status = v_status
            user.save()
            
            # Update KYCProfile
            from .models import KYCProfile
            from django.utils import timezone
            kyc, _ = KYCProfile.objects.get_or_create(user=user)
            kyc.status = 'approved' if v_status == 'verified' else 'rejected'
            kyc.rejection_reason = reason
            kyc.reviewed_by = self.request.user
            kyc.reviewed_at = timezone.now()
            kyc.save()
            
            return Response({"message": f"User status updated to {v_status}"})
        return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def list(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='change-password')
    def change_password(self, request):
        user = self.get_object()
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not user.check_password(old_password):
            return Response({"error": "Eski parol noto'g'ri"}, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(new_password)
        user.save()
        return Response({"message": "Parol muvaffaqiyatli o'zgartirildi"})

    @action(detail=False, methods=['post'], url_path='upload-documents')
    def upload_documents(self, request):
        user = self.get_object()
        passport = request.FILES.get('passport_image')
        license = request.FILES.get('driver_license_image')
        
        if passport:
            user.passport_image = passport
        if license:
            user.driver_license_image = license
            
        if passport or license:
            user.verification_status = 'pending'
            user.save()
            return Response({"status": "pending", "message": "Hujjatlar qabul qilindi va tekshiruvga yuborildi."})
        
        return Response({"error": "Fayllar topilmadi"}, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            from rest_framework_simplejwt.tokens import RefreshToken
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)


from .models import Notification
from .serializers import NotificationSerializer
from rest_framework.permissions import IsAuthenticated

from django.db.models import Q

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Notification.objects.filter(
                Q(user=user) | Q(admin_only=True)
            ).order_by('-created_at')
        return Notification.objects.filter(user=user, admin_only=False).order_by('-created_at')

    @action(detail=True, methods=['post'], url_path='read')
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=['post'], url_path='read-all')
    def mark_all_as_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({"status": "all_read"})
