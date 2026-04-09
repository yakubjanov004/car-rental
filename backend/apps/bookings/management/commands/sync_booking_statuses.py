from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.bookings.models import Booking
import logging

logger = logging.getLogger('apps.bookings')

class Command(BaseCommand):
    help = 'Sync booking statuses based on start and end datetimes'

    def handle(self, *args, **options):
        now = timezone.now()
        self.stdout.write(f"Syncing booking statuses at {now}")

        # 1. confirmed -> active
        to_active = Booking.objects.filter(
            status='confirmed',
            start_datetime__lte=now
        ).update(status='active')

        if to_active > 0:
            logger.info(f"Updated {to_active} bookings to ACTIVE")
            self.stdout.write(self.style.SUCCESS(f"Updated {to_active} bookings to ACTIVE"))

        # 2. active -> completed
        to_completed = Booking.objects.filter(
            status='active',
            end_datetime__lte=now
        ).update(status='completed')

        if to_completed > 0:
            logger.info(f"Updated {to_completed} bookings to COMPLETED")
            self.stdout.write(self.style.SUCCESS(f"Updated {to_completed} bookings to COMPLETED"))

        self.stdout.write("Status sync complete.")
