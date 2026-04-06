from apps.pricing.engine import PriceEngine


def calculate_dynamic_price(car, start_date, end_date):
    engine = PriceEngine(car=car, start_date=start_date, end_date=end_date)
    return engine.calculate()
