import os
import django
import random
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.districts.models import District
from apps.cars.models import Car
from django.contrib.auth import get_user_model
from django.utils.text import slugify

User = get_user_model()

def seed_db():
    print("Seeding database...")
    
    # 1. Create Districts
    tumanlar = [
        "Bektemir", "Chilonzor", "Mirzo Ulug'bek", "Mirobod",
        "Olmazor", "Sergeli", "Shayxontohur", "Uchtepa",
        "Yakkasaroy", "Yashnobod", "Yunusobod", "Yangihayot"
    ]
    
    district_objs = {}
    for nomi in tumanlar:
        d, created = District.objects.get_or_create(name=nomi)
        district_objs[nomi] = d
    
    print(f"Created {len(district_objs)} districts.")

    # 2. Create Users
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@ridelux.uz', 'admin123')
        print("Admin user created (admin / admin123)")
    
    if not User.objects.filter(username='testuser').exists():
        User.objects.create_user('testuser', 'test@ridelux.uz', 'test1234')
        print("Test user created (testuser / test1234)")

    # 3. Create Cars
    cars_data = [
        {"brand": "Chevrolet", "model": "Cobalt", "year": 2023, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 250000, "depozit": 1000000, "tuman": "Chilonzor", "rasm": "cobalt.jpg", "color": "Oq"},
        {"brand": "Chevrolet", "model": "Gentra", "year": 2022, "uzatma": "manual", "yoqilgi": "gaz", "narx": 200000, "depozit": 800000, "tuman": "Yunusobod", "rasm": "gentra.jpg", "color": "Kumush"},
        {"brand": "Chevrolet", "model": "Nexia 3", "year": 2021, "uzatma": "manual", "yoqilgi": "gaz", "narx": 180000, "depozit": 700000, "tuman": "Olmazor", "rasm": "nexia3.jpg", "color": "Qora"},
        {"brand": "Chevrolet", "model": "Spark", "year": 2023, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 150000, "depozit": 500000, "tuman": "Yakkasaroy", "rasm": "spark.jpg", "color": "Qizil"},
        {"brand": "Chevrolet", "model": "Damas", "year": 2020, "uzatma": "manual", "yoqilgi": "gaz", "narx": 120000, "depozit": 400000, "tuman": "Sergeli", "rasm": "damas.jpg", "color": "Oq"},
        {"brand": "Chevrolet", "model": "Lacetti", "year": 2022, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 220000, "depozit": 900000, "tuman": "Mirzo Ulug'bek", "rasm": "lacetti.jpg", "color": "Ko'k"},
        {"brand": "Chevrolet", "model": "Malibu 2", "year": 2024, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 450000, "depozit": 2000000, "tuman": "Mirobod", "rasm": "malibu.jpg", "color": "Qora"},
        {"brand": "Chevrolet", "model": "Tracker 2", "year": 2024, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 400000, "depozit": 1800000, "tuman": "Yunusobod", "rasm": "tracker.jpg", "color": "Oq"},
        {"brand": "Chevrolet", "model": "Onix", "year": 2023, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 280000, "depozit": 1200000, "tuman": "Shayxontohur", "rasm": "onix.jpg", "color": "Kulrang"},
        {"brand": "Chevrolet", "model": "Captiva", "year": 2024, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 500000, "depozit": 2500000, "tuman": "Mirobod", "rasm": "captiva.jpg", "color": "Oq"},
        {"brand": "Chevrolet", "model": "Equinox", "year": 2024, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 550000, "depozit": 3000000, "tuman": "Yakkasaroy", "rasm": "equinox.jpg", "color": "Qora"},
        {"brand": "BYD", "model": "Atto 3", "year": 2024, "uzatma": "automatic", "yoqilgi": "elektro", "narx": 480000, "depozit": 2200000, "tuman": "Mirzo Ulug'bek", "rasm": "byd-atto3.jpg", "color": "Moviy"},
        {"brand": "Kia", "model": "Sonet", "year": 2024, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 350000, "depozit": 1500000, "tuman": "Chilonzor", "rasm": "kia-sonet.jpg", "color": "Qizil"},
        {"brand": "BYD", "model": "Song Plus", "year": 2024, "uzatma": "automatic", "yoqilgi": "gibrid", "narx": 550000, "depozit": 2500000, "tuman": "Yunusobod", "rasm": "byd-song.jpg", "color": "Oq"},
        {"brand": "BYD", "model": "Han", "year": 2024, "uzatma": "automatic", "yoqilgi": "elektro", "narx": 800000, "depozit": 5000000, "tuman": "Mirobod", "rasm": "byd-han.jpg", "color": "Qora"},
        {"brand": "Chery", "model": "Tiggo 7 Pro", "year": 2023, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 380000, "depozit": 1600000, "tuman": "Shayxontohur", "rasm": "chery-tiggo.jpg", "color": "Kumush"},
        {"brand": "Haval", "model": "Jolion", "year": 2024, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 360000, "depozit": 1500000, "tuman": "Olmazor", "rasm": "haval-jolion.jpg", "color": "Yashil"},
        {"brand": "Kia", "model": "EV6", "year": 2024, "uzatma": "automatic", "yoqilgi": "elektro", "narx": 900000, "depozit": 6000000, "tuman": "Yakkasaroy", "rasm": "kia-ev6.jpg", "color": "Qora"},
        {"brand": "Toyota", "model": "Camry 75", "year": 2023, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 600000, "depozit": 3000000, "tuman": "Yangihayot", "rasm": "camry.jpg", "color": "Oq"},
        {"brand": "Hyundai", "model": "Tucson", "year": 2024, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 480000, "depozit": 2200000, "tuman": "Sergeli", "rasm": "tucson.jpg", "color": "Havorang"},
    ]

    for c in cars_data:
        # Infer category
        cat = 'sedan'
        if c['model'] in ['Tracker 2', 'Captiva', 'Equinox', 'Atto 3', 'Song Plus', 'Tiggo 7 Pro', 'Jolion', 'Tucson']:
            cat = 'crossover'
        elif c['model'] in ['Damas']:
            cat = 'minivan'
        elif c['model'] in ['Han', 'EV6']:
            cat = 'premium'
        elif c['model'] in ['Malibu 2', 'Camry 75']:
            cat = 'premium'

        Car.objects.get_or_create(
            brand=c['brand'],
            model=c['model'],
            year=c['year'],
            defaults={
                'category': cat,
                'transmission': c['uzatma'],
                'fuel_type': c['yoqilgi'],
                'seats': 7 if c['model'] in ['Damas', 'Captiva'] else 5,
                'color': c['color'],
                'daily_price': Decimal(c['narx']),
                'deposit': Decimal(c['depozit']),
                'district': district_objs[c['tuman']],
                'address': f"{c['tuman']} tumani, Markaz ko'chasi",
                'main_image': f"cars/{c['rasm']}",
                'features': ["Konditsioner", "Bluetuz", "Orqa kamera", "Elektron oina"],
                'rating': round(random.uniform(4.2, 4.9), 1),
                'review_count': random.randint(10, 60),
                'is_available': True
            }
        )
    
    print(f"Created/Updated {Car.objects.count()} cars.")
    print("Seeding completed successfully!")

if __name__ == "__main__":
    seed_db()

