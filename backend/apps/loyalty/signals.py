from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.bookings.models import Booking
from .models import LoyaltyAccount

@receiver(post_save, sender=Booking)
def handle_booking_loyalty(sender, instance, created, **kwargs):
    """
    Adds loyalty points when booking is marked as COMPLETED.
    Ensures points are added only once per booking.
    """
    if instance.status == 'completed':
        # Check if points already awarded to avoid duplicates
        from .models import LoyaltyTransaction
        if not LoyaltyTransaction.objects.filter(booking=instance, transaction_type='earn').exists():
            account, _ = LoyaltyAccount.objects.get_or_create(user=instance.user)
            
            # Points calculation: e.g., 10 points for every 100,000 UZS
            # total_price is Decimal, convert to int
            amount = float(instance.total_price)
            points_to_add = max(1, int(amount / 100000) * 10)
            
            account.add_points(
                amount=points_to_add,
                reason=f"Booking #{instance.booking_code} yakunlangani uchun",
                booking=instance
            )
