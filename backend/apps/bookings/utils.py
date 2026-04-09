import random
import string
from django.utils.crypto import get_random_string

def generate_booking_code():
    """Generates a unique booking code in RL-XXXXXX format."""
    from apps.bookings.models import Booking
    
    while True:
        # Generate 6 random alphanumeric characters (UC)
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        booking_code = f"RL-{code}"
        
        # Ensure uniqueness
        if not Booking.objects.filter(booking_code=booking_code).exists():
            return booking_code
