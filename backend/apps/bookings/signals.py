from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Booking
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Booking)
def send_booking_notification(sender, instance, created, **kwargs):
    if created:
        print(f"\n[NOTIFICATION MOCK] SMS Yuborildi: Yangi bron qabul qilindi. Booking ID: {instance.id}")
    else:
        print(f"\n[NOTIFICATION MOCK] Email & SMS Yuborildi: {instance.user.username}, sizning broningiz holati yangilandi: {instance.status.upper()}")

@receiver(post_save, sender=Booking)
def award_loyalty_points(sender, instance, created, **kwargs):
    """Bronlash 'completed' yoki 'paid' holatiga o'tganda ball beradi."""
    if not created and instance.status in ['completed', 'paid']:
        from apps.loyalty.models import LoyaltyAccount
        
        # Har 10,000 so'm uchun 1 ball
        points_to_award = int(instance.total_price // 10000)
        
        if points_to_award > 0:
            # Tekshirish: bu bron uchun ball berilganmi?
            from apps.loyalty.models import LoyaltyTransaction
            if not LoyaltyTransaction.objects.filter(booking=instance, transaction_type='earn').exists():
                account, _ = LoyaltyAccount.objects.get_or_create(user=instance.user)
                account.add_points(points_to_award, f"Bron uchun ball #{instance.id}", booking=instance)
                print(f"\n[LOYALTY MOCK] {instance.user.username} ga {points_to_award} ball berildi (Booking #{instance.id})")
