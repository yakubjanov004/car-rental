from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Booking
from apps.users.utils import notify_admins, send_notification

@receiver(post_save, sender=Booking)
def booking_event_notifications(sender, instance, created, **kwargs):
    if created:
        # 1. Notify Admins about new booking
        notify_admins(
            'booking_created',
            'Yangi Buyurtma!',
            f"{instance.user.username} tomonidan yangi buyurtma yaratildi: {instance.booking_code}",
            {'booking_id': instance.id, 'booking_code': instance.booking_code}
        )
    else:
        # 2. Notify User about status changes
        if instance.status == 'payment_pending':
            send_notification(
                instance.user,
                'booking_pending_admin',
                'Buyurtmangiz tasdiqlandi',
                f"Sizning {instance.booking_code} buyurtmangiz admin tomonidan tasdiqlandi. Iltimos, to'lovni amalga oshiring.",
                {'booking_id': instance.id}
            )
        elif instance.status == 'confirmed':
            send_notification(
                instance.user,
                'payment_completed',
                "To'lov muvaffaqiyatli!",
                f"{instance.booking_code} buyurtmasi uchun to'lov qabul qilindi. Mashina tayyorlanmoqda.",
                {'booking_id': instance.id}
            )
        elif instance.status == 'rejected':
            send_notification(
                instance.user,
                'booking_rejected',
                'Buyurtma rad etildi',
                f"Kechirasiz, {instance.booking_code} buyurtmasi admin tomonidan rad etildi.",
                {'booking_id': instance.id}
            )
