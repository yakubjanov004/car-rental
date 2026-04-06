import os
import sys
import django
import random
from decimal import Decimal
from datetime import datetime, timedelta
from django.core.files.base import ContentFile
from django.core.management import call_command

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(CURRENT_DIR)
sys.path.append(BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

IMAGES_ROOT = os.path.join(CURRENT_DIR, 'rentcar_images')

def get_slot_image(model_group, slot):
    """Disk dan haqiqiy webp faylni o'qib ContentFile qaytaradi"""
    filename = f"{model_group}__{slot}.webp"
    # Avval cars_webp sub-papkasini tekshir, keyin to'g'ridan rentcar_images ni
    for subdir in ['cars_webp', '']:
        path = os.path.join(IMAGES_ROOT, subdir, filename) if subdir else os.path.join(IMAGES_ROOT, filename)
        if os.path.exists(path):
            with open(path, 'rb') as f:
                return ContentFile(f.read(), name=filename)
    return None

from django.contrib.auth import get_user_model
from apps.districts.models import District
from apps.cars.models import CarModel, Car, Amenity, CarImage
from apps.bookings.models import Booking
from apps.reviews.models import Review

User = get_user_model()

random.seed(42)

# ═══════════════════════════════════════
# AMENITIES CONFIGURATION
# ═══════════════════════════════════════
AMENITIES_DATA = {
    "panorama": ("Panorama Tom", "layout-grid"),
    "heated_seats": ("Isitiladigan O'rindiqlar", "thermometer"),
    "360_camera": ("360° Kamera", "camera"),
    "massage": ("Massaj O'rindiqlari", "activity"),
    "apple_carplay": ("Apple CarPlay / Android Auto", "smartphone"),
    "wireless_charging": ("Simsiz Zaryadlash", "zap"),
    "ambient_light": ("Ambient Light (64 rang)", "sparkles"),
    "heads_up_display": ("Heads-up Display (HUD)", "monitor"),
    "sport_seats": ("Sport O'rindiqlar", "user"),
    "launch_control": ("Launch Control", "gauge"),
}

# ═══════════════════════════════════════
# FULL DATASET (MATCHING seed.py 33 MODELS)
# ═══════════════════════════════════════
CAR_DEFINITIONS = {
    "bmw-ix": {
        "brand": "BMW", "model_name": "iX xDrive50", "category": "elektro",
        "fuel_type": "elektro", "transmission": "automatic", "seats": 5,
        "base_daily_price": 1200000, "base_deposit": 10000000, "allows_chauffeur": True,
        "short_tagline": "Kelajak Bugun — Nol Emissiya, Cheksiz Quvvat",
        "short_description": "523 km zaryad masofasi. Sustainably made — kelajak texnologiyasi bugun.",
        "detail_title": "BMW iX — Elektr Inqilobi",
        "detail_summary": "Harman Kardon audio, panorama lyuk va 12.3\" curved display bilan jihozlangan.",
        "power": 523, "top_speed": 200, "acceleration": "4.6s", "engine_type": "Dual Electric Motor",
        "fuel_consumption": "21.4 kWh/100km", "drive_type": "xDrive (AWD)", "cargo_capacity": "500 L",
        "rear_title": "FUTURISTIK PROFIL",
        "rear_description": "Aerodinamik dizayn va innovatsion LED chiroqlar kelajak avtomobili qiyofasini yaratadi.",
        "interior_title": "SHAYNAM VA KENG SALON",
        "interior_description": "Curved Display va qayta ishlangan materiallardan tayyorlangan premium interyer.",
        "colors": [("Sophisto Grey", "#6b6b6b"), ("Mineral White", "#e8e8e4")],
        "amenities": ["panorama", "wireless_charging", "apple_carplay", "360_camera", "ambient_light"],
        "year_range": (2022, 2024), "districts": ["Yunusobod", "Yakkasaroy"],
    },
    "bmw-m5-f90-cs": {
        "brand": "BMW", "model_name": "M5 F90 CS", "category": "premium",
        "fuel_type": "benzin", "transmission": "automatic", "seats": 5,
        "base_daily_price": 2875000, "base_deposit": 15000000, "allows_chauffeur": False,
        "short_tagline": "Track DNA, Street Legal — Yolda Bo'ronni His Eting",
        "short_description": "627 ot kuchi. M5 CS — seriyali ishlab chiqarishdagi eng kuchli BMW sedan.",
        "detail_title": "BMW M5 F90 CS — Limited Edition",
        "detail_summary": "Carbon fiber roof, Merino charm ichki bezak va M Carbon keramik tormozlar.",
        "power": 627, "top_speed": 305, "acceleration": "3.0s", "engine_type": "4.4L V8 Biturbo",
        "fuel_consumption": "11.3 L/100km", "drive_type": "M xDrive (AWD)", "cargo_capacity": "530 L",
        "rear_title": "DINAMIK ORQA PROFIL",
        "rear_description": "To'rt tomonlama sport ekzoz tizimi va uglerod tolali diffuzor barqarorlikni ta'minlaydi.",
        "interior_title": "M SPORT SALON",
        "interior_description": "Alcantara rul va M Carbon o'rindiqlar maksimal haydash zavqini beradi.",
        "colors": [("Frozen Dark Grey", "#2a2a2a"), ("Le Mans Blue", "#003399")],
        "amenities": ["sport_seats", "heads_up_display", "apple_carplay", "launch_control"],
        "year_range": (2021, 2023), "districts": ["Chilonzor", "Mirobod"],
    },
    "bmw-x7-m60i": {
        "brand": "BMW", "model_name": "X7 M60i", "category": "suv",
        "fuel_type": "benzin", "transmission": "automatic", "seats": 7,
        "base_daily_price": 3450000, "base_deposit": 20000000, "allows_chauffeur": True,
        "short_tagline": "Exclusive Collection — Kuch va Hashamatning Uyg'unligi",
        "short_description": "BMW X7 M60i — premium SUV segmentining cho'qqisi. 530 ot kuchi.",
        "detail_title": "BMW X7 M60i — Exclusive Collection",
        "detail_summary": "Bowers & Wilkins audio tizimi va Sky Lounge panorama lyuki bilan jihozlangan.",
        "power": 530, "top_speed": 250, "acceleration": "4.7s", "engine_type": "4.4L V8 Biturbo",
        "fuel_consumption": "12.9 L/100km", "drive_type": "xDrive (AWD)", "cargo_capacity": "750 L",
        "rear_title": "MOXIRLIK STANDARTI",
        "rear_description": "Katta o'lchamli SUV uchun mukammal barqarorlik va dinamik ko'rinish.",
        "interior_title": "BIRINCHI KLASS KOMFORT",
        "interior_description": "6 yoki 7 kishilik kenglik, individual iqlim nazorati va yuqori sifatli charm.",
        "colors": [("Carbon Black", "#1a1a1a"), ("Alpine White", "#f5f5f0")],
        "amenities": ["panorama", "heated_seats", "360_camera", "massage", "apple_carplay", "heads_up_display"],
        "year_range": (2022, 2024), "districts": ["Yunusobod", "Mirzo Ulug'bek"],
    },
    "byd-atto-3": {
        "brand": "BYD", "model_name": "Atto 3", "category": "elektro",
        "fuel_type": "elektro", "transmission": "automatic", "seats": 5,
        "base_daily_price": 700000, "base_deposit": 4000000, "allows_chauffeur": False,
        "short_tagline": "Elektr SUV — Kelajak Bugun Yetib Keldi",
        "short_description": "Blade Battery texnologiyasi va 420 km zaryad masofasi.",
        "detail_title": "BYD Atto 3 — Electric SUV",
        "detail_summary": "12.8\" rotating display va V2L texnologiyasi bilan jihozlangan.",
        "power": 201, "top_speed": 160, "acceleration": "7.3s", "engine_type": "Single Motor Electric",
        "fuel_consumption": "15.6 kWh/100km", "drive_type": "FWD", "cargo_capacity": "440 L",
        "rear_title": "ZAMONAVIY ESTETIKA",
        "rear_description": "Ixcham va dinamik orqa profil shahar sharoitiga juda mos keladi.",
        "interior_title": "GYM INSPIRED DESIGN",
        "interior_description": "Musiqa asboblarini eslatuvchi detallar va ergonomik sport o'rindiqlar.",
        "colors": [("Surf Blue", "#1a6699"), ("Winter White", "#f5f5f0")],
        "amenities": ["apple_carplay", "wireless_charging", "360_camera", "ambient_light"],
        "year_range": (2023, 2024), "districts": ["Yunusobod", "Yakkasaroy"],
    },
    "byd-chazor": {
        "brand": "BYD", "model_name": "Chazor", "category": "elektro",
        "fuel_type": "elektro", "transmission": "automatic", "seats": 5,
        "base_daily_price": 550000, "base_deposit": 3000000, "allows_chauffeur": False,
        "short_tagline": "O'zbek Bozori Uchun Elektromobil",
        "short_description": "400 km zaryad masofasi va keng salon.",
        "detail_title": "BYD Chazor — Designed for Uzbekistan",
        "detail_summary": "Zaryad: 30 daqiqada 80%. O'zbekiston iqlimiga moslashgan.",
        "power": 197, "top_speed": 170, "acceleration": "7.3s", "engine_type": "Single Motor Electric",
        "fuel_consumption": "16.5 kWh/100km", "drive_type": "FWD", "cargo_capacity": "450 L",
        "rear_title": "KLASSIK SEDAN",
        "rear_description": "Barqarorlik va qulaylikni ta'minlovchi klassik dizayn yechimlari.",
        "interior_title": "SMART INTERYER",
        "interior_description": "Aylanuvchi multimedia ekrani va kengaytirilgan xavfsizlik tizimlari.",
        "colors": [("Cosmos Black", "#111"), ("Snow White", "#f5f5f0")],
        "amenities": ["apple_carplay", "wireless_charging", "360_camera"],
        "year_range": (2023, 2024), "districts": ["Chilonzor", "Olmazor"],
    },
    "byd-han": {
        "brand": "BYD", "model_name": "Han EV", "category": "elektro",
        "fuel_type": "elektro", "transmission": "automatic", "seats": 5,
        "base_daily_price": 900000, "base_deposit": 6000000, "allows_chauffeur": True,
        "short_tagline": "Dragon Face Design — O'ziga xos, Kuchli, Premium",
        "short_description": "517 ot kuchi AWD va 0-100 km/h 3.9 sek.",
        "detail_title": "BYD Han EV — Electric Flagship",
        "detail_summary": "Dynaudio 12-speaker va massaj kresloalari. VIP sayohat uchun.",
        "power": 517, "top_speed": 185, "acceleration": "3.9s", "engine_type": "Dual Motor Electric",
        "fuel_consumption": "18.5 kWh/100km", "drive_type": "AWD", "cargo_capacity": "410 L",
        "rear_title": "PREMIUM FLAGSHIP",
        "rear_description": "Yaxlit LED chiroqlar va sportiv aerodinamik qanotlar.",
        "interior_title": "LYUKS VA TEXNOLOGIYA",
        "interior_description": "Nappa charm, Dynaudio audio tizimi va yuqori darajadagi issiqlik izolyatsiyasi.",
        "colors": [("Han Blue", "#001f5e"), ("Cinnabar Red", "#8b1a1a")],
        "amenities": ["panorama", "massage", "ambient_light", "apple_carplay", "heated_seats"],
        "year_range": (2022, 2024), "districts": ["Yunusobod", "Mirzo Ulug'bek"],
    },
    "byd-seal": {
        "brand": "BYD", "model_name": "Seal", "category": "elektro",
        "fuel_type": "elektro", "transmission": "automatic", "seats": 5,
        "base_daily_price": 850000, "base_deposit": 5000000, "allows_chauffeur": False,
        "short_tagline": "Ocean X Design — Dinamik va Innovatsion",
        "short_description": "Sportiv elektr sedan, CTB texnologiyasi bilan.",
        "detail_title": "BYD Seal — Performance Electric",
        "detail_summary": "0.219 CD aerodinamika va iTAC tizimi bilan boshqaruv.",
        "power": 530, "top_speed": 180, "acceleration": "3.8s", "engine_type": "Dual Motor Electric",
        "fuel_consumption": "18.2 kWh/100km", "drive_type": "AWD", "cargo_capacity": "450 L",
        "rear_title": "OCEAN X ESTETIKASI",
        "rear_description": "Dinamik LED chiroqlar va minimalist orqa dizayn aerodinamikani yaxshilaydi.",
        "interior_title": "MINIMALIST LUXURY",
        "interior_description": "Kristall uzatmalar qutisi va aylanuvchi 15.6 dyuymli ekran bilan kelajakni his eting.",
        "colors": [("Aurora White", "#f0f0f0"), ("Atlantis Grey", "#4a4a4a")],
        "amenities": ["panorama", "sport_seats", "wireless_charging", "360_camera"],
        "year_range": (2023, 2024), "districts": ["Mirobod", "Yakkasaroy"],
    },
    "byd-song-plus": {
        "brand": "BYD", "model_name": "Song Plus", "category": "suv",
        "fuel_type": "elektro", "transmission": "automatic", "seats": 5,
        "base_daily_price": 750000, "base_deposit": 4500000, "allows_chauffeur": False,
        "short_tagline": "Oila Uchun Mukammal SUV",
        "short_description": "Keng salon, yuqori xavfsizlik va zamonaviy interyer.",
        "detail_title": "BYD Song Plus — Family Electric SUV",
        "detail_summary": "DiLink 4.0 tizimi va Blade Battery bilan jihozlangan.",
        "power": 197, "top_speed": 170, "acceleration": "7.8s", "engine_type": "Single Motor Electric",
        "fuel_consumption": "17.5 kWh/100km", "drive_type": "FWD", "cargo_capacity": "510 L",
        "rear_title": "KENG VA BARQAROR",
        "rear_description": "SUV segmentida eng yaxshi aerodinamik ko'rsatkichlardan biri.",
        "interior_title": "OILAVIY KOMFORT",
        "interior_description": "Orqa qatorda keng oyoq joyi va yuqori sifatli materiallar.",
        "colors": [("Time Grey", "#555555"), ("Snow White", "#ffffff")],
        "amenities": ["panorama", "heated_seats", "360_camera", "apple_carplay"],
        "year_range": (2023, 2024), "districts": ["Chilonzor", "Sergeli"],
    },
    "chevrolet-cobalt": {
        "brand": "Chevrolet", "model_name": "Cobalt", "category": "sedan",
        "fuel_type": "benzin", "transmission": "automatic", "seats": 5,
        "base_daily_price": 350000, "base_deposit": 1500000, "allows_chauffeur": False,
        "short_tagline": "Xalq Tanlovi — Ishonchli va Hamyonbop",
        "short_description": "O'zbekistonning eng mashhur sedani, keng yukxona.",
        "detail_title": "Chevrolet Cobalt — Ishonchli Hamroh",
        "detail_summary": "Tejamkor va har qanday yo’l sharoitiga chidamli model.",
        "power": 105, "top_speed": 170, "acceleration": "11.7s", "engine_type": "1.5L Inline-4",
        "fuel_consumption": "6.7 L/100km", "drive_type": "FWD", "cargo_capacity": "563 L",
        "rear_title": "KENG YUKXONA",
        "rear_description": "O'z sinfidagi eng katta yukxonalardan biri — barcha yuklaringiz uchun joy yetarli.",
        "interior_title": "ERGONOMIK SALON",
        "interior_description": "Soddalik va funksionallik uyg'unligi, uzoq manzillar uchun qulay o'rindiqlar.",
        "colors": [("Qora", "#111"), ("Oq", "#ffffff")],
        "amenities": ["apple_carplay"],
        "year_range": (2021, 2024), "districts": ["Chilonzor", "Olmazor", "Uchtepa"],
    },
    "chevrolet-gentra": {
        "brand": "Chevrolet", "model_name": "Gentra", "category": "sedan",
        "fuel_type": "benzin", "transmission": "automatic", "seats": 5,
        "base_daily_price": 350000, "base_deposit": 1500000, "allows_chauffeur": False,
        "short_tagline": "Klassika — Biznes va Kundalik Sayohat",
        "short_description": "Yumshoq yurish va qulay salon bilan tanilgan.",
        "detail_title": "Chevrolet Gentra — Komforli Sayohat",
        "detail_summary": "Lyuk va ABS tizimi bilan jihozlangan yuqori pozitsiya.",
        "power": 107, "top_speed": 180, "acceleration": "12.5s", "engine_type": "1.5L Inline-4",
        "fuel_consumption": "7.5 L/100km", "drive_type": "FWD", "cargo_capacity": "400 L",
        "rear_title": "ELEKTRONIKA VA XAVFSIZLIK",
        "rear_description": "Dinamik barqarorlikni ta'minlovchi mustahkam osma va zamonaviy tormoz tizimi.",
        "interior_title": "LUKXURI INTERYER",
        "interior_description": "Yumshoq materiallar va lyuk orqali kiruvchi tabiiy yorug'lik bilan qulay muhit.",
        "colors": [("Qora", "#111"), ("Oq", "#ffffff"), ("Kulrang", "#808080")],
        "amenities": ["panorama", "heated_seats"],
        "year_range": (2022, 2024), "districts": ["Sergeli", "Yashnobod"],
    },
    "chevrolet-malibu-2": {
        "brand": "Chevrolet", "model_name": "Malibu 2", "category": "premium",
        "fuel_type": "benzin", "transmission": "automatic", "seats": 5,
        "base_daily_price": 750000, "base_deposit": 4000000, "allows_chauffeur": True,
        "short_tagline": "Business Executive — Kuchli va Elegant",
        "short_description": "2.0 Turbo dvigatel, 253 ot kuchi. Premium komfort.",
        "detail_title": "Chevrolet Malibu 2 — Turbo Luxury",
        "detail_summary": "Bose audio, nappa charm va to'liq xavfsizlik tizimlari.",
        "power": 253, "top_speed": 210, "acceleration": "6.3s", "engine_type": "2.0L Turbo Inline-4",
        "fuel_consumption": "8.5 L/100km", "drive_type": "FWD", "cargo_capacity": "447 L",
        "rear_title": "ELEGANTSLIK RAMZI",
        "rear_description": "Dinamik LED chiroqlar va sportiv shakllar uning biznes klass ekanligini ta'kidlaydi.",
        "interior_title": "BIZNES KLASS KOMFORT",
        "interior_description": "Bose audio tizimi, ventilyatsiya qilinadigan charm o'rindiqlar va aqlli bort kompyuteri.",
        "colors": [("Qora", "#0a0a0a"), ("Oq Pearl", "#f8f8f8")],
        "amenities": ["panorama", "heated_seats", "apple_carplay", "ambient_light", "wireless_charging"],
        "year_range": (2021, 2023), "districts": ["Mirobod", "Yunusobod"],
    },
    "chevrolet-malibu_1": {
        "brand": "Chevrolet", "model_name": "Malibu 1", "category": "sedan",
        "fuel_type": "benzin", "transmission": "automatic", "seats": 5,
        "base_daily_price": 400000, "base_deposit": 2000000, "allows_chauffeur": False,
        "short_tagline": "Amerika Ruhi — Uzun va Barqaror",
        "short_description": "Katta o'lchamli sedan, yuqori komfort darajasi.",
        "detail_title": "Chevrolet Malibu 1 — Klassik Komfort",
        "detail_summary": "2.4 litrli atmosferik dvigatel bilan ishonchli boshqaruv.",
        "power": 167, "top_speed": 195, "acceleration": "9.5s", "engine_type": "2.4L Inline-4",
        "fuel_consumption": "9.2 L/100km", "drive_type": "FWD", "cargo_capacity": "462 L",
        "rear_title": "BARQARORLIK VA SHAKL",
        "rear_description": "Keng g'ildirak bazasi va mustahkam kuzov har qanday yo'lda barqarorlikni ta'minlaydi.",
        "interior_title": "KLASSIK AMERIKA",
        "interior_description": "Keng o'rindiqlar va yuqori darajadagi shovqin izolyatsiyasi bilan qulay sayohat.",
        "colors": [("Black", "#111"), ("Silver", "#c0c0c0")],
        "amenities": ["heated_seats"],
        "year_range": (2015, 2018), "districts": ["Chilonzor", "Uchtepa"],
    },
    "chevrolet-onix": {
        "brand": "Chevrolet", "model_name": "Onix", "category": "sedan",
        "fuel_type": "benzin", "transmission": "automatic", "seats": 5,
        "base_daily_price": 450000, "base_deposit": 2500000, "allows_chauffeur": False,
        "short_tagline": "Smart Sedan — Yangi Avlod Texnologiyasi",
        "short_description": "Turbo dvigatel, kam yoqilg'i sarfi va zamonaviy xavfsizlik.",
        "detail_title": "Chevrolet Onix — Modern Choice",
        "detail_summary": "Keyless entry, auto parking va to'liq raqamli panel.",
        "power": 132, "top_speed": 190, "acceleration": "10.9s", "engine_type": "1.2L Turbo Inline-3",
        "fuel_consumption": "5.9 L/100km", "drive_type": "FWD", "cargo_capacity": "469 L",
        "rear_title": "DINAMIK VA IXCHAM",
        "rear_description": "Yangi avlod dizayni bilan ajralib turuvchi zamonaviy orqa optika.",
        "interior_title": "SMART TEXNOLOGIYA",
        "interior_description": "Keyless entry, avtomatik parkovka va raqamli asboblar paneli.",
        "colors": [("Dark Grey", "#333"), ("White", "#fff")],
        "amenities": ["apple_carplay", "wireless_charging", "360_camera"],
        "year_range": (2023, 2024), "districts": ["Yunusobod", "Shayxontohur"],
    },
    "chevrolet-spark": {
        "brand": "Chevrolet", "model_name": "Spark", "category": "economy",
        "fuel_type": "benzin", "transmission": "automatic", "seats": 5,
        "base_daily_price": 250000, "base_deposit": 1000000, "allows_chauffeur": False,
        "short_tagline": "Shahar Uchun Yaratilgan — Arzon va Chaqqon",
        "short_description": "Tor ko'chalarda moslashuvchan, yoqilg'i sarfi minimal.",
        "detail_title": "Chevrolet Spark — City Compact",
        "detail_summary": "Shahar bo'ylab tezkor va qulay harakatlanish uchun tanlov.",
        "power": 85, "top_speed": 160, "acceleration": "13.5s", "engine_type": "1.25L Inline-4",
        "fuel_consumption": "5.5 L/100km", "drive_type": "FWD", "cargo_capacity": "170 L",
        "rear_title": "IXCHAM VA CHAQQON",
        "rear_description": "Shahar ichidagi manevrlar uchun unikal ixchamlik va oson parkovka.",
        "interior_title": "YOSH VA DINAMIK",
        "interior_description": "Mototsikl uslubidagi asboblar paneli va ergonomik boshqaruv elementlari.",
        "colors": [("White", "#ffffff"), ("Silver", "#a8a8a8"), ("Red", "#cc2200")],
        "amenities": ["apple_carplay"],
        "year_range": (2021, 2024), "districts": ["Chilonzor", "Sergeli", "Yashnobod"],
    },
    "chevrolet-tahoe": {
        "brand": "Chevrolet", "model_name": "Tahoe", "category": "suv",
        "fuel_type": "benzin", "transmission": "automatic", "seats": 8,
        "base_daily_price": 2000000, "base_deposit": 10000000, "allows_chauffeur": True,
        "short_tagline": "Amerika Afsonasi — Keng va Kuchli",
        "short_description": "355 ot kuchi, 8 o'rindiq. Oilaviy va VIP transfer uchun.",
        "detail_title": "Chevrolet Tahoe — Full Size SUV",
        "detail_summary": "RST Edition, 22\" disklar va premium Bose audio bilan.",
        "power": 355, "top_speed": 180, "acceleration": "7.5s", "engine_type": "5.3L V8",
        "fuel_consumption": "14.5 L/100km", "drive_type": "4WD", "cargo_capacity": "722 L",
        "rear_title": "KUCHLI AMERIKANES",
        "rear_description": "Gigant radiator panjarasi va massiv orqa dizayn bilan har qanday yo'l qiroli.",
        "interior_title": "GIGANT SALON",
        "interior_description": "8 kishilik kenglik, uch zonali iqlim nazorati va premium audio tizimi.",
        "colors": [("Black", "#0a0a0a"), ("Summit White", "#f8f8f6")],
        "amenities": ["panorama", "heated_seats", "apple_carplay", "360_camera", "wireless_charging"],
        "year_range": (2021, 2023), "districts": ["Chilonzor", "Uchtepa"],
    },
    "chevrolet-tracker-2": {
        "brand": "Chevrolet", "model_name": "Tracker 2", "category": "suv",
        "fuel_type": "benzin", "transmission": "automatic", "seats": 5,
        "base_daily_price": 450000, "base_deposit": 2500000, "allows_chauffeur": False,
        "short_tagline": "Yilning SUV'i — Zamonaviy va Qulay",
        "short_description": "Kompakt SUV, Redline dizayni bilan ajralib turadi.",
        "detail_title": "Chevrolet Tracker 2 — Redline",
        "detail_summary": "Panorama lyuk, start-stop va kor ko'rinish nuqtalari monitoringi.",
        "power": 137, "top_speed": 185, "acceleration": "10.5s", "engine_type": "1.2L Turbo Inline-3",
        "fuel_consumption": "6.5 L/100km", "drive_type": "FWD", "cargo_capacity": "393 L",
        "rear_title": "SPORTIV VA COMPACT",
        "rear_description": "Yangi Redline dizayni va dinamik profil bilan shahar sport suv'i.",
        "interior_title": "TEXNOLOGIK INTERYER",
        "interior_description": "Panorama lyuk, MyLink multimedia va aqlli yordamchi tizimlar.",
        "colors": [("Dark Grey", "#222"), ("White", "#fff")],
        "amenities": ["panorama", "apple_carplay", "wireless_charging"],
        "year_range": (2023, 2024), "districts": ["Yunusobod", "Mirobod"],
    },
    "chevrolet-traverse": {
        "brand": "Chevrolet", "model_name": "Traverse", "category": "suv",
        "fuel_type": "benzin", "transmission": "automatic", "seats": 7,
        "base_daily_price": 1500000, "base_deposit": 8000000, "allows_chauffeur": True,
        "short_tagline": "Oila bilan Sayohat — Katta va Xavfsiz",
        "short_description": "V6 dvigatel, 7 kishilik keng salon va AWD.",
        "detail_title": "Chevrolet Traverse — 7 Seater SUV",
        "detail_summary": "Premier versiya, adaptiv kruiz kontrol va 3-zonali iqlim nazorati.",
        "power": 281, "top_speed": 190, "acceleration": "7.8s", "engine_type": "3.6L V6",
        "fuel_consumption": "11.5 L/100km", "drive_type": "AWD", "cargo_capacity": "651 L",
        "rear_title": "GIGANT OILAVIY SUV",
        "rear_description": "Ishonchli va salobatli ko'rinish, uzoq sayohatlar uchun ideal xavfsizlik.",
        "interior_title": "PREMIER KLASS KOMFORT",
        "interior_description": "7 kishilik kenglik, 3-zonali iqlim nazorati va adaptiv kruiz kontrol.",
        "colors": [("Black", "#111"), ("White", "#fdfdfd")],
        "amenities": ["panorama", "heated_seats", "apple_carplay", "360_camera"],
        "year_range": (2022, 2024), "districts": ["Yunusobod", "Mirzo Ulug'bek"],
    },
    "hyundai-santa-fe": {
        "brand": "Hyundai", "model_name": "Santa Fe", "category": "suv",
        "fuel_type": "benzin", "transmission": "automatic", "seats": 7,
        "base_daily_price": 1000000, "base_deposit": 5000000, "allows_chauffeur": True,
        "short_tagline": "Komfort Cho'qqisi — Yuqori Texnologiyali SUV",
        "short_description": "Premium interyer va ravon harakatlanish ustuvorligi.",
        "detail_title": "Hyundai Santa Fe — Luxury SUV",
        "detail_summary": "Calligraphy pozitsiyasi, harman kardon audio tizimi bilan.",
        "power": 281, "top_speed": 210, "acceleration": "7.0s", "engine_type": "2.5L Turbo Smartstream",
        "fuel_consumption": "9.5 L/100km", "drive_type": "HTRAC (AWD)", "cargo_capacity": "634 L",
        "rear_title": "SALOBATLI SUV",
        "rear_description": "Zamonaviy LED chiroqlar va kengaytirilgan kuzov shakllari Santa Fe ning premium maqomini ta'kidlaydi.",
        "interior_title": "CALLIGRAPHY LUXURY",
        "interior_description": "Nappa charm, 12.3 dyuymli raqamli panel va Harman Kardon audio tizimi bilan jihozlangan.",
        "colors": [("Taiga Brown", "#4b3a2a"), ("Abyss Black", "#050505")],
        "amenities": ["panorama", "massage", "heated_seats", "360_camera", "wireless_charging"],
        "year_range": (2023, 2024), "districts": ["Mirobod", "Yunusobod"],
    },
    "hyundai-sonata": {
        "brand": "Hyundai", "model_name": "Sonata", "category": "sedan",
        "fuel_type": "benzin", "transmission": "automatic", "seats": 5,
        "base_daily_price": 700000, "base_deposit": 4000000, "allows_chauffeur": True,
        "short_tagline": "Business Class — Ish uchrashuvlari uchun ideal",
        "short_description": "Aerodinamik dizayn va executive interior.",
        "detail_title": "Hyundai Sonata — Business Executive",
        "detail_summary": "DN8 versiyasi, 12.3\" raqamli panel va nappa charm.",
        "power": 191, "top_speed": 210, "acceleration": "8.8s", "engine_type": "2.5L GDI Inline-4",
        "fuel_consumption": "7.8 L/100km", "drive_type": "FWD", "cargo_capacity": "453 L",
        "rear_title": "AERODINAMIK SEDAN",
        "rear_description": "Sensuous Sportiness dizayn falsafasi asosida yaratilgan o'ta past qarshilik koeffitsiyenti.",
        "interior_title": "EXECUTIVE SALON",
        "interior_description": "Shift-by-wire uzatmalar qutisi va panoramic display bilan zamonaviy boshqaruv.",
        "colors": [("Phantom Black", "#111"), ("Quartz White", "#f0f0ec")],
        "amenities": ["apple_carplay", "heated_seats", "wireless_charging", "ambient_light", "360_camera"],
        "year_range": (2021, 2023), "districts": ["Yunusobod", "Chilonzor"],
    },
    "hyundai-tucson": {
        "brand": "Hyundai", "model_name": "Tucson", "category": "suv",
        "fuel_type": "benzin", "transmission": "automatic", "seats": 5,
        "base_daily_price": 750000, "base_deposit": 4500000, "allows_chauffeur": False,
        "short_tagline": "Parametric Design — Ko'z Bog'lovchi Tashqi Ko'rinish",
        "short_description": "4-avlod Tucson, innovatsion LED chiroqlar bilan.",
        "detail_title": "Hyundai Tucson — Parametric Design",
        "detail_summary": "Sportiv dizayn va eng so'nggi xavfsizlik tizimlari jamlangan.",
        "power": 187, "top_speed": 200, "acceleration": "9.1s", "engine_type": "2.5L Smartstream",
        "fuel_consumption": "8.2 L/100km", "drive_type": "AWD", "cargo_capacity": "539 L",
        "rear_title": "PARAMETRIK DINAMIKA",
        "rear_description": "Hidden lighting texnologiyasi va tishli orqa chiroqlar unikal ko'rinish beradi.",
        "interior_title": "INTERSPACE KOMFORT",
        "interior_description": "Ochiq asboblar paneli va vertikal multimedia displeyi bilan erkinlik hissi.",
        "colors": [("Shimmering Silver", "#c5c5c5"), ("Abyss Black", "#0a0a0a")],
        "amenities": ["panorama", "apple_carplay", "wireless_charging", "heated_seats", "360_camera"],
        "year_range": (2021, 2024), "districts": ["Yunusobod", "Mirzo Ulug'bek"],
    },
    "kia-carnival": {
        "brand": "Kia", "model_name": "Carnival", "category": "suv",
        "fuel_type": "benzin", "transmission": "automatic", "seats": 7,
        "base_daily_price": 1200000, "base_deposit": 6000000, "allows_chauffeur": True,
        "short_tagline": "Grand Utility Vehicle — VIP Sayohat Standarti",
        "short_description": "7 kishilik VIP salon, biznes klass qulayligi.",
        "detail_title": "Kia Carnival — VIP Limousine",
        "detail_summary": "Relaxation seats, Bose audio va to'liq komfort paketi.",
        "power": 290, "top_speed": 190, "acceleration": "7.0s", "engine_type": "3.5L V6 GDI",
        "fuel_consumption": "12.5 L/100km", "drive_type": "FWD", "cargo_capacity": "627 L",
        "rear_title": "GRAND UTILITY",
        "rear_description": "Katta o'lchamli minivan va suv xususiyatlarini birlashtirgan dinamik orqa ko'rinish.",
        "interior_title": "VIP LOUNGE",
        "interior_description": "Premium relaxation o'rindiqlari va ikki qavatli panorama lyuk bilan haqiqiy VIP sayohat.",
        "colors": [("Aurora Black Pearl", "#0f0f0f"), ("Panthera Metal", "#3b3b3b")],
        "amenities": ["panorama", "massage", "heated_seats", "360_camera", "wireless_charging"],
        "year_range": (2022, 2024), "districts": ["Mirobod", "Yunusobod"],
    },
    "kia-ev6": {
        "brand": "Kia", "model_name": "EV6", "category": "elektro",
        "fuel_type": "elektro", "transmission": "automatic", "seats": 5,
        "base_daily_price": 950000, "base_deposit": 6000000, "allows_chauffeur": False,
        "short_tagline": "Electric Performance — Dinamik Elektro-Krossover",
        "short_description": "Sport dizayn va 500+ km masofaga zaryad.",
        "detail_title": "Kia EV6 — Future Forward",
        "detail_summary": "Augmented Reality HUD va ultra-tez zaryadlash tizimi.",
        "power": 325, "top_speed": 185, "acceleration": "5.2s", "engine_type": "Dual Motor Electric",
        "fuel_consumption": "17.2 kWh/100km", "drive_type": "AWD", "cargo_capacity": "490 L",
        "rear_title": "DIGITAL TIGER DESIGN",
        "rear_description": "Yaxlit LED chiroqlar va aerodinamik qanot bilan qoplangan orqa dizayn.",
        "interior_title": "EKOLOGIK VA SMART",
        "interior_description": "Qayta ishlangan materiallardan interyer va kengaytirilgan borliqdagi HUD displey.",
        "colors": [("Yacht Blue", "#00205b"), ("Moonscape Grey", "#5a5a5a")],
        "amenities": ["panorama", "heads_up_display", "wireless_charging", "360_camera", "ambient_light"],
        "year_range": (2023, 2024), "districts": ["Yakkasaroy", "Yunusobod"],
    },
    "kia-k5": {
        "brand": "Kia", "model_name": "K5", "category": "sedan",
        "fuel_type": "benzin", "transmission": "automatic", "seats": 5,
        "base_daily_price": 650000, "base_deposit": 3500000, "allows_chauffeur": False,
        "short_tagline": "Dinamik Sedan — Sportiv Ruhiyatli Tashqi Ko'rinish",
        "short_description": "Mashhur 'Moshalka' chiroqlar va GT-Line dizayn.",
        "detail_title": "Kia K5 — Dynamic Sedan",
        "detail_summary": "Panoramic display va kengaytirilgan multimedia tizimi bilan.",
        "power": 191, "top_speed": 210, "acceleration": "7.8s", "engine_type": "2.5L GDI Inline-4",
        "fuel_consumption": "7.5 L/100km", "drive_type": "FWD", "cargo_capacity": "453 L",
        "rear_title": "FASTBACK PROFIL",
        "rear_description": "Dinamik fastback ko'rinishi va uzluksiz orqa LED chiroqlar.",
        "interior_title": "SPORTIV VA SMART",
        "interior_description": "Haydovchiga yo'naltirilgan dashboard va panoramik asboblar paneli.",
        "colors": [("Interstellar Grey", "#444"), ("Snow White", "#fff")],
        "amenities": ["panorama", "apple_carplay", "wireless_charging", "ambient_light"],
        "year_range": (2022, 2024), "districts": ["Chilonzor", "Mirzo Ulug'bek"],
    },
    "kia-sonet": {
        "brand": "Kia", "model_name": "Sonet", "category": "suv",
        "fuel_type": "benzin", "transmission": "automatic", "seats": 5,
        "base_daily_price": 450000, "base_deposit": 2500000, "allows_chauffeur": False,
        "short_tagline": "Shahar SUV'i — Ixcham va Zamonaviy",
        "short_description": "Yangi model, shahar ichida qulay SUV.",
        "detail_title": "Kia Sonet — Compact SUV",
        "detail_summary": "Ventilyatsiya qilinadigan o'rindiqlar va Bose audio bilan.",
        "power": 115, "top_speed": 170, "acceleration": "11.5s", "engine_type": "1.5L Inline-4",
        "fuel_consumption": "7.0 L/100km", "drive_type": "FWD", "cargo_capacity": "392 L",
        "rear_title": "IXCHAM VA CHAQQON",
        "rear_description": "Shahar harakati uchun mukammal o'lchamlar va zamonaviy orqa optika.",
        "interior_title": "KOMPAKT LUX",
        "interior_description": "Ventilyatsiya qilinadigan charm o'ridiqlar va premium Bose audio tizimi.",
        "colors": [("Beige", "#d2b48c"), ("Black", "#111")],
        "amenities": ["apple_carplay", "heated_seats", "wireless_charging"],
        "year_range": (2024, 2024), "districts": ["Shayxontohur", "Olmazor"],
    },
    "kia-sorento": {
        "brand": "Kia", "model_name": "Sorento", "category": "suv",
        "fuel_type": "benzin", "transmission": "automatic", "seats": 7,
        "base_daily_price": 950000, "base_deposit": 5000000, "allows_chauffeur": True,
        "short_tagline": "Katta Oila Sayohati — 7 Kishilik Isbotlangan Sifat",
        "short_description": "Ishonchli krossover, keng salon va AWD.",
        "detail_title": "Kia Sorento — The Family SUV",
        "detail_summary": "Nappa charm salon va to'liq panoramali tom.",
        "power": 281, "top_speed": 210, "acceleration": "7.5s", "engine_type": "2.5L Turbo GDI",
        "fuel_consumption": "9.8 L/100km", "drive_type": "AWD", "cargo_capacity": "616 L",
        "rear_title": "GIGANT OILAVIY KROSSOVER",
        "rear_description": "Vertikal orqa chiroqlar va kengaytirilgan kuzov kuchi oilaviy xavfsizlikni ta'minlaydi.",
        "interior_title": "PREMIUM OILAVIY KOMFORT",
        "interior_description": "Nappa charm interyer, Bose audio va to'liq panoramali tom bilan kenglik hissi.",
        "colors": [("Mineral Blue", "#1a2a4a"), ("White Pearl", "#fdfdfd")],
        "amenities": ["panorama", "heated_seats", "apple_carplay", "360_camera", "wireless_charging"],
        "year_range": (2022, 2024), "districts": ["Yunusobod", "Mirobod"],
    },
    "mercedes-g63": {
        "brand": "Mercedes-Benz", "model_name": "G63 AMG", "category": "premium",
        "fuel_type": "benzin", "transmission": "automatic", "seats": 5,
        "base_daily_price": 5000000, "base_deposit": 30000000, "allows_chauffeur": True,
        "short_tagline": "Afsonaviy Gelik — Kuch va Status Beligisi",
        "short_description": "V8 Biturbo, 585 ot kuchi. Off-road va shahar qiroli.",
        "detail_title": "Mercedes-Benz G63 AMG — The Legend",
        "detail_summary": "IWC soati, Burmester surround system va sport kalsitlar.",
        "power": 585, "top_speed": 240, "acceleration": "4.5s", "engine_type": "4.0L V8 Biturbo",
        "fuel_consumption": "16.5 L/100km", "drive_type": "4MATIC (AWD)", "cargo_capacity": "667 L",
        "rear_title": "OFF-ROAD QUVVATI",
        "rear_description": "Zaxira g'ildiragi va vertikal orqa chiroqlar haqiqiy off-road xarakterini ko'rsatadi.",
        "interior_title": "EXECUTIVE LUXURY",
        "interior_description": "Dual 12.3 dyuymli ekran va qo'lda ishlangan nappa charm interyer.",
        "colors": [("Matte Black", "#0a0a0a"), ("Emerald Green", "#004d00")],
        "amenities": ["massage", "ambient_light", "360_camera", "apple_carplay", "sport_seats", "heads_up_display"],
        "year_range": (2022, 2024), "districts": ["Yunusobod", "Mirobod"],
    },
    "mercedes-s-class-w223": {
        "brand": "Mercedes-Benz", "model_name": "S-Class W223", "category": "premium",
        "fuel_type": "benzin", "transmission": "automatic", "seats": 5,
        "base_daily_price": 4500000, "base_deposit": 25000000, "allows_chauffeur": True,
        "short_tagline": "Dunyodagi Eng Yaxshi Avtomobil — Hashamat Cho'qqisi",
        "short_description": "Maybach darajasidagi komfort, yangi W223 avlodi.",
        "detail_title": "Mercedes-Benz S-Class W223 — The Peak",
        "detail_summary": "Hamma narsa avtomatlashtirilgan: eshiklar, massaj, xushbo'ylatish.",
        "power": 429, "top_speed": 250, "acceleration": "4.9s", "engine_type": "3.0L Inline-6 Turbo with EQ Boost",
        "fuel_consumption": "9.5 L/100km", "drive_type": "4MATIC (AWD)", "cargo_capacity": "550 L",
        "rear_title": "HASHAMATLI PROFIL",
        "rear_description": "Yashirin eshik tutqichlari va innovatsion chiziqli LED chiroqlar bilan mukammal estetika.",
        "interior_title": "BIRINCHI KLASS SALON",
        "interior_description": "OLED displeylar, 4D Burmester audio tizimi va 'Executive' massaj o'rindiqlari bilan mislsiz qulaylik.",
        "colors": [("Obsidian Black", "#010101"), ("Diamond White", "#f0f0f0")],
        "amenities": ["panorama", "massage", "ambient_light", "360_camera", "heads_up_display", "wireless_charging"],
        "year_range": (2022, 2024), "districts": ["Yunusobod", "Yakkasaroy"],
    },
    "porsche-cayenne-coupe": {
        "brand": "Porsche", "model_name": "Cayenne Coupe", "category": "premium",
        "fuel_type": "benzin", "transmission": "automatic", "seats": 5,
        "base_daily_price": 3500000, "base_deposit": 20000000, "allows_chauffeur": True,
        "short_tagline": "Sport SUV — Porsche DNA si Har bir Detalda",
        "short_description": "Sportiv kupé dizayn va murosasiz dinamika.",
        "detail_title": "Porsche Cayenne Coupe — Sports DNA",
        "detail_summary": "Sport Chrono paketi va adaptiv pnevmatik suspenziya bilan.",
        "power": 335, "top_speed": 245, "acceleration": "5.7s", "engine_type": "3.0L V6 Turbo",
        "fuel_consumption": "11.2 L/100km", "drive_type": "AWD", "cargo_capacity": "625 L",
        "rear_title": "FLYLINE DIZAYN",
        "rear_description": "Porsche ning mashhur orqa chiroqlar paneli va adaptiv spoiler sport xarakterini belgilaydi.",
        "interior_title": "SPORTIV HASXAMAT",
        "interior_description": "Porsche Advanced Cockpit va sportiv Merino charm o'rindiqlar bilan boshqaruv zavqi.",
        "colors": [("Jet Black", "#0c0c0c"), ("Crayon", "#d0d0d0")],
        "amenities": ["panorama", "sport_seats", "heads_up_display", "360_camera", "apple_carplay"],
        "year_range": (2023, 2024), "districts": ["Yunusobod", "Mirobod"],
    },
    "porsche-taycan-turbo-s": {
        "brand": "Porsche", "model_name": "Taycan Turbo S", "category": "elektro",
        "fuel_type": "elektro", "transmission": "automatic", "seats": 4,
        "base_daily_price": 4000000, "base_deposit": 25000000, "allows_chauffeur": False,
        "short_tagline": "Elektr Hayajon — 0 dan 100 gacha 2.8 Sekund",
        "short_description": "Dunyodagi eng tezkor elektr sedallardan biri.",
        "detail_title": "Porsche Taycan Turbo S — Electric Soul",
        "detail_summary": "800 voltli batareya tizimi va unikal sportiv boshqaruv.",
        "power": 750, "top_speed": 260, "acceleration": "2.8s", "engine_type": "Dual Electric Motor",
        "fuel_consumption": "24.5 kWh/100km", "drive_type": "AWD", "cargo_capacity": "366 L",
        "rear_title": "FUTURISTIK SPORTKAR",
        "rear_description": "Minimalist aerodinamika va yaxlit chiziqli chiroqlar bilan Porsche ning elektr kelajagi.",
        "interior_title": "DIGITAL COCKPIT",
        "interior_description": "Ekologik charm va to'liq raqamli boshqaruv asboblar paneli bilan hayajonli muhit.",
        "colors": [("Frozen Blue", "#a1caf1"), ("Carrara White", "#f8f8f8")],
        "amenities": ["panorama", "sport_seats", "ambient_light", "360_camera", "wireless_charging"],
        "year_range": (2022, 2024), "districts": ["Yunusobod", "Mirzo Ulug'bek"],
    },
    "tesla-model-s-plaid": {
        "brand": "Tesla", "model_name": "Model S Plaid", "category": "elektro",
        "fuel_type": "elektro", "transmission": "automatic", "seats": 5,
        "base_daily_price": 3000000, "base_deposit": 15000000, "allows_chauffeur": False,
        "short_tagline": "Yerdagi Raketa — 1020 Ot Kuchi",
        "short_description": "0-100 km/h: 2.1 sek. Eng aqlli va tezkor Tesla.",
        "detail_title": "Tesla Model S Plaid — Beyond Fast",
        "detail_summary": "Yoke ruletkasi, 17\" o'yin displeyi va avtopilot.",
        "power": 1020, "top_speed": 322, "acceleration": "2.1s", "engine_type": "Tri-Motor Electric",
        "fuel_consumption": "18.5 kWh/100km", "drive_type": "AWD", "cargo_capacity": "793 L",
        "rear_title": "PLAID PERFORMANCE",
        "rear_description": "Yengil vaznli uglerod tolali komponentlar va mukammal aerodinamik shakl.",
        "interior_title": "MINIMALIST TECH",
        "interior_description": "Yoke ruletkasi, 17 dyuymli kinoteatr displeyi va avtopilot tizimi bilan inqilobiy interyer.",
        "colors": [("Deep Blue Metallic", "#002366"), ("Solid Black", "#0a0a0a")],
        "amenities": ["panorama", "wireless_charging", "apple_carplay", "ambient_light", "launch_control"],
        "year_range": (2022, 2024), "districts": ["Yunusobod", "Olmazor"],
    },
    "tesla-model-y": {
        "brand": "Tesla", "model_name": "Model Y", "category": "elektro",
        "fuel_type": "elektro", "transmission": "automatic", "seats": 5,
        "base_daily_price": 900000, "base_deposit": 5000000, "allows_chauffeur": False,
        "short_tagline": "Kelajak SUV'i — Minimalizm va Samaradorlik",
        "short_description": "Ko'p qirrali krossover, o'ta xavfsiz va texnologik.",
        "detail_title": "Tesla Model Y — The Smart SUV",
        "detail_summary": "To'liq shisha tom, avtopilot va supertejamkor yurish.",
        "power": 384, "top_speed": 217, "acceleration": "4.8s", "engine_type": "Dual Motor Electric",
        "fuel_consumption": "16.5 kWh/100km", "drive_type": "AWD", "cargo_capacity": "854 L",
        "rear_title": "SMART KROSSOVER",
        "rear_description": "Har qanday yo'lga moslashuvchan, kengaytirilgan yukona va minimalist dizayn.",
        "interior_title": "OPEN SPACE",
        "interior_description": "To'liq shisha tom, minimalist markaziy displey va maksimal xavfsizlik zonasi.",
        "colors": [("Pearl White", "#fefefe"), ("Midnight Silver", "#4c4c4c")],
        "amenities": ["panorama", "wireless_charging", "apple_carplay", "360_camera"],
        "year_range": (2023, 2024), "districts": ["Yunusobod", "Yakkasaroy"],
    },
    "toyota-camry-75": {
        "brand": "Toyota", "model_name": "Camry 75", "category": "sedan",
        "fuel_type": "benzin", "transmission": "automatic", "seats": 5,
        "base_daily_price": 650000, "base_deposit": 3000000, "allows_chauffeur": True,
        "short_tagline": "Biznes Klas — Isbotlangan Ishonch",
        "short_description": "Yangi 75 kuzov, JBL audio va yuqori komfort.",
        "detail_title": "Toyota Camry 75 — Business Class",
        "detail_summary": "Prestige Plus pozitsiyasi, yumshoq podveska va ishonchli motor.",
        "power": 203, "top_speed": 210, "acceleration": "8.2s", "engine_type": "2.5L Inline-4",
        "fuel_consumption": "7.5 L/100km", "drive_type": "FWD", "cargo_capacity": "493 L",
        "rear_title": "KOMFORLI SEDAN",
        "rear_description": "Qayta ishlangan orqa asma va ovoz izolyatsiyasi bilan biznes klass darajasidagi ravonlik.",
        "interior_title": "KOMFORT VA SIFAT",
        "interior_description": "Prestige Plus pozitsiyasi, JBL audio tizimi va yuqori darajadagi xavfsizlik yostiqchalari.",
        "colors": [("Black", "#000"), ("White", "#fff")],
        "amenities": ["apple_carplay", "heated_seats", "wireless_charging", "360_camera"],
        "year_range": (2021, 2023), "districts": ["Yunusobod", "Mirobod", "Chilonzor"],
    },
    "toyota-land-cruiser-300": {
        "brand": "Toyota", "model_name": "Land Cruiser 300", "category": "suv",
        "fuel_type": "benzin", "transmission": "automatic", "seats": 7,
        "base_daily_price": 3500000, "base_deposit": 20000000, "allows_chauffeur": True,
        "short_tagline": "Har Yo'lning Qiroli — GR Sport",
        "short_description": "Afsonaviy LC300, yangi V6 Twin-Turbo dvigateli.",
        "detail_title": "Toyota Land Cruiser 300 — King of Roads",
        "detail_summary": "GR Sport versiyasi, E-KDSS tizimi va eng yuqori off-road qobiliyati.",
        "power": 409, "top_speed": 210, "acceleration": "6.7s", "engine_type": "3.5L V6 Twin-Turbo",
        "fuel_consumption": "12.5 L/100km", "drive_type": "4WD", "cargo_capacity": "1131 L",
        "rear_title": "QIROLLIK SALOBATI",
        "rear_description": "GR Sport eksterer paketi va massiv orqa profil LC300 ning har qanday yo'l qiroli ekanligini isbotlaydi.",
        "interior_title": "OFF-ROAD LUXURY",
        "interior_description": "GR Sport interyer detallari, E-KDSS tizimi va to'rt zonali iqlim nazorati bilan mislsiz quvvat.",
        "colors": [("Black Shine", "#111"), ("White Pearl", "#f5f5f0")],
        "amenities": ["panorama", "heated_seats", "360_camera", "wireless_charging", "ambient_light", "massage"],
        "year_range": (2022, 2024), "districts": ["Yunusobod", "Mirzo Ulug'bek"],
    },
}

REVIEW_TEMPLATES = {
    "premium": [
        ("Mashinani bronlash juda oson bo'ldi, haydovchi vaqtida keldi. BMW X7 bilan sayohat unutilmas taassurot qoldirdi!", 5),
        ("Premium xizmat premium narxga arzidi. Mashina ichi juda toza va xushbo'y edi. Albatta qayta murojaat qilaman.", 5),
        ("Lexus LX 600 bilan prezident kabi his etdim o'zimni. Rahmat RideLux jamоasiga!", 5),
    ],
    "economy": [
        ("Arzon narxda yaxshi xizmat. Spark bilan shahar bo'ylab qulaylik bilan yurdim.", 4),
        ("Mashina soz edi, faqat bitta narsa — benzin to'liq emas edi. Lekin tezda hal qilindi.", 3),
        ("Chiziqda turish yo'q, onlayn bron qilib oldim. 10/10 tajriba!", 5),
    ],
    "suv": [
        ("Tahoe bilan oilam bilan Samarqandga bordik. 8 kishilik keng salon — ajoyib!", 5),
        ("Haval H6 sport ko'rinishi va sifati bilan hayratlantirib qo'ydi. Tavsiya qilaman!", 5),
        ("Land Cruiser bilan tog'li yo'llarga chiqdik. Hech qanday muammo bo'lmadi.", 5),
    ],
    "elektro": [
        ("BYD Atto 3 bilan zaryad qilishni unulib ketdim — 420 km yetdi!", 5),
        ("BMW iX — bu mashina emas, bu kelajak. 523 km zaryad masofasi haqiqatan shunday.", 5),
        ("Elektromobil uchun birinchi tajriba. Juda qulay va tekin xizmatlar bor.", 4),
    ],
}

def ensure_users():
    admin, created = User.objects.get_or_create(username='admin')
    if created:
        admin.set_password('admin123')
        admin.is_superuser = True
        admin.is_staff = True
        admin.save()
    users = list(User.objects.exclude(is_superuser=True))
    if not users:
        for i in range(15):
            u = User.objects.create_user(
                username=f'user{i+1}', password='pass123',
                first_name=f'User{i+1}', last_name='Test',
                phone_number=f'+99890{1000000 + i}',
            )
            users.append(u)
    return users

def ensure_district(name):
    district, _ = District.objects.get_or_create(name=name)
    return district

def ensure_amenities():
    objs = []
    amenity_map = {}
    for code, (name, icon) in AMENITIES_DATA.items():
        obj, _ = Amenity.objects.get_or_create(code=code, defaults={'name': name, 'icon_name': icon})
        objs.append(obj)
        amenity_map[code] = obj
    return amenity_map

def seed_models_and_units():
    amenity_map = ensure_amenities()
    all_cars = []
    
    for code, cfg in CAR_DEFINITIONS.items():
        model, created = CarModel.objects.update_or_create(
            model_group=code,
            defaults={
                'brand': cfg['brand'],
                'model_name': cfg['model_name'],
                'category': cfg['category'],
                'transmission': cfg['transmission'],
                'fuel_type': cfg['fuel_type'],
                'seats': cfg['seats'],
                'base_daily_price': Decimal(cfg['base_daily_price']),
                'base_deposit': Decimal(cfg['base_deposit']),
                'allows_chauffeur': cfg.get('allows_chauffeur', False),
                'short_tagline': cfg['short_tagline'],
                'short_description': cfg['short_description'],
                'detail_title': cfg['detail_title'],
                'detail_summary': cfg['detail_summary'],
                'power': cfg.get('power'),
                'top_speed': cfg.get('top_speed'),
                'acceleration': cfg.get('acceleration'),
                'fuel_consumption': cfg.get('fuel_consumption'),
                'engine_type': cfg.get('engine_type'),
                'drive_type': cfg.get('drive_type'),
                'cargo_capacity': cfg.get('cargo_capacity'),
                'rear_title': cfg.get('rear_title'),
                'rear_description': cfg.get('rear_description'),
                'interior_title': cfg.get('interior_title'),
                'interior_description': cfg.get('interior_description'),
            },
        )
        
        # Amenities
        model.amenities.set([amenity_map[a] for a in cfg.get('amenities', []) if a in amenity_map])
        
        # Images — disk dan haqiqiy fayllarni o'qib bazaga saqlash
        SLOTS = ['card_main', 'detail_background', 'gallery_front', 'gallery_interior', 'gallery_rear']
        for idx, slot in enumerate(SLOTS):
            content = get_slot_image(code, slot)
            if content:
                # Mavjud bo'lsa o'chirib yangilash
                CarImage.objects.filter(car_model=model, slot=slot).delete()
                CarImage.objects.create(
                    car_model=model,
                    image=content,
                    slot=slot,
                    sort_order=idx
                )
                print(f"   ✅ {code}__{slot}.webp saqlandi")
            else:
                print(f"   ⚠️  {code}__{slot}.webp topilmadi!")

        # Units
        unit_count = random.randint(3, 5)
        for idx in range(unit_count):
            district = ensure_district(random.choice(cfg['districts']))
            color = random.choice(cfg['colors'])
            inv = f"{cfg['brand'][:3].upper()}-{random.randint(1000, 9999)}-{idx}"
            plate = f"{random.randint(10, 99)} {random.randint(100, 999)} {chr(random.randint(65, 90))}{chr(random.randint(65, 90))}{chr(random.randint(65, 90))}"
            car, _ = Car.objects.get_or_create(
                inventory_code=inv,
                defaults={
                    'model_info': model,
                    'district': district,
                    'plate_number': plate,
                    'color_name': color[0],
                    'color_hex': color[1],
                    'year': random.randint(cfg['year_range'][0], cfg['year_range'][1]),
                    'daily_price': Decimal(cfg['base_daily_price']),
                    'deposit': Decimal(cfg['base_deposit']),
                    'status': 'available',
                    'is_available': True,
                },
            )
            all_cars.append(car)
    return all_cars

def seed_bookings_reviews(cars, users):
    for car in cars:
        for _ in range(random.randint(1, 3)):
            user = random.choice(users)
            start_date = datetime.now().date() + timedelta(days=random.randint(-15, 10))
            end_date = start_date + timedelta(days=random.randint(1, 4))
            days = max(1, (end_date - start_date).days)
            Booking.objects.create(
                user=user, car=car, start_date=start_date, end_date=end_date,
                total_price=car.daily_price * days,
                status=random.choice(['pending', 'approved', 'completed']),
                full_name=f"{user.first_name} {user.last_name}".strip() or user.username,
                phone_number=user.phone_number or '+998900000000',
            )
        cat = car.model_info.category
        template_key = "economy"
        if cat in ["premium", "sport"]: template_key = "premium"
        elif cat == "elektro": template_key = "elektro"
        elif cat == "suv": template_key = "suv"
        
        templates = REVIEW_TEMPLATES.get(template_key, REVIEW_TEMPLATES['economy'])
        random.shuffle(templates)
        for text, rating in templates[:random.randint(1, 2)]:
            user = random.choice(users)
            Review.objects.get_or_create(user=user, car=car, defaults={'comment': text, 'rating': rating})

def clear_data():
    print("Clearing old data...")
    Review.objects.all().delete()
    Booking.objects.all().delete()
    Car.objects.all().delete()
    CarImage.objects.all().delete()
    CarModel.objects.all().delete()

def run():
    print('🚀 RIDELUX Extended Mega Seed boshlandi...')
    clear_data()
    users = ensure_users()
    cars = seed_models_and_units()
    seed_bookings_reviews(cars, users)
    total_images = __import__('apps.cars.models', fromlist=['CarImage']).CarImage.objects.count()
    print(f'\n✨ Seed yakunlandi!')
    print(f'📦 Modellar: {len(CAR_DEFINITIONS)} ta')
    print(f'🚗 Mashinalar: {len(cars)} ta')
    print(f'🖼️  Rasmlar bazada: {total_images} ta')

if __name__ == '__main__':
    run()
