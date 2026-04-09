from rest_framework import viewsets, permissions, status, decorators
from rest_framework.response import Response
from django.utils import timezone
from .models import KYCProfile
from .kyc_serializers import KYCProfileSerializer, KYCReviewSerializer

class KYCProfileViewSet(viewsets.ModelViewSet):
    serializer_class = KYCProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = 'kyc_submit'

    def get_queryset(self):
        return KYCProfile.objects.filter(user=self.request.user)

    def get_object(self):
        obj, created = KYCProfile.objects.get_or_create(user=self.request.user)
        return obj

    @decorators.action(detail=False, methods=['post'], url_path='submit')
    def submit_for_review(self, request):
        kyc = self.get_object()
        if kyc.status in ['approved', 'under_review']:
            return Response(
                {"error": f"KYC status is {kyc.status}, cannot submit."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Basic validation: ensure images are present
        if not kyc.passport_front_image or not kyc.license_image:
             return Response(
                {"error": "Passport and Driver License images are required for submission."},
                status=status.HTTP_400_BAD_REQUEST
            )

        kyc.status = 'under_review'
        kyc.submitted_at = timezone.now()
        kyc.save()
        
        # Update user's general verification status
        user = request.user
        user.verification_status = 'pending'
        user.save()
        
        return Response(KYCProfileSerializer(kyc).data)

    @decorators.action(detail=False, methods=['post'], url_path='upload-documents')
    def upload_documents(self, request):
        kyc = self.get_object()
        if kyc.status == 'approved':
             return Response({"error": "Verified profile cannot be changed."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = KYCProfileSerializer(kyc, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminKYCViewSet(viewsets.ModelViewSet):
    queryset = KYCProfile.objects.filter(status='under_review')
    serializer_class = KYCProfileSerializer
    permission_classes = [permissions.IsAdminUser]

    @decorators.action(detail=True, methods=['post'], url_path='review')
    def review(self, request, pk=None):
        kyc = self.get_object()
        serializer = KYCReviewSerializer(data=request.data)
        
        if serializer.is_valid():
            reviewer_status = serializer.validated_data['status']
            reason = serializer.validated_data.get('rejection_reason', '')
            
            kyc.status = reviewer_status
            kyc.rejection_reason = reason
            kyc.reviewed_by = request.user
            kyc.reviewed_at = timezone.now()
            kyc.save()
            
            # Sync with User model
            user = kyc.user
            if reviewer_status == 'approved':
                user.verification_status = 'verified'
            else:
                user.verification_status = 'rejected'
            user.save()

            return Response(KYCProfileSerializer(kyc).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
