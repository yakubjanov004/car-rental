import os
import sys
import django
import random
from django.core.files.base import ContentFile
from decimal import Decimal

# Loyihaning ildiz papkasini (backend) sys.path ga qo'shish
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(CURRENT_DIR)
sys.path.append(BASE_DIR)

# Django muhitini sozlash
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.districts.models import District
from apps.cars.models import Car
from django.contrib.auth import get_user_model

User = get_user_model()

IMAGES_DIR = os.path.join(CURRENT_DIR, 'rentcar_images')

def get_car_image(img_name):
    """Mahalliy papkadan rasm yuklaydi"""
    local_path = os.path.join(IMAGES_DIR, img_name)
    
    if os.path.exists(local_path):
        print(f"📦 Mahalliy rasm: {img_name}")
        with open(local_path, 'rb') as f:
            return ContentFile(f.read(), name=img_name)

    print(f"❌ Rasm topilmadi: {img_name}")
    return None

def seed_db():
    print("🚀 RIDELUX Ma'lumotlar bazasini to'ldirish boshlandi...")
    
    tumanlar = [
        "Bektemir", "Chilonzor", "Mirzo Ulug'bek", "Mirobod",
        "Olmazor", "Sergeli", "Shayxontohur", "Uchtepa",
        "Yakkasaroy", "Yashnobod", "Yunusobod", "Yangihayot"
    ]
    
    district_objs = {nomi: District.objects.get_or_create(name=nomi)[0] for nomi in tumanlar}

    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@ridelux.uz', 'admin123')

    cars_data = [
        # Chevrolet
        {"brand": "Chevrolet", "model": "Malibu 2", "year": 2024, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 450000, "depozit": 2000000, "tuman": "Mirobod", "color": "Qora", "img": "Chevrolet_Malibu.jpg"},
        {"brand": "Chevrolet", "model": "Tahoe", "year": 2024, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 1500000, "depozit": 10000000, "tuman": "Yakkasaroy", "color": "Oq", "img": "Chevrolet_Tahoe.jpg"},
        {"brand": "Chevrolet", "model": "Traverse", "year": 2023, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 900000, "depozit": 5000000, "tuman": "Mirzo Ulug'bek", "color": "Kumush", "img": "Chevrolet_Traverse.jpg"},
        {"brand": "Chevrolet", "model": "Tracker 2", "year": 2024, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 380000, "depozit": 1500000, "tuman": "Yunusobod", "color": "To'q ko'k", "img": "Chevrolet_Tracker_2.jpg"},
        {"brand": "Chevrolet", "model": "Onix", "year": 2023, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 280000, "depozit": 1200000, "tuman": "Chilonzor", "color": "Oq", "img": "Chevrolet_Onix.png"},
        {"brand": "Chevrolet", "model": "Cobalt", "year": 2024, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 250000, "depozit": 1000000, "tuman": "Olmazor", "color": "Kulrang", "img": "Chevrolet_Cobalt.jpg"},
        {"brand": "Chevrolet", "model": "Gentra", "year": 2023, "uzatma": "automatic", "yoqilgi": "gaz", "narx": 220000, "depozit": 900000, "tuman": "Uchtepa", "color": "Qora", "img": "Chevrolet_Gentra.jpg"},
        {"brand": "Chevrolet", "model": "Spark", "year": 2022, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 160000, "depozit": 700000, "tuman": "Yashnobod", "color": "Qizil", "img": "Chevrolet_Spark.jpg"},
        
        # Kia
        {"brand": "Kia", "model": "K5", "year": 2024, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 550000, "depozit": 3000000, "tuman": "Mirobod", "color": "Qora", "img": "Kia_K5.jpg"},
        {"brand": "Kia", "model": "Sorento", "year": 2024, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 750000, "depozit": 4000000, "tuman": "Mirzo Ulug'bek", "color": "Oq", "img": "Kia_Sorento.jpg"},
        {"brand": "Kia", "model": "Carnival", "year": 2024, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 950000, "depozit": 5000000, "tuman": "Yakkasaroy", "color": "Qora", "img": "Kia_Carnival.jpg"},
        {"brand": "Kia", "model": "EV6", "year": 2024, "uzatma": "automatic", "yoqilgi": "elektro", "narx": 1100000, "depozit": 8000000, "tuman": "Mirobod", "color": "Matvyy", "img": "Kia_EV6.jpg"},
        {"brand": "Kia", "model": "Sonet", "year": 2024, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 350000, "depozit": 1500000, "tuman": "Chilonzor", "color": "Oq", "img": "Kia_Sonet.jpg"},

        # BYD
        {"brand": "BYD", "model": "Han", "year": 2024, "uzatma": "automatic", "yoqilgi": "elektro", "narx": 850000, "depozit": 5000000, "tuman": "Mirobod", "color": "To'q qizil", "img": "BYD_Han.jpg"},
        {"brand": "BYD", "model": "Song Plus", "year": 2024, "uzatma": "automatic", "yoqilgi": "gibrid", "narx": 580000, "depozit": 3000000, "tuman": "Yunusobod", "color": "Oq", "img": "BYD_Song_Plus.jpg"},
        {"brand": "BYD", "model": "Atto 3", "year": 2024, "uzatma": "automatic", "yoqilgi": "elektro", "narx": 480000, "depozit": 2500000, "tuman": "Mirzo Ulug'bek", "color": "Moviy", "img": "BYD_Atto_3.jpg"},
        {"brand": "BYD", "model": "Seal", "year": 2024, "uzatma": "automatic", "yoqilgi": "elektro", "narx": 950000, "depozit": 6000000, "tuman": "Yakkasaroy", "color": "Havorang", "img": "BYD_Seal.jpg"},
        {"brand": "BYD", "model": "Chazor", "year": 2024, "uzatma": "automatic", "yoqilgi": "gibrid", "narx": 320000, "depozit": 1500000, "tuman": "Sergeli", "color": "Kulrang", "img": "BYD_Chazor.jpg"},

        # Hyundai
        {"brand": "Hyundai", "model": "Santa Fe", "year": 2024, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 780000, "depozit": 4000000, "tuman": "Yunusobod", "color": "Oq", "img": "Hyundai_Santa_Fe.jpg"},
        {"brand": "Hyundai", "model": "Sonata", "year": 2024, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 520000, "depozit": 2500000, "tuman": "Mirobod", "color": "Qizil", "img": "Hyundai_Sonata.jpg"},
        {"brand": "Hyundai", "model": "Tucson", "year": 2024, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 480000, "depozit": 2200000, "tuman": "Chilonzor", "color": "Kumush", "img": "Hyundai_Tucson.jpg"},

        # Toyota
        {"brand": "Toyota", "model": "Camry 75", "year": 2023, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 650000, "depozit": 3500000, "tuman": "Mirzo Ulug'bek", "color": "Qora", "img": "Toyota_Camry_75.jpg"},
        {"brand": "Toyota", "model": "Land Cruiser 300", "year": 2024, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 2200000, "depozit": 15000000, "tuman": "Mirobod", "color": "Oq", "img": "Toyota_Land_Cruiser_300.jpg"},
        
        # Premium & Lux
        {"brand": "Mercedes-Benz", "model": "S-Class W223", "year": 2024, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 3500000, "depozit": 25000000, "tuman": "Mirobod", "color": "Qora", "img": "Mercedes_S_Class_W223.jpg"},
        {"brand": "Mercedes-Benz", "model": "G-Class G63", "year": 2024, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 4000000, "depozit": 30000000, "tuman": "Yakkasaroy", "color": "Matvyy", "img": "Mercedes_G63.jpg"},
        {"brand": "BMW", "model": "X7 M60i", "year": 2024, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 3200000, "depozit": 20000000, "tuman": "Mirzo Ulug'bek", "color": "Qora", "img": "BMW_X7_M60i.jpg"},
        {"brand": "BMW", "model": "M5 F90 CS", "year": 2023, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 2800000, "depozit": 15000000, "tuman": "Yakkasaroy", "color": "Yashil Mat", "img": "BMW_M5_F90_CS.jpg"},
        {"brand": "Tesla", "model": "Model Y", "year": 2024, "uzatma": "automatic", "yoqilgi": "elektro", "narx": 950000, "depozit": 5000000, "tuman": "Mirobod", "color": "Qizil", "img": "Tesla_Model_Y.jpg"},
        {"brand": "Tesla", "model": "Model S Plaid", "year": 2024, "uzatma": "automatic", "yoqilgi": "elektro", "narx": 1500000, "depozit": 10000000, "tuman": "Yakkasaroy", "color": "Qora", "img": "Tesla_Model_S_Plaid.jpg"},
        {"brand": "BMW", "model": "iX", "year": 2024, "uzatma": "automatic", "yoqilgi": "elektro", "narx": 1300000, "depozit": 8000000, "tuman": "Mirzo Ulug'bek", "color": "Oq", "img": "BMW_iX.jpg"},
        {"brand": "Porsche", "model": "Taycan Turbo S", "year": 2024, "uzatma": "automatic", "yoqilgi": "elektro", "narx": 2500000, "depozit": 20000000, "tuman": "Mirobod", "color": "Oq", "img": "Porsche_Taycan_Turbo_S.jpg"},
        {"brand": "Porsche", "model": "Cayenne Coupe", "year": 2024, "uzatma": "automatic", "yoqilgi": "benzin", "narx": 1800000, "depozit": 10000000, "tuman": "Yakkasaroy", "color": "Qora", "img": "Porsche_Cayenne_Coupe.jpg"},
    ]


    Car.objects.all().delete()
    print("🗑 Eski ma'lumotlar tozalandi.")

    for i, c in enumerate(cars_data):
        cat = 'sedan'
        m = c['model']
        
        # Kategoriyalarni aniqlash
        if m in ['Tahoe', 'Traverse', 'Sorento', 'Santa Fe', 'Land Cruiser 300', 'X7 M60i', 'iX', 'Cayenne Coupe']:
            cat = 'suv'
        elif m in ['Tracker 2', 'Sonet', 'Song Plus', 'Atto 3', 'Tucson', 'Model Y']:
            cat = 'crossover'
        elif m in ['Carnival']:
            cat = 'minivan'
        elif c['yoqilgi'] == 'elektro':
            cat = 'elektro'
        
        if m in ['Malibu 2', 'K5', 'Han', 'Sonata', 'Camry 75', 'S-Class W223', 'M5 F90 CS', 'Taycan Turbo S', 'Model S Plaid']:
            cat = 'premium'


        car_obj = Car(
            brand=c['brand'],
            model=c['model'],
            year=c['year'],
            category=cat,
            transmission=c['uzatma'],
            fuel_type=c['yoqilgi'],
            seats=7 if cat in ['suv', 'minivan'] else 5,
            color=c['color'],
            daily_price=Decimal(c['narx']),
            deposit=Decimal(c['depozit']),
            district=district_objs[c['tuman']],
            address=f"{c['tuman']} tumani, Markaz ko'chasi",
            features=["Konditsioner", "Bluetuz", "Orqa kamera", "Elektron o'yna", "Premium akustika", "Charm salon"],
            rating=round(random.uniform(4.5, 5.0), 1),
            review_count=random.randint(20, 100),
            is_available=True
        )

        # Rasmni topish va saqlash
        img_file = get_car_image(c['img'])
        if img_file:
            car_obj.main_image.save(c['img'] if not c['img'].startswith('http') else "car.jpg", img_file, save=False)
        
        car_obj.save()

        print(f"[{i+1}/{len(cars_data)}] {c['brand']} {c['model']} tayyor.")
    
    print(f"\n✅ Barcha {Car.objects.count()} ta avtomobil rasmlari bilan muvaffaqiyatli yuklandi!")

if __name__ == "__main__":
    seed_db()