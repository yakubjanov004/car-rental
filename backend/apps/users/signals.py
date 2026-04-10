from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import KYCProfile

User = get_user_model()

@receiver(post_save, sender=User)
def create_kyc_profile(sender, instance, created, **kwargs):
    if created:
        KYCProfile.objects.get_or_create(user=instance)

@receiver(post_save, sender=User)
def save_kyc_profile(sender, instance, **kwargs):
    if hasattr(instance, 'kyc'):
        instance.kyc.save()

@receiver(post_save, sender=KYCProfile)
def kyc_status_changed(sender, instance, **kwargs):
    from .utils import notify_admins, send_notification
    
    # Check if a status change occurred (simple check for now)
    if instance.status == 'submitted':
        notify_admins(
            'kyc_submitted',
            'Yangi KYC hujjatlari',
            f"{instance.user.username} hujjatlarini tekshiruvga yubordi.",
            {'user_id': instance.user.id}
        )
    elif instance.status == 'approved':
        send_notification(
            instance.user,
            'kyc_approved',
            'Profilingiz tasdiqlandi!',
            "Tabriklaymiz, endi siz RENTAL CAR xizmatlaridan to'liq foydalanishingiz mumkin."
        )
    elif instance.status == 'rejected':
        send_notification(
            instance.user,
            'kyc_rejected',
            'Hujjatlar rad etildi',
            f"Sabab: {instance.rejection_reason or 'Ma\'lumotlar noto\'g\'ri bo\'lishi mumkin.'}"
        )
