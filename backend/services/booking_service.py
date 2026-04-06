from datetime import date
from decimal import Decimal


def calculate_booking_total(car, start_date: date, end_date: date, include_chauffeur=False):
    days = max(1, (end_date - start_date).days)
    total = Decimal(car.daily_price) * days
    if include_chauffeur:
        total += Decimal('150000') * days
    return total
