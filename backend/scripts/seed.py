import os
import sys
import django
import random
from django.core.files.base import ContentFile
from decimal import Decimal
from django.utils.text import slugify
from datetime import datetime, timedelta

# Loyihaning ildiz papkasini (backend) sys.path ga qo'shish
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(CURRENT_DIR)
sys.path.append(BASE_DIR)

# Django muhitini sozlash
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.districts.models import District
from apps.cars.models import Car, CarImage, CarModel
from apps.bookings.models import Booking
from apps.reviews.models import Review
from django.contrib.auth import get_user_model

User = get_user_model()
IMAGES_ROOT = os.path.join(CURRENT_DIR, 'rentcar_images')

def get_slot_image(model_group, slot_filename):
    """Guruhdan aniq slot rasmini yuklaydi"""
    # Optimized WebP files are in 'cars_webp' and named like 'model-group__slot.webp'
    filename = f"{model_group}__{slot_filename}.webp"
    path = os.path.join(IMAGES_ROOT, 'cars_webp', filename)
    if os.path.exists(path):
        with open(path, 'rb') as f:
            return ContentFile(f.read(), name=filename)
    return None

def create_admin_and_users():
    """Administrator va test foydalanuvchilarini yaratish"""
    print("👤 Foydalanuvchilar yaratilmoqda...")
    
    # 1. Admin
    admin_user, created = User.objects.get_or_create(username='admin')
    if created:
        admin_user.set_password('admin123')
        admin_user.is_superuser = True
        admin_user.is_staff = True
        admin_user.email = 'admin@ridelux.uz'
        admin_user.save()
        print("✅ Admin yaratildi: admin / admin123")
    else:
        print("ℹ️ Admin allaqachon mavjud.")

    # 2. Test Foydalanuvchilar
    names = ["Ali", "Vali", "Gani", "Umar", "Jasur", "Zafar", "Nilufar", "Malika", "Shahlo", "Rayhon"]
    surnames = ["Nazarov", "Karimov", "Hakimov", "Abduvohidov", "Tursunov", "Raximova", "Ismoilova", "Yuldashev", "Sodiqov"]
    
    created_users = []
    for i in range(15):
        first = random.choice(names)
        last = random.choice(surnames)
        username = f"{first.lower()}_{random.randint(10,99)}"
        
        user, created = User.objects.get_or_create(username=username)
        if created:
            user.set_password('pass123')
            user.first_name = first
            user.last_name = last
            user.phone_number = f"+998 {random.randint(90, 99)} {random.randint(100,999)} {random.randint(10,99)} {random.randint(10,99)}"
            user.save()
            created_users.append(user)
    
    print(f"✅ {len(created_users)} ta test foydalanuvchilari yaratildi.")
    return created_users + list(User.objects.filter(is_superuser=False))

