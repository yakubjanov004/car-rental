from decimal import Decimal
from django.utils import timezone
from .models import PricingRule


class PriceEngine:
    def __init__(self, car, start_date, end_date):
        self.car = car
        self.start_date = start_date
        self.end_date = end_date
        self.days = max(1, (end_date - start_date).days)
        self.base_price = car.daily_price

    def calculate(self):
        active_rules = PricingRule.objects.filter(is_active=True).order_by('-priority')
        price_multiplier = Decimal('1.0')
        applied_rules = []

        for rule in active_rules:
            if self._rule_applies(rule):
                if rule.modifier_type == 'multiply':
                    price_multiplier *= rule.modifier_value
                else:
                    price_multiplier *= (Decimal('1.0') + (rule.modifier_value / Decimal('100')))
                applied_rules.append(rule.name)

        final_daily = (self.base_price * price_multiplier).quantize(Decimal('1.00'))
        total = final_daily * self.days
        savings = max(Decimal('0'), (self.base_price * self.days) - total)

        return {
            'base_daily': self.base_price,
            'final_daily': final_daily,
            'multiplier': float(price_multiplier),
            'total': total,
            'days': self.days,
            'applied_rules': applied_rules,
            'savings': savings,
            'is_surge': price_multiplier > Decimal('1.0'),
        }

    def _rule_applies(self, rule):
        if rule.applies_to_weekdays:
            allowed_days = [int(day.strip()) for day in rule.applies_to_weekdays.split(',') if day.strip().isdigit()]
            if allowed_days and self.start_date.weekday() not in allowed_days:
                return False

        if rule.date_from and rule.date_to and not (rule.date_from <= self.start_date <= rule.date_to):
            return False

        if rule.min_days and self.days < rule.min_days:
            return False

        if rule.days_before_start:
            days_ahead = (self.start_date - timezone.now().date()).days
            if days_ahead < rule.days_before_start:
                return False

        if not rule.applies_to_all and rule.applies_to_categories:
            categories = [value.strip() for value in rule.applies_to_categories.split(',') if value.strip()]
            if self.car.model_info.category not in categories:
                return False

        return True