def seed_db():
    print("🚀 RIDELUX Phase 6: Mega Professional Seeding boshlandi...")
    
    # 0. Ma'lumotlarni tozalash
    Review.objects.all().delete()
    Booking.objects.all().delete()
    CarImage.objects.all().delete()
    Car.objects.all().delete()
    CarModel.objects.all().delete()
    print("🧹 Eski ma'lumotlar tozalandi (Users dan tashqari).")

    # 1. Userlar
    users = create_admin_and_users()

    # 2. Tumanlar
    tumanlar = ["Chilonzor", "Mirzo Ulug'bek", "Mirobod", "Yunusobod", "Yakkasaroy", "Olmazor", "Shayxontohur", "Uchtepa", "Bektemir", "Sergeli", "Yashnobod"]
    district_objs = {nomi: District.objects.get_or_create(name=nomi)[0] for nomi in tumanlar}

    car_definitions = {
        "bmw-ix": ("BMW", "iX", "elektro", 1000000, 5000000),
        "bmw-m5-f90-cs": ("BMW", "M5 F90 CS", "premium", 2500000, 15000000),
        "bmw-x7-m60i": ("BMW", "X7 M60i", "suv", 3000000, 20000000),
        "byd-atto-3": ("BYD", "Atto 3", "elektro", 500000, 2500000),
        "byd-chazor": ("BYD", "Chazor", "elektro", 400000, 2000000),
        "byd-han": ("BYD", "Han", "elektro", 700000, 4000000),
        "byd-seal": ("BYD", "Seal", "elektro", 600000, 3000000),
        "byd-song-plus": ("BYD", "Song Plus", "suv", 650000, 3500000),
        "chevrolet-cobalt": ("Chevrolet", "Cobalt", "sedan", 350000, 1500000),
        "chevrolet-gentra": ("Chevrolet", "Gentra", "sedan", 350000, 1500000),
        "chevrolet-malibu-2": ("Chevrolet", "Malibu 2", "premium", 550000, 2500000),
        "chevrolet-malibu_1": ("Chevrolet", "Malibu 1", "sedan", 400000, 2000000),
        "chevrolet-onix": ("Chevrolet", "Onix", "sedan", 400000, 2000000),
        "chevrolet-spark": ("Chevrolet", "Spark", "sedan", 250000, 1000000),
        "chevrolet-tahoe": ("Chevrolet", "Tahoe", "suv", 2000000, 10000000),
        "chevrolet-tracker-2": ("Chevrolet", "Tracker 2", "suv", 450000, 2500000),
        "chevrolet-traverse": ("Chevrolet", "Traverse", "suv", 1500000, 8000000),
        "hyundai-santa-fe": ("Hyundai", "Santa Fe", "suv", 950000, 5000000),
        "hyundai-sonata": ("Hyundai", "Sonata", "sedan", 600000, 3000000),
        "hyundai-tucson": ("Hyundai", "Tucson", "suv", 700000, 3500000),
        "kia-carnival": ("Kia", "Carnival", "suv", 1000000, 5000000),
        "kia-ev6": ("Kia", "EV6", "elektro", 800000, 4000000),
        "kia-k5": ("Kia", "K5", "sedan", 600000, 3000000),
        "kia-sonet": ("Kia", "Sonet", "suv", 450000, 2500000),
        "kia-sorento": ("Kia", "Sorento", "suv", 850000, 4500000),
        "mercedes-g63": ("Mercedes-Benz", "G63 AMG", "premium", 4500000, 30000000),
        "mercedes-s-class-w223": ("Mercedes-Benz", "S-Class W223", "premium", 4000000, 25000000),
        "porsche-cayenne-coupe": ("Porsche", "Cayenne Coupe", "premium", 3000000, 18000000),
        "porsche-taycan-turbo-s": ("Porsche", "Taycan Turbo S", "elektro", 3500000, 22000000),
        "tesla-model-s-plaid": ("Tesla", "Model S Plaid", "elektro", 3000000, 15000000),
        "tesla-model-y": ("Tesla", "Model Y", "elektro", 1100000, 6000000),
        "toyota-camry-75": ("Toyota", "Camry 75", "sedan", 650000, 3000000),
        "toyota-land-cruiser-300": ("Toyota", "Land Cruiser 300", "suv", 2500000, 15000000),
    }

    colors = [
        {"color": "Qora", "hex": "#111111"}, {"color": "Oq", "hex": "#FFFFFF"},
        {"color": "Kulrang", "hex": "#808080"}, {"color": "To'q ko'k", "hex": "#000033"},
        {"color": "Kumushrang", "hex": "#C0C0C0"}, {"color": "To'q qizil", "hex": "#8B0000"}
    ]

    total_models = 0
    total_units = 0
    used_inventory_codes = set()
    all_cars = []

    for group, (brand, model, cat, price, dep) in sorted(car_definitions.items()):
        print(f"📦 Creating Model: {brand} {model}")
        
        car_model = CarModel.objects.create(
            brand=brand, model_name=model, category=cat, model_group=group,
            base_daily_price=Decimal(price), base_deposit=Decimal(dep),
            transmission='automatic', fuel_type='benzin' if cat != 'elektro' else 'elektro',
            seats=5 if cat != 'suv' else 7,
            short_tagline=f"Premium {brand} tajribasi",
            short_description=f"Eng so'nggi modeldagi {brand} {model} sizning xizmatingizda.",
            detail_title=f"{brand} {model} - Exclusive Collection",
            detail_summary=f"Huzuringizda {brand} modelining eng sara birlashmasi."
        )
        total_models += 1

        slots = ['card_main', 'detail_background', 'gallery_front', 'gallery_interior', 'gallery_rear']
        for slot in slots:
            content = get_slot_image(group, slot)
            if content:
                CarImage.objects.create(car_model=car_model, image=content, slot=slot)

        num_units = random.randint(3, 6)
        local_colors = colors.copy()
        random.shuffle(local_colors)

        for i in range(num_units):
            c = local_colors[i % len(local_colors)]
            while True:
                inv_code = f"{brand[:3].upper()}-{random.randint(1000, 9999)}".replace(" ", "")
                if inv_code not in used_inventory_codes:
                    used_inventory_codes.add(inv_code)
                    break
            
            car = Car.objects.create(
                model_info=car_model, district=random.choice(list(district_objs.values())),
                inventory_code=inv_code, plate_number=f"{random.randint(10,99)} {random.randint(100,999)} {chr(random.randint(65,90))}{chr(random.randint(65,90))}{chr(random.randint(65,90))}",
                color_name=c["color"], color_hex=c["hex"], year=random.randint(2022, 2024), status='available'
            )
            all_cars.append(car)
            total_units += 1

    # 3. Sharhlar va Band qilishlar (Seeding Reviews and Bookings)
    print("✍️ Sharhlar va Band qilishlar yaratilmoqda...")
    reviews_texts = [
        "Juda zor mashina ekan, xursand bo'ldim!", "Xizmat ko'rsatish a'lo darajada.", 
        "Mashina toza va yangi holatda.", "Narxlari juda hamyonbop.", "Hamma narsa super!",
        "Mashina biroz kech keldi, lekin holati yaxshi.", "Menga juda yoqdi, yana murojaat qilaman."
    ]
    
    for car in random.sample(all_cars, min(len(all_cars), 100)):
        # Bookings
        for _ in range(random.randint(1, 3)):
            user = random.choice(users)
            start = datetime.now().date() + timedelta(days=random.randint(-30, 30))
            end = start + timedelta(days=random.randint(1, 7))
            Booking.objects.create(
                user=user, car=car, start_date=start, end_date=end,
                total_price=car.daily_price * (end - start).days,
                status=random.choice(['completed', 'approved', 'pending']),
                full_name=f"{user.first_name} {user.last_name}",
                phone_number=user.phone_number
            )
        
        # Reviews
        for _ in range(random.randint(1, 2)):
            user = random.choice(users)
            try:
                Review.objects.create(
                    user=user, car=car, rating=random.randint(4, 5),
                    comment=random.choice(reviews_texts)
                )
            except: pass # Unique together error bo'lsa o'tib ketamiz

    print(f"\n✨ Seeding yakunlandi!")
    print(f"📊 Jami Modellar: {total_models}, Mashinalar: {total_units}")
    print(f"👤 Foydalanuvchilar: 15 ta test user + Admin")
    print(f"👤 Admin panel: admin / admin123")

if __name__ == "__main__":
    seed_db()