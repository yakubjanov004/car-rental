"""
RIDELUX — Professional Demo Data Generator (seed_extended.py)
=============================================================
Generates complete, realistic demo data for ALL platform entities.
Supports --fresh flag to reset all data before seeding.

Usage:
    python scripts/seed_extended.py          # Incremental (skip existing)
    python scripts/seed_extended.py --fresh  # Delete all + re-seed
"""
import os
import sys
import io
import django
import random
import uuid

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
from decimal import Decimal
from datetime import datetime, timedelta

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(CURRENT_DIR)
sys.path.append(BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.utils import timezone
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model

from apps.districts.models import District
from apps.cars.models import CarModel, Car, Amenity, CarImage, MaintenanceRecord as CarMaintenanceRecord
from apps.bookings.models import Booking, Fine, Waitlist
from apps.reviews.models import Review
from apps.payments.models import (
    PaymentMethod, PaymentTransaction, BillingInvoice,
    PaymentReceipt, PromoCode, DepositHold, RefundRequest,
)
from apps.users.models import Notification, KYCProfile
from apps.loyalty.models import LoyaltyTier, LoyaltyAccount, LoyaltyTransaction
from apps.insurance.models import InsurancePlan, BookingInsurance
from apps.favorites.models import Favorite
from apps.contact.models import ContactMessage
from apps.maintenance.models import MaintenanceType, MaintenanceRecord
from apps.pricing.models import PricingRule

User = get_user_model()
random.seed(42)
NOW = timezone.now()

IMAGES_ROOT = os.path.join(CURRENT_DIR, 'rentcar_images')
SEED_ASSETS_DIR = os.path.join(CURRENT_DIR, 'seed_assets')

# ─── Counters ──────────────────────────────────────────────
STATS = {
    'users': 0, 'kyc_profiles': 0, 'avatars': 0, 'kyc_documents': 0,
    'payment_methods': 0, 'bookings': 0, 'transactions': 0,
    'invoices': 0, 'receipts': 0, 'notifications': 0,
    'loyalty_accounts': 0, 'loyalty_transactions': 0,
    'reviews': 0, 'favorites': 0, 'insurance_plans': 0,
    'booking_insurances': 0, 'promo_codes': 0, 'fines': 0,
    'car_models': 0, 'car_units': 0, 'car_images': 0,
    'districts': 0, 'contact_messages': 0,
    'maintenance_types': 0, 'maintenance_records': 0,
    'pricing_rules': 0, 'refund_requests': 0, 'waitlist': 0,
    'deposit_holds': 0,
    'media_files': [],
}

# ═══════════════════════════════════════════════════════════
# MEDIA ASSET GENERATION
# ═══════════════════════════════════════════════════════════

def _ensure_pillow():
    try:
        from PIL import Image, ImageDraw, ImageFont
        return True
    except ImportError:
        print("  [WARN] Pillow not installed — using fallback placeholder images")
        return False

def _get_font(size=24):
    from PIL import ImageFont
    for path in ["arial.ttf", "C:/Windows/Fonts/arial.ttf",
                  "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]:
        try:
            return ImageFont.truetype(path, size)
        except (IOError, OSError):
            continue
    return ImageFont.load_default()

def _draw_centered(draw, text, y, width, font, fill):
    bbox = draw.textbbox((0, 0), text, font=font)
    x = (width - (bbox[2] - bbox[0])) // 2
    draw.text((x, y), text, fill=fill, font=font)

def _create_placeholder_png(text, width=400, height=300, bg=(40, 50, 80)):
    """Fallback: create a simple colored rectangle with text."""
    content = b'\x89PNG\r\n\x1a\n'  # minimal
    return ContentFile(
        _generate_simple_image(text, width, height, bg),
        name=f"{text.lower().replace(' ', '_')}.webp"
    )

def _generate_simple_image(text, w, h, bg):
    from PIL import Image, ImageDraw
    img = Image.new('RGB', (w, h), bg)
    draw = ImageDraw.Draw(img)
    font = _get_font(20)
    _draw_centered(draw, text, h // 2 - 12, w, font, (255, 255, 255))
    _draw_centered(draw, "RIDELUX DEMO", h - 35, w, font, (150, 170, 210))
    import io
    buf = io.BytesIO()
    img.save(buf, 'WEBP', quality=85)
    return buf.getvalue()

def generate_avatar(name, username):
    from PIL import Image, ImageDraw
    size = 400
    hue = hash(username) % 360
    r = int(30 + 40 * (hue % 3))
    g = int(40 + 30 * ((hue // 3) % 3))
    b = int(80 + 50 * ((hue // 9) % 3))
    img = Image.new('RGB', (size, size), (r, g, b))
    draw = ImageDraw.Draw(img)
    draw.ellipse([40, 40, size-40, size-40], fill=(r+30, g+30, b+30))
    initials = ''.join(w[0].upper() for w in name.split()[:2])
    font = _get_font(96)
    _draw_centered(draw, initials, size//2 - 50, size, font, (255, 255, 255))
    font_s = _get_font(16)
    _draw_centered(draw, "RIDELUX DEMO", size-55, size, font_s, (180, 200, 240))
    import io
    buf = io.BytesIO()
    img.save(buf, 'WEBP', quality=90)
    return ContentFile(buf.getvalue(), name=f"avatar_{username}.webp")

def generate_passport_front(name, series, username):
    from PIL import Image, ImageDraw
    w, h = 800, 560
    img = Image.new('RGB', (w, h), (250, 248, 240))
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, w, 80], fill=(0, 72, 153))
    ft = _get_font(26)
    fb = _get_font(18)
    fs = _get_font(13)
    _draw_centered(draw, "O'ZBEKISTON RESPUBLIKASI PASPORTI", 25, w, ft, (255,255,255))
    draw.ellipse([340,95,460,215], fill=(0,72,153), outline=(200,170,50), width=3)
    draw.rectangle([50,250,250,480], fill=(220,220,220), outline=(150,150,150), width=2)
    y = 260
    parts = name.split()
    for label, val in [("Familiya", parts[-1].upper()), ("Ism", parts[0].upper()),
                        ("Seriya", series), ("Millat", "O'ZBEKISTON")]:
        draw.text((280, y), label, fill=(100,100,100), font=fs)
        draw.text((280, y+16), val, fill=(20,20,20), font=fb)
        y += 50
    draw.rectangle([0, h-35, w, h], fill=(0,72,153))
    _draw_centered(draw, "DEMO DOCUMENT — NOT VALID", h-28, w, fs, (255,200,200))
    import io; buf = io.BytesIO(); img.save(buf, 'WEBP', quality=90)
    return ContentFile(buf.getvalue(), name=f"passport_front_{username}.webp")

def generate_passport_back(name, series, username):
    from PIL import Image, ImageDraw
    w, h = 800, 560
    img = Image.new('RGB', (w, h), (250, 248, 240))
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, w, 60], fill=(0, 72, 153))
    ft = _get_font(20); fb = _get_font(16); fs = _get_font(13)
    _draw_centered(draw, "PASSPORT — BACK PAGE", 18, w, ft, (255,255,255))
    y = 90
    for lbl, val in [("Manzil", "Toshkent sh., Yunusobod tumani"),
                      ("Berilgan", "15.03.2020"), ("Amal qilish", "15.03.2030")]:
        draw.text((50, y), lbl, fill=(100,100,100), font=fs)
        draw.text((50, y+18), val, fill=(20,20,20), font=fb); y += 50
    draw.rectangle([0, h-30, w, h], fill=(0,72,153))
    _draw_centered(draw, "DEMO — NOT VALID", h-24, w, fs, (255,200,200))
    import io; buf = io.BytesIO(); img.save(buf, 'WEBP', quality=90)
    return ContentFile(buf.getvalue(), name=f"passport_back_{username}.webp")

def generate_license_img(name, lic_num, username):
    from PIL import Image, ImageDraw
    w, h = 800, 500
    img = Image.new('RGB', (w, h), (245, 245, 250))
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, w, 65], fill=(180, 20, 20))
    ft = _get_font(22); fb = _get_font(16); fs = _get_font(13)
    _draw_centered(draw, "HAYDOVCHILIK GUVOHNOMASI", 18, w, ft, (255,255,255))
    draw.rectangle([40,90,210,280], fill=(220,220,220), outline=(150,150,150), width=2)
    y = 95
    parts = name.split()
    for lbl, val in [("Familiya", parts[-1].upper()), ("Ism", parts[0].upper()),
                      ("Raqam", lic_num), ("Toifa", "B, B1")]:
        draw.text((240, y), lbl, fill=(100,100,100), font=fs)
        draw.text((240, y+16), val, fill=(20,20,20), font=fb); y += 44
    draw.rectangle([0, h-30, w, h], fill=(180, 20, 20))
    _draw_centered(draw, "DEMO — NOT VALID", h-24, w, fs, (255,200,200))
    import io; buf = io.BytesIO(); img.save(buf, 'WEBP', quality=90)
    return ContentFile(buf.getvalue(), name=f"license_{username}.webp")

def generate_selfie_img(name, username):
    from PIL import Image, ImageDraw
    w, h = 600, 800
    img = Image.new('RGB', (w, h), (240, 235, 230))
    draw = ImageDraw.Draw(img)
    draw.ellipse([200, 80, 400, 280], fill=(180, 160, 140))
    draw.ellipse([150, 250, 450, 550], fill=(100, 100, 120))
    draw.rectangle([170, 420, 430, 560], fill=(250, 248, 240), outline=(150,150,150), width=2)
    fb = _get_font(20); fs = _get_font(14)
    _draw_centered(draw, name, 600, w, fb, (50, 50, 50))
    draw.rectangle([0, h-40, w, h], fill=(0, 72, 153))
    _draw_centered(draw, "DEMO SELFIE — NOT VALID", h-32, w, fs, (255,200,200))
    import io; buf = io.BytesIO(); img.save(buf, 'WEBP', quality=90)
    return ContentFile(buf.getvalue(), name=f"selfie_{username}.webp")


# ═══════════════════════════════════════════════════════════
# CAR IMAGE LOADER
# ═══════════════════════════════════════════════════════════

def get_slot_image(model_group, slot):
    filename = f"{model_group}__{slot}.webp"
    for subdir in ['cars_webp', '']:
        path = os.path.join(IMAGES_ROOT, subdir, filename) if subdir else os.path.join(IMAGES_ROOT, filename)
        if os.path.exists(path):
            with open(path, 'rb') as f:
                return ContentFile(f.read(), name=filename)
    return None


# ═══════════════════════════════════════════════════════════
# AMENITIES
# ═══════════════════════════════════════════════════════════

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

# ═══════════════════════════════════════════════════════════
# CAR DEFINITIONS — 33 models with real-world specs
# ═══════════════════════════════════════════════════════════
from scripts.car_definitions import CAR_DEFINITIONS

# ═══════════════════════════════════════════════════════════
# DISTRICTS — Toshkent shahri tumanlari (real coordinates)
# ═══════════════════════════════════════════════════════════

DISTRICTS_DATA = [
    ("Yunusobod", 41.3565, 69.2849),
    ("Chilonzor", 41.2771, 69.2100),
    ("Mirobod", 41.3117, 69.2787),
    ("Yakkasaroy", 41.2973, 69.2693),
    ("Shayxontohur", 41.3264, 69.2506),
    ("Mirzo Ulug'bek", 41.3354, 69.3348),
    ("Olmazor", 41.3305, 69.2178),
    ("Uchtepa", 41.2859, 69.1876),
    ("Sergeli", 41.2297, 69.2254),
    ("Yashnobod", 41.3320, 69.3133),
    ("Bektemir", 41.2577, 69.3357),
    ("Toshkent tumani", 41.3100, 69.2796),
]

# ═══════════════════════════════════════════════════════════
# DEMO USER PROFILES
# ═══════════════════════════════════════════════════════════

DEMO_USERS = [
    # (first, last, username, role, kyc_status, verification_status)
    ("Admin", "Ridelux", "admin", "admin", None, "verified"),
    ("Staff", "Moderator", "staff_mod", "staff", None, "verified"),
    ("Muhammadali", "Yusupov", "staff_ali", "staff", None, "verified"),
    # KYC Approved users with bookings
    ("Jamshid", "Abduqodirov", "jamshid_car", "user", "approved", "verified"),
    ("Madina", "Xodjayeva", "madina.lux", "user", "approved", "verified"),
    ("Sardor", "Rustamov", "sardor_88", "user", "approved", "verified"),
    ("Nilufar", "G'aniyeva", "nilu_drive", "user", "approved", "verified"),
    ("Dilshod", "To'rayev", "dilshod_pro", "user", "approved", "verified"),
    ("Shaxzoda", "Umarova", "shaxzoda.vip", "user", "approved", "verified"),
    ("Aziz", "Nematov", "aziz_ride", "user", "approved", "verified"),
    ("Kamola", "Abdullayeva", "kamola_lux", "user", "approved", "verified"),
    # KYC Pending users
    ("Anvar", "Karimov", "anvar_taxi", "user", "submitted", "pending"),
    ("Nodir", "Sodiqov", "nodir.dev", "user", "under_review", "pending"),
    ("Shahlo", "Rahimova", "shahlo_2026", "user", "submitted", "pending"),
    # KYC Rejected user
    ("Malika", "Saidova", "malika_queen", "user", "rejected", "unverified"),
    ("Bobur", "Ergashev", "bobur_fail", "user", "rejected", "unverified"),
    # New users (no KYC)
    ("Feruza", "Normatova", "feruza_lux", "user", "draft", "unverified"),
    ("Otabek", "Iskandarov", "otabek_new", "user", "draft", "unverified"),
    # Corporate user
    ("Xurshid", "Toshmatov", "xurshid_b2b", "user", "approved", "verified"),
    ("Zarina", "Mirzayeva", "zarina_corp", "user", "approved", "verified"),
    # Loyalty VIP
    ("Alisher", "Usmonov", "alisher_shark", "user", "approved", "verified"),
    ("Bekzod", "Ismoilov", "bekzod_premium", "user", "approved", "verified"),
]

ADDRESSES = [
    "Toshkent sh., Yunusobod tumani, 19-mavze, 45-uy",
    "Toshkent sh., Chilonzor tumani, Qatortol ko'chasi, 12-uy",
    "Toshkent sh., Mirobod tumani, Nukus ko'chasi, 78-uy",
    "Toshkent sh., Shayxontohur tumani, Labzak, 22-uy",
    "Toshkent sh., Yakkasaroy tumani, Shota Rustaveli, 10-uy",
    "Toshkent sh., Mirzo Ulug'bek tumani, Buyuk Ipak yo'li, 56-uy",
    "Toshkent sh., Olmazor tumani, Bog'ishamol ko'chasi, 3-uy",
    "Toshkent sh., Sergeli tumani, Yangi Sergeli, 88-uy",
    "Toshkent sh., Uchtepa tumani, Oloy bozori yoni, 14-uy",
    "Toshkent sh., Yashnobod tumani, Aviatsiachi ko'chasi, 33-uy",
]

# ─── Phone numbers for realism ────────────────────────────
PHONES_MAP = {
    'admin': '+998901234567',
    'staff_mod': '+998901234568',
    'staff_ali': '+998901234569',
    'jamshid_car': '+998933451289',
    'madina.lux': '+998977891023',
    'sardor_88': '+998901567834',
    'nilu_drive': '+998945612378',
    'dilshod_pro': '+998911234567',
    'shaxzoda.vip': '+998935678901',
    'aziz_ride': '+998901237890',
    'kamola_lux': '+998971234567',
    'anvar_taxi': '+998909876543',
    'nodir.dev': '+998936789012',
    'shahlo_2026': '+998947654321',
    'malika_queen': '+998938765432',
    'bobur_fail': '+998905554433',
    'feruza_lux': '+998943210987',
    'otabek_new': '+998917778899',
    'xurshid_b2b': '+998951234567',
    'zarina_corp': '+998959876543',
    'alisher_shark': '+998998877665',
    'bekzod_premium': '+998996655443',
}

HAS_PILLOW = _ensure_pillow()

# ═══════════════════════════════════════════════════════════
# SEEDING FUNCTIONS
# ═══════════════════════════════════════════════════════════

def seed_districts():
    """Create Tashkent districts with real GPS coordinates."""
    print("\n══ DISTRICTS ══════════════════════════════════")
    for name, lat, lng in DISTRICTS_DATA:
        obj, created = District.objects.update_or_create(
            name=name,
            defaults={
                'latitude': Decimal(str(lat)),
                'longitude': Decimal(str(lng)),
            }
        )
        if created:
            STATS['districts'] += 1
    print(f"  [+] {STATS['districts']} districts created/updated (total: {len(DISTRICTS_DATA)})")


def seed_users():
    """Create demo users with avatars and document images."""
    print("\n══ USERS ══════════════════════════════════════")
    created_users = []

    for first, last, uname, role, kyc_status, verif in DEMO_USERS:
        full_name = f"{first} {last}"
        passport_num = f"A{chr(65 + hash(uname) % 26)}{abs(hash(uname)) % 9000000 + 1000000}"
        license_num = f"AF{abs(hash(uname + 'lic')) % 9000000 + 1000000}"
        phone = PHONES_MAP.get(uname, f"+9989{abs(hash(uname)) % 10}{abs(hash(uname+'p')) % 900 + 100}{abs(hash(uname+'q')) % 90 + 10}{abs(hash(uname+'r')) % 90 + 10}")

        user, created = User.objects.get_or_create(
            username=uname,
            defaults={
                'first_name': first, 'last_name': last,
                'email': f"{uname}@ridelux.uz",
                'phone_number': phone,
                'address': random.choice(ADDRESSES),
                'passport_number': passport_num,
                'driver_license': license_num,
                'verification_status': verif,
                'is_corporate': uname in ('xurshid_b2b', 'zarina_corp'),
                'company_name': "TechCorp LLC" if uname == 'xurshid_b2b' else "AgroTrade MCHJ" if uname == 'zarina_corp' else None,
                'is_blacklisted': False,
            }
        )
        if created:
            pwd = 'admin123' if role == 'admin' else 'staff123' if role == 'staff' else 'demo123'
            user.set_password(pwd)
            if role == 'admin':
                user.is_superuser = True
                user.is_staff = True
            elif role == 'staff':
                user.is_staff = True

            # Generate and attach avatar
            if HAS_PILLOW:
                user.avatar.save(f"avatar_{uname}.webp", generate_avatar(full_name, uname), save=False)
                STATS['avatars'] += 1
                STATS['media_files'].append(f"avatars/avatar_{uname}.webp")
                # Generate passport/license images on User model
                if role == 'user':
                    user.passport_image.save(f"pp_{uname}.webp",
                        generate_passport_front(full_name, passport_num, uname), save=False)
                    user.driver_license_image.save(f"dl_{uname}.webp",
                        generate_license_img(full_name, license_num, uname), save=False)
                    STATS['media_files'].append(f"documents/passports/pp_{uname}.webp")
                    STATS['media_files'].append(f"documents/licenses/dl_{uname}.webp")

            user.save()
            STATS['users'] += 1
            print(f"  [+] {uname} ({role}) — {full_name}")
        else:
            print(f"  [=] {uname} already exists, skipping")

        created_users.append((user, role, kyc_status, full_name, passport_num, license_num))
    return created_users


def seed_kyc_profiles(user_data):
    """Create KYC profiles with document images."""
    print("\n══ KYC PROFILES ═══════════════════════════════")
    admin_user = None
    for user, role, *_ in user_data:
        if role == 'admin':
            admin_user = user
            break

    for user, role, kyc_status, full_name, passport_num, license_num in user_data:
        if role in ('admin', 'staff') or kyc_status is None:
            continue

        dob_year = 1985 + hash(user.username) % 15
        dob_month = 1 + hash(user.username + 'dob') % 12
        dob_day = 1 + hash(user.username + 'day') % 28

        passport_issued_places = [
            "IIV Yunusobod tumani",
            "IIV Chilonzor tumani",
            "IIV Mirobod tumani",
            "IIV Yakkasaroy tumani",
            "IIV Shayxontohur tumani",
        ]

        license_categories = ['B', 'B, B1', 'B, C', 'B, B1, C']

        passport_issue_year = 2018 + hash(user.username + 'piy') % 5
        license_issue_year = 2016 + hash(user.username + 'liy') % 7

        kyc, created = KYCProfile.objects.update_or_create(
            user=user,
            defaults={
                'status': kyc_status,
                'full_name': full_name,
                'date_of_birth': datetime(dob_year, dob_month, dob_day).date(),
                'nationality': "Uzbekistan",
                'passport_series': passport_num[:2],
                'passport_issued_by': passport_issued_places[hash(user.username) % len(passport_issued_places)],
                'passport_issue_date': datetime(passport_issue_year, 3, 15).date(),
                'passport_expiry_date': datetime(passport_issue_year + 10, 3, 15).date(),
                'license_number': license_num,
                'license_category': license_categories[hash(user.username + 'lc') % len(license_categories)],
                'license_issue_date': datetime(license_issue_year, 6, 1).date(),
                'license_expiry_date': datetime(license_issue_year + 10, 6, 1).date(),
                'rejection_reason': "Passport rasmi noaniq, iltimos qayta yuboring" if kyc_status == 'rejected' else '',
                'submitted_at': NOW - timedelta(days=random.randint(1, 30)) if kyc_status != 'draft' else None,
                'reviewed_at': NOW - timedelta(days=random.randint(0, 5)) if kyc_status in ('approved', 'rejected') else None,
                'reviewed_by': admin_user if kyc_status in ('approved', 'rejected') and admin_user else None,
            }
        )
        if HAS_PILLOW:
            kyc.passport_front_image.save(f"pf_{user.username}.webp",
                generate_passport_front(full_name, passport_num, user.username), save=False)
            kyc.passport_back_image.save(f"pb_{user.username}.webp",
                generate_passport_back(full_name, passport_num, user.username), save=False)
            kyc.license_image.save(f"lic_{user.username}.webp",
                generate_license_img(full_name, license_num, user.username), save=False)
            kyc.selfie_with_document.save(f"selfie_{user.username}.webp",
                generate_selfie_img(full_name, user.username), save=False)
            kyc.save()
            STATS['kyc_profiles'] += 1
            STATS['kyc_documents'] += 4
            STATS['media_files'].extend([
                f"kyc/passports/front/pf_{user.username}.webp",
                f"kyc/passports/back/pb_{user.username}.webp",
                f"kyc/licenses/lic_{user.username}.webp",
                f"kyc/selfies/selfie_{user.username}.webp",
            ])
            print(f"  [+] KYC: {user.username} [{kyc_status}] + 4 documents")
        else:
            kyc.save()
            STATS['kyc_profiles'] += 1
            print(f"  [+] KYC: {user.username} [{kyc_status}] (no images — Pillow missing)")


def seed_payment_methods(user_data):
    """Create payment cards for verified users."""
    print("\n══ PAYMENT METHODS ════════════════════════════")
    card_defs = [
        ('uzcard', '8600'), ('humo', '9860'), ('visa', '4444'), ('mastercard', '5555')
    ]
    card_holders_suffix = ["", " PLATINUM", " GOLD", ""]

    for user, role, kyc_status, *_ in user_data:
        if role in ('admin', 'staff'):
            continue
        if PaymentMethod.objects.filter(user=user).exists():
            continue
        num_cards = 3 if kyc_status == 'approved' and user.username in ('alisher_shark', 'bekzod_premium') \
            else 2 if kyc_status == 'approved' else 1
        for i in range(num_cards):
            ctype, prefix = card_defs[(hash(user.username) + i) % len(card_defs)]
            pan = f"{prefix} **** **** {abs(hash(user.username + str(i))) % 9000 + 1000}"
            holder_name = f"{user.first_name} {user.last_name}".upper()
            holder_name += card_holders_suffix[i % len(card_holders_suffix)]
            exp_month = (hash(user.username + str(i)) % 12) + 1
            exp_year = 27 + i
            PaymentMethod.objects.create(
                user=user, card_type=ctype, masked_pan=pan,
                expiry_month=f"{exp_month:02d}",
                expiry_year=f"{exp_year}",
                card_holder=holder_name,
                is_verified=kyc_status == 'approved',
                is_default=(i == 0),
            )
            STATS['payment_methods'] += 1
    print(f"  [+] {STATS['payment_methods']} payment methods created")


def seed_loyalty():
    """Create loyalty tiers and accounts."""
    print("\n══ LOYALTY SYSTEM ═════════════════════════════")
    tiers_data = [
        ("Bronze", "bronze", 0, 999, 0, False, False, False, "#CD7F32", "🥉"),
        ("Silver", "silver", 1000, 4999, 3, False, True, False, "#C0C0C0", "🥈"),
        ("Gold", "gold", 5000, 14999, 5, True, True, True, "#FFD700", "🥇"),
        ("Platinum", "platinum", 15000, None, 10, True, True, True, "#E5E4E2", "💎"),
    ]
    tier_objs = {}
    for name, slug, mn, mx, disc, ins, pri, dlv, color, icon in tiers_data:
        tier, _ = LoyaltyTier.objects.get_or_create(
            slug=slug,
            defaults={
                'name': name, 'min_points': mn, 'max_points': mx,
                'discount_percentage': disc, 'free_insurance_upgrade': ins,
                'priority_support': pri, 'free_delivery': dlv,
                'badge_color': color, 'icon_emoji': icon,
            }
        )
        tier_objs[slug] = tier
    print(f"  [+] {len(tier_objs)} loyalty tiers")
    return tier_objs


def seed_loyalty_accounts(user_data, tier_objs):
    """Create loyalty accounts for users."""
    print("\n══ LOYALTY ACCOUNTS ═══════════════════════════")
    point_map = {
        'alisher_shark': 16000,   # Platinum
        'bekzod_premium': 7500,   # Gold
        'jamshid_car': 2500,      # Silver
        'madina.lux': 3000,       # Silver
        'sardor_88': 1200,        # Silver
        'nilu_drive': 800,        # Bronze
        'dilshod_pro': 600,       # Bronze
        'shaxzoda.vip': 5500,     # Gold
        'aziz_ride': 450,         # Bronze
        'kamola_lux': 1100,       # Silver
        'xurshid_b2b': 9000,     # Gold (corporate)
        'zarina_corp': 6200,      # Gold (corporate)
    }
    for user, role, *_ in user_data:
        if role in ('admin', 'staff'):
            continue
        pts = point_map.get(user.username, random.randint(50, 800))
        account, created = LoyaltyAccount.objects.get_or_create(
            user=user,
            defaults={'points': pts, 'lifetime_points': pts}
        )
        if created:
            # Set correct tier
            tier = LoyaltyTier.objects.filter(min_points__lte=pts).order_by('-min_points').first()
            if tier:
                account.tier = tier
                account.save()
            # Also update user model
            user.loyalty_points = pts
            user.save(update_fields=['loyalty_points'])
            STATS['loyalty_accounts'] += 1
    print(f"  [+] {STATS['loyalty_accounts']} loyalty accounts")


def seed_loyalty_transactions(user_data):
    """Create diverse loyalty transaction history."""
    print("\n══ LOYALTY TRANSACTIONS ═══════════════════════")
    txn_templates = [
        ('earn', 150, "BMW iX ijara uchun bonus"),
        ('earn', 250, "Mercedes S-Class ijara uchun"),
        ('earn', 80, "Chevrolet Cobalt ijara uchun"),
        ('earn', 500, "VIP mijoz maxsus bonusi"),
        ('redeem', -200, "Keyingi ijara uchun chegirma"),
        ('redeem', -100, "Premium servis uchun sarflandi"),
        ('bonus', 300, "Xush kelibsiz bonusi"),
        ('bonus', 1000, "Bayram aksiyasi bonusi"),
        ('referral', 500, "Do'stingiz ro'yxatdan o'tdi"),
        ('referral', 250, "Referal bonus"),
        ('earn', 120, "Hyundai Sonata ijara uchun"),
        ('earn', 400, "Toyota Land Cruiser ijara uchun"),
    ]

    for user, role, kyc_status, *_ in user_data:
        if role != 'user' or kyc_status != 'approved':
            continue
        try:
            account = user.loyalty_account
        except Exception:
            continue

        num_txns = random.randint(2, 6)
        balance = account.points
        for i in range(num_txns):
            ttype, pts, reason = random.choice(txn_templates)
            if ttype == 'redeem' and balance + pts < 0:
                continue
            balance_after = max(0, balance + pts)
            LoyaltyTransaction.objects.create(
                account=account,
                transaction_type=ttype,
                points=pts,
                reason=reason,
                balance_after=balance_after,
            )
            balance = balance_after
            STATS['loyalty_transactions'] += 1

    print(f"  [+] {STATS['loyalty_transactions']} loyalty transactions")


def seed_insurance_plans():
    """Create insurance plans with full descriptions."""
    print("\n══ INSURANCE PLANS ════════════════════════════")
    plans = [
        {
            'name': "Asosiy Himoya", 'slug': "basic", 'coverage_level': "basic",
            'daily_price': 50000, 'deductible': 5000000,
            'covers_collision': True, 'covers_theft': False,
            'covers_natural_disaster': False, 'covers_roadside_assistance': False,
            'covers_personal_accident': False, 'sort_order': 0,
            'description': "Asosiy to'qnashuv sug'urtasi. Avariya vaqtida zararning bir qismini qoplaydi. Minimal himoya darajasi — kundalik foydalanish uchun.",
        },
        {
            'name': "Standart Paket", 'slug': "standard", 'coverage_level': "standard",
            'daily_price': 100000, 'deductible': 2000000,
            'covers_collision': True, 'covers_theft': True,
            'covers_natural_disaster': False, 'covers_roadside_assistance': True,
            'covers_personal_accident': False, 'sort_order': 1,
            'description': "To'qnashuv + o'g'irlik himoyasi. Yo'lda yordam xizmati kiritilgan. Ko'pchilik mijozlar uchun optimal variant.",
        },
        {
            'name': "Premium Qoplama", 'slug': "premium", 'coverage_level': "premium",
            'daily_price': 200000, 'deductible': 500000,
            'covers_collision': True, 'covers_theft': True,
            'covers_natural_disaster': True, 'covers_roadside_assistance': True,
            'covers_personal_accident': True, 'sort_order': 2,
            'description': "To'liq qoplama paketi: to'qnashuv, o'g'irlik, tabiiy ofatlar, yo'lda yordam va shaxsiy avariya. Xotirjam haydash uchun eng yaxshi tanlov.",
        },
        {
            'name': "Elite VIP", 'slug': "elite", 'coverage_level': "elite",
            'daily_price': 350000, 'deductible': 0,
            'covers_collision': True, 'covers_theft': True,
            'covers_natural_disaster': True, 'covers_roadside_assistance': True,
            'covers_personal_accident': True, 'sort_order': 3,
            'description': "NOLGA teng fransiza! VIP darajadagi to'liq himoya — zaxira avtomobil bilan ta'minlash, 24/7 shaxsiy menejer va 30 daqiqa ichida yo'lda yordam.",
        },
    ]
    plan_objs = []
    for p in plans:
        plan, _ = InsurancePlan.objects.update_or_create(
            slug=p['slug'],
            defaults={
                'name': p['name'], 'coverage_level': p['coverage_level'],
                'daily_price': p['daily_price'], 'deductible': p['deductible'],
                'covers_collision': p['covers_collision'], 'covers_theft': p['covers_theft'],
                'covers_natural_disaster': p['covers_natural_disaster'],
                'covers_roadside_assistance': p['covers_roadside_assistance'],
                'covers_personal_accident': p['covers_personal_accident'],
                'sort_order': p['sort_order'],
                'description': p['description'],
                'is_active': True,
            }
        )
        plan_objs.append(plan)
        STATS['insurance_plans'] += 1
    print(f"  [+] {len(plan_objs)} insurance plans")
    return plan_objs


def seed_promo_codes():
    """Create promo codes with various types."""
    print("\n══ PROMO CODES ════════════════════════════════")
    promos = [
        ("RIDELUX10", "percentage", 10, 30, True),
        ("WELCOME25", "percentage", 25, 14, True),
        ("VIP50K", "fixed", 50000, 60, True),
        ("SPRING2026", "percentage", 15, 45, True),
        ("FIRST_RIDE", "percentage", 20, 90, True),
        ("LOYAL100K", "fixed", 100000, 30, True),
        ("WEEKEND15", "percentage", 15, 60, True),
        ("SUMMER2026", "percentage", 10, 120, True),
        ("EXPIRED10", "percentage", 10, -5, False),   # Expired promo
        ("CORPORATE", "percentage", 30, 365, True),    # Corporate special
    ]
    for code, dtype, val, days, active in promos:
        PromoCode.objects.get_or_create(
            code=code,
            defaults={
                'discount_type': dtype,
                'discount_value': val,
                'valid_until': NOW + timedelta(days=days),
                'is_active': active,
            }
        )
        STATS['promo_codes'] += 1
    print(f"  [+] {STATS['promo_codes']} promo codes")


def ensure_amenities():
    objs = {}
    for code, (name, icon) in AMENITIES_DATA.items():
        obj, _ = Amenity.objects.get_or_create(code=code, defaults={'name': name, 'icon_name': icon})
        objs[code] = obj
    return objs


def ensure_district(name):
    d, _ = District.objects.get_or_create(name=name)
    return d


def seed_cars():
    """Seed car models, units, and images."""
    print("\n══ CAR MODELS & UNITS ═════════════════════════")
    amenity_map = ensure_amenities()
    all_cars = []

    statuses_pool = ['available', 'available', 'available', 'available', 'rented', 'maintenance']

    for code, cfg in CAR_DEFINITIONS.items():
        model, _ = CarModel.objects.update_or_create(
            model_group=code,
            defaults={
                'brand': cfg['brand'], 'model_name': cfg['model_name'],
                'category': cfg['category'], 'transmission': cfg['transmission'],
                'fuel_type': cfg['fuel_type'], 'seats': cfg['seats'],
                'base_daily_price': Decimal(cfg['base_daily_price']),
                'base_deposit': Decimal(cfg['base_deposit']),
                'allows_chauffeur': cfg.get('allows_chauffeur', False),
                'short_tagline': cfg['short_tagline'], 'short_description': cfg['short_description'],
                'detail_title': cfg['detail_title'], 'detail_summary': cfg['detail_summary'],
                'power': cfg.get('power'), 'top_speed': cfg.get('top_speed'),
                'acceleration': cfg.get('acceleration'), 'fuel_consumption': cfg.get('fuel_consumption'),
                'engine_type': cfg.get('engine_type'), 'drive_type': cfg.get('drive_type'),
                'cargo_capacity': cfg.get('cargo_capacity'),
                'rear_title': cfg.get('rear_title'), 'rear_description': cfg.get('rear_description'),
                'interior_title': cfg.get('interior_title'), 'interior_description': cfg.get('interior_description'),
            },
        )
        model.amenities.set([amenity_map[a] for a in cfg.get('amenities', []) if a in amenity_map])
        STATS['car_models'] += 1

        # Images
        SLOTS = ['card_main', 'detail_background', 'gallery_front', 'gallery_interior', 'gallery_rear']
        for idx, slot in enumerate(SLOTS):
            content = get_slot_image(code, slot)
            if content:
                CarImage.objects.filter(car_model=model, slot=slot).delete()
                CarImage.objects.create(car_model=model, image=content, slot=slot, sort_order=idx)
                STATS['car_images'] += 1

        # Units — create 2-4 per model with varied statuses
        num_units = random.randint(2, 4)
        for idx in range(num_units):
            district = ensure_district(random.choice(cfg['districts']))
            color = random.choice(cfg['colors'])
            inv = f"{cfg['brand'][:3].upper()}-{abs(hash(code+str(idx))) % 9000 + 1000}-{idx}"
            plate = f"{random.randint(10,99)} {random.randint(100,999)} {chr(65+random.randint(0,25))}{chr(65+random.randint(0,25))}{chr(65+random.randint(0,25))}"

            car_status = random.choice(statuses_pool)
            is_available = car_status == 'available'
            is_featured = idx == 0 and random.random() < 0.3  # ~30% of first units featured

            # Vary price slightly for individual units
            price_variation = Decimal(str(1.0 + random.uniform(-0.05, 0.10)))
            unit_price = (Decimal(cfg['base_daily_price']) * price_variation).quantize(Decimal('1.00'))
            unit_deposit = Decimal(cfg['base_deposit'])

            car, created = Car.objects.get_or_create(
                inventory_code=inv,
                defaults={
                    'model_info': model, 'district': district,
                    'plate_number': plate, 'color_name': color[0], 'color_hex': color[1],
                    'year': random.randint(cfg['year_range'][0], cfg['year_range'][1]),
                    'daily_price': unit_price,
                    'deposit': unit_deposit,
                    'status': car_status, 'is_available': is_available,
                    'is_featured': is_featured,
                    'rating': round(random.uniform(3.5, 5.0), 1),
                    'review_count': random.randint(0, 25),
                },
            )
            all_cars.append(car)
            STATS['car_units'] += 1

    print(f"  [+] {STATS['car_models']} models, {STATS['car_units']} units, {STATS['car_images']} images")
    return all_cars


def seed_bookings_and_payments(user_data, all_cars, insurance_plans):
    """Create bookings with various statuses + payments, invoices, receipts."""
    print("\n══ BOOKINGS & PAYMENTS ════════════════════════")

    # Only approved KYC users make bookings
    booking_users = [(u, fn) for u, role, kyc, fn, *_ in user_data
                     if role == 'user' and kyc == 'approved']
    if not booking_users or not all_cars:
        print("  [SKIP] No eligible users or cars")
        return

    booking_scenarios = [
        # (status, payment_status, days_offset, duration, is_chauffeur)
        ('completed', 'paid', -45, 3, False),
        ('completed', 'paid', -30, 5, False),
        ('completed', 'paid', -20, 2, True),
        ('completed', 'paid', -15, 4, False),
        ('active', 'paid', -1, 5, False),
        ('active', 'paid', -2, 7, True),
        ('confirmed', 'paid', 3, 3, False),
        ('confirmed', 'paid', 5, 2, True),
        ('payment_pending', 'initiated', 7, 2, False),
        ('payment_pending', 'initiated', 8, 1, False),
        ('pending', None, 10, 1, False),
        ('pending', None, 12, 3, False),
        ('cancelled', 'refunded', -15, 2, False),
        ('cancelled', 'refunded', -10, 1, False),
        ('rejected', None, -10, 1, False),
        ('failed', 'failed', -5, 2, False),
    ]

    chauffeur_details_pool = [
        "Yunusobod tumani, 19-mavze, 45-uy oldidan olish. Soat 09:00.",
        "Toshkent aeroport (TAS), Terminal 2, reysdan keyin. Reys: HY-512.",
        "Toshkent temir yo'l vokzali, asosiy kirish",
        "Hilton Tashkent City, qavat: 1, hall oldidan. VIP transfer.",
        "Chorsu bozori, asosiy kirish tomoni, soat 14:00 da.",
    ]

    return_conditions = [
        "Yaxshi holatda qaytarildi, hech qanday shikast yo'q",
        "Mashina toza va yaxshi holatda",
        "Juziy chiziqlar bor, salon toza",
        "Yaxashi, lekin yukxonada kichik dog'",
        "Mukammal holatda qaytarildi — VIP mijoz",
    ]

    invoice_counter = 1000
    available_cars = [c for c in all_cars if c.status == 'available']
    if not available_cars:
        available_cars = all_cars

    for user, full_name in booking_users:
        num_bookings = random.randint(3, 6)
        scenarios = random.sample(booking_scenarios, min(num_bookings, len(booking_scenarios)))

        for status, pay_status, day_offset, duration, is_chauffeur in scenarios:
            car = random.choice(available_cars)
            start_dt = NOW + timedelta(days=day_offset)
            end_dt = start_dt + timedelta(days=duration)
            total = car.daily_price * duration

            chauffeur_text = ''
            if is_chauffeur:
                chauffeur_text = random.choice(chauffeur_details_pool)

            comment = ''
            rejection_reason = ''
            return_cond = ''
            returned_at = None

            if status == 'cancelled':
                comment = random.choice([
                    "Rejalarim o'zgardi, bekor qilaman",
                    "Boshqa mashina topildi",
                    "Safar bekor qilindi",
                ])
            elif status == 'rejected':
                rejection_reason = random.choice([
                    "Hujjatlar to'liq emas",
                    "KYC profil muddati tugagan",
                    "Oldingi buyurtmada muammo mavjud",
                ])
            elif status == 'completed':
                return_cond = random.choice(return_conditions)
                returned_at = end_dt

            booking = Booking.objects.create(
                user=user, car=car,
                start_datetime=start_dt, end_datetime=end_dt,
                total_price=total, status=status,
                full_name=full_name,
                phone_number=user.phone_number or '+998900000000',
                comment=comment,
                rejection_reason=rejection_reason,
                is_chauffeur=is_chauffeur,
                chauffeur_details=chauffeur_text,
                return_condition=return_cond,
                returned_at=returned_at,
            )
            STATS['bookings'] += 1

            # Payment transaction
            txn = None
            if pay_status:
                method_choices = ['card', 'card', 'card', 'cash', 'terminal']
                provider_choices = ['mock', 'mock', 'payme', 'click']
                txn = PaymentTransaction.objects.create(
                    user=user, booking=booking, amount=total,
                    provider=random.choice(provider_choices),
                    method=random.choice(method_choices),
                    status=pay_status,
                    currency='UZS',
                    paid_at=NOW if pay_status == 'paid' else None,
                    metadata={
                        'booking_code': booking.booking_code,
                        'car': f"{car.model_info.brand} {car.model_info.model_name}",
                        'duration_days': duration,
                    },
                )
                STATS['transactions'] += 1

            # Invoice + Receipt for paid bookings
            if pay_status == 'paid' and txn:
                invoice_counter += 1
                inv_num = f"RL-INV-{invoice_counter:06d}"
                tax = total * Decimal('0.12')
                invoice = BillingInvoice.objects.create(
                    user=user, booking=booking, transaction=txn,
                    invoice_number=inv_num, amount=total,
                    tax_amount=tax, status='paid',
                    due_date=(start_dt - timedelta(days=1)).date(),
                )
                STATS['invoices'] += 1

                receipt = PaymentReceipt.objects.create(
                    user=user, transaction=txn, invoice=invoice,
                    receipt_number=f"RL-RCT-{invoice_counter:06d}",
                    amount=total,
                )
                STATS['receipts'] += 1

            # Insurance for confirmed/active/completed
            if status in ('confirmed', 'active', 'completed') and insurance_plans:
                plan = random.choice(insurance_plans)
                try:
                    BookingInsurance.objects.get_or_create(
                        booking=booking,
                        defaults={
                            'plan': plan,
                            'total_cost': plan.daily_price * duration,
                            'expires_at': end_dt.date(),
                        }
                    )
                    STATS['booking_insurances'] += 1
                except Exception:
                    pass

            # Deposit hold for active & confirmed bookings
            if status in ('active', 'confirmed') and txn:
                DepositHold.objects.create(
                    user=user, booking=booking,
                    amount=car.deposit or car.model_info.base_deposit,
                    status='held', transaction=txn,
                )
                STATS['deposit_holds'] += 1

            # Release deposit for completed bookings
            if status == 'completed' and txn:
                DepositHold.objects.create(
                    user=user, booking=booking,
                    amount=car.deposit or car.model_info.base_deposit,
                    status='released', transaction=txn,
                    released_at=end_dt,
                )
                STATS['deposit_holds'] += 1

            # Fine for some completed bookings
            if status == 'completed' and random.random() < 0.25:
                fine_reasons = [
                    ("Kech qaytarish (1 kun)", 200000),
                    ("Kech qaytarish (2 kun)", 400000),
                    ("Salon iflos holda qaytarildi", 100000),
                    ("Chiziq va shikastlanish", 500000),
                    ("Benzin yetarli emas", 50000),
                    ("Yo'l harakati jarima", 300000),
                    ("G'ildirak shikasti", 800000),
                ]
                reason, amount = random.choice(fine_reasons)
                Fine.objects.create(
                    booking=booking,
                    amount=amount,
                    reason=reason,
                    status=random.choice(['paid', 'unpaid', 'paid']),
                    resolved_at=NOW if random.random() > 0.5 else None,
                )
                STATS['fines'] += 1

            # Refund request for cancelled bookings
            if status == 'cancelled' and txn and pay_status == 'refunded':
                RefundRequest.objects.create(
                    transaction=txn,
                    amount=total,
                    reason="Mijoz buyurtmani bekor qildi",
                    status='completed',
                )
                STATS['refund_requests'] += 1

            # Loyalty points for completed
            if status == 'completed':
                try:
                    account = user.loyalty_account
                    pts = int(total / 10000)
                    LoyaltyTransaction.objects.create(
                        account=account, transaction_type='earn',
                        points=pts, reason=f"Booking {booking.booking_code} uchun",
                        booking=booking, balance_after=account.points + pts,
                    )
                    STATS['loyalty_transactions'] += 1
                except Exception:
                    pass

    print(f"  [+] {STATS['bookings']} bookings, {STATS['transactions']} transactions")
    print(f"  [+] {STATS['invoices']} invoices, {STATS['receipts']} receipts")
    print(f"  [+] {STATS['booking_insurances']} insurance policies, {STATS['fines']} fines")
    print(f"  [+] {STATS['deposit_holds']} deposit holds, {STATS['refund_requests']} refund requests")


def seed_notifications(user_data):
    """Create notifications for various events."""
    print("\n══ NOTIFICATIONS ══════════════════════════════")

    notification_templates = {
        'approved': [
            ('kyc_approved', "KYC tasdiqlandi ✅", "Sizning hujjatlaringiz muvaffaqiyatli tekshirildi va tasdiqlandi. Endi mashina ijaraga olishingiz mumkin!"),
            ('booking_created', "Yangi buyurtma yaratildi 🚗", "Sizning demo buyurtmangiz yaratildi va jarayonda."),
            ('payment_completed', "To'lov muvaffaqiyatli 💳", "Sizning so'nggi to'lovingiz muvaffaqiyatli amalga oshirildi."),
            ('booking_approved', "Buyurtma tasdiqlandi ✅", "Admin sizning buyurtmangizni ko'rib chiqdi va tasdiqladi. Yaxshi safar!"),
        ],
        'submitted': [
            ('kyc_submitted', "Hujjatlar yuborildi 📄", "Hujjatlaringiz tekshirishga yuborildi. Iltimos, natijani kuting."),
        ],
        'under_review': [
            ('kyc_submitted', "Ko'rib chiqilmoqda 🔍", "Hujjatlaringiz admin tomonidan ko'rib chiqilmoqda."),
        ],
        'rejected': [
            ('kyc_rejected', "KYC rad etildi ❌", "Hujjatlaringiz rad etildi. Sabab: Passport rasmi noaniq. Iltimos qayta yuboring."),
        ],
        'draft': [
            ('system', "Hujjat yuklanmagan 📋", "KYC hujjatlarini yuklashni unutmang! Bu mashina ijarasi uchun talab qilinadi."),
        ],
    }

    for user, role, kyc_status, *_ in user_data:
        if role in ('admin', 'staff'):
            # Admin/staff notification
            Notification.objects.get_or_create(
                user=user, type='system', title="Admin Panel",
                defaults={
                    'message': f"Xush kelibsiz, {user.first_name}! Admin paneliga muvaffaqiyatli kirdingiz.",
                    'admin_only': role == 'admin',
                    'metadata': {'role': role},
                }
            )
            if role == 'admin':
                Notification.objects.get_or_create(
                    user=user, type='booking_pending_admin',
                    title="Yangi buyurtmalar kutmoqda ⏳",
                    defaults={
                        'message': "Bir nechta buyurtma admin tasdig'ini kutmoqda. Iltimos, ko'rib chiqing.",
                        'admin_only': True,
                        'metadata': {'pending_count': 5},
                    }
                )
            STATS['notifications'] += 1
            continue

        # System welcome for every user
        Notification.objects.get_or_create(
            user=user, type='system', title="Xush kelibsiz! 🎉",
            defaults={
                'message': f"Salom {user.first_name}! RIDELUX platformasiga xush kelibsiz. Premium mashina ijarasi xizmati sizni kutmoqda.",
                'metadata': {'welcome': True},
            }
        )
        STATS['notifications'] += 1

        # Status-specific notifications
        templates = notification_templates.get(kyc_status, [])
        for ntype, title, msg in templates:
            Notification.objects.get_or_create(
                user=user, type=ntype, title=title,
                defaults={
                    'message': msg,
                    'is_read': random.random() < 0.4,  # 40% chance read
                    'metadata': {'auto_generated': True},
                }
            )
            STATS['notifications'] += 1

    # Global admin-only notification
    Notification.objects.get_or_create(
        user=None, admin_only=True, type='booking_pending_admin',
        title="Yangi buyurtmalar kutmoqda",
        defaults={
            'message': "Ko'plab buyurtmalar admin tasdig'ini kutmoqda. Iltimos shoshiling!",
            'metadata': {'global': True},
        }
    )

    # System maintenance notice
    Notification.objects.get_or_create(
        user=None, admin_only=False, type='system',
        title="Tizim yangilanishi 🔧",
        defaults={
            'message': "2026-yil 15-aprel kuni soat 02:00-04:00 oralig'ida texnik ishlar olib boriladi. Noqulaylik uchun uzr so'raymiz.",
            'metadata': {'maintenance_window': '2026-04-15 02:00-04:00'},
        }
    )
    STATS['notifications'] += 2

    print(f"  [+] {STATS['notifications']} notifications")


def seed_reviews(user_data, all_cars):
    """Create reviews from approved users."""
    print("\n══ REVIEWS & FAVORITES ════════════════════════")
    review_texts = [
        ("Ajoyib mashina, juda toza va qulay edi! Albatta tavsiya qilaman.", 5),
        ("Xizmat yaxshi, lekin kech topshirildi. Keyingi safar yaxshiroq bo'ladi degan umiddaman.", 3),
        ("Premium sifat, hamma narsa a'lo darajada edi. Oilam ham juda mamnun!", 5),
        ("Yaxshi tajriba, yana qaytaman. Mashina soz, xizmat tez.", 4),
        ("Narxi adolatli, mashina yangi va toza. Salon hidlari ham yoqimli edi.", 5),
        ("Mashina soz edi, shunchaki oddiy. Lekin narxiga yarasha.", 3),
        ("Zooooor! Bu mashina menga juda yoqdi. Tezligi va qulayligi boshqacha.", 5),
        ("Normal mashina, lekin konditsioner yaxshi ishlamadi. Qayta ko'rib chiqishlarini so'rayman.", 2),
        ("Biznes uchrashuv uchun ideal tanlov edi. Mijozlarimga yoqdi.", 4),
        ("Oilaviy sayohat uchun eng yaxshi mashina! Bolalar uchun joy yetarli.", 5),
        ("Haydovchi bilan xizmat zo'r edi, aniq boshqa safar ham buyurtma beraman.", 5),
        ("Mashina yaxshi, lekin GPS navigatsiya eski versiyada edi.", 4),
        ("Birinchi marta ijaraga oldim, tajribam ajoyib bo'ldi! RIDELUX jamoasiga rahmat.", 5),
        ("Krossfover sinfida eng yaxshisi! Tog' yo'llarida ham muammo bo'lmadi.", 4),
        ("Elektromobil tajribasi ajoyib edi. Zaryadlash punkti ham qulay joylashgan.", 5),
        ("Rangi va interyer juda chiroyli. Lekin yonilg'i ko'p sarfladi.", 3),
    ]

    approved_users = [u for u, role, kyc, *_ in user_data if kyc == 'approved']

    # Create comprehensive reviews — each approved user reviews multiple cars
    for user in approved_users:
        num_reviews = random.randint(2, 5)
        review_cars = random.sample(all_cars, min(num_reviews, len(all_cars)))
        for car in review_cars:
            text, rating = random.choice(review_texts)
            _, created = Review.objects.get_or_create(
                user=user, car=car, defaults={'comment': text, 'rating': rating}
            )
            if created:
                STATS['reviews'] += 1
                # Update car rating aggregates
                car_reviews = Review.objects.filter(car=car)
                if car_reviews.exists():
                    avg_rating = sum(r.rating for r in car_reviews) / car_reviews.count()
                    Car.objects.filter(id=car.id).update(
                        rating=round(avg_rating, 1),
                        review_count=car_reviews.count(),
                    )

    # Favorites — each approved user favorites 3-6 random cars
    for user in approved_users:
        fav_count = random.randint(3, 6)
        fav_cars = random.sample(all_cars, min(fav_count, len(all_cars)))
        for car in fav_cars:
            _, created = Favorite.objects.get_or_create(user=user, car=car)
            if created:
                STATS['favorites'] += 1

    print(f"  [+] {STATS['reviews']} reviews, {STATS['favorites']} favorites")


def seed_waitlist(user_data, all_cars):
    """Create waitlist entries for busy cars."""
    print("\n══ WAITLIST ═══════════════════════════════════")
    rented_cars = [c for c in all_cars if c.status == 'rented']
    if not rented_cars:
        rented_cars = all_cars[:5]

    approved_users = [u for u, role, kyc, *_ in user_data if kyc == 'approved']

    for car in rented_cars:
        num_waiters = random.randint(1, 3)
        users_for_car = random.sample(approved_users, min(num_waiters, len(approved_users)))
        for user in users_for_car:
            status = random.choice(['active', 'active', 'resolved', 'cancelled'])
            Waitlist.objects.get_or_create(
                user=user, car=car,
                defaults={'status': status}
            )
            STATS['waitlist'] += 1

    print(f"  [+] {STATS['waitlist']} waitlist entries")


def seed_contact_messages():
    """Create contact form messages."""
    print("\n══ CONTACT MESSAGES ═══════════════════════════")
    messages = [
        ("Aziz Tashkentov", "aziz.t@gmail.com", "Narxlar haqida",
         "Salom! Mercedes G63 ni haftalik ijaraga olsam, chegirma bormi? Narxlar ro'yxatini yuboring iltimos."),
        ("Kamila Nosirova", "kamila.nos@mail.ru", "Korporativ hamkorlik",
         "Kompaniyamiz uchun oylik mashina ijarasi bo'yicha hamkorlik qilishni xohlaymiz. Maxsus narxlar mavjudmi?"),
        ("Rustam Qodirov", "rustam.q@inbox.uz", "Haydovchi xizmati",
         "Haydovchi bilan xizmat haqida batafsil ma'lumot bera olasizmi? Aeroport transferi uchun kerak."),
        ("Dilnoza Karimova", "dilnoza.k@gmail.com", "Sharh",
         "Ajoyib xizmat! BMW iX ni ijaraga olgan edim, nihoyatda mamnun qoldim. Rahmat jamoangizga!"),
        ("Sanjar Olimov", "sanjar.o@yahoo.com", "KYC muammo",
         "KYC hujjatlarimni yuklashda xatolik chiqyapti. Yordam bera olasizmi?"),
        ("Gulnora Ahmedova", "gulnora.a@gmail.com", "To'y uchun mashina",
         "To'y kuni uchun oq rangdagi premium mashina kerak. 3 kunlik ijaraga qancha turadi?"),
        ("Farhod Uzoqov", "farhod.u@mail.ru", "Sug'urta haqida",
         "Elite VIP sug'urta paketi nimalarni qamrab oladi? Batafsil tushuntirib bering."),
        ("Nargiza Yuldasheva", "nargiza.y@inbox.uz", "Shikoyat",
         "Buyurtma qilgan mashinam kech keltirildi. Bu holatni tushuntirishingizni so'rayman."),
        ("Behruz Rajabov", "behruz.r@gmail.com", "Elektromobil zaryadlash",
         "Tesla Model Y ijaraga olmoqchiman. Toshkentda zaryadlash stansiyalari yetarlimi?"),
        ("Sevara Zaripova", "sevara.z@mail.ru", "Chegirma kodi",
         "Do'stim RIDELUX10 kodini berdi, lekin ishlamayapti. Muddati o'tib ketmaganmi?"),
    ]

    for name, email, subject, message in messages:
        ContactMessage.objects.get_or_create(
            name=name, email=email, subject=subject,
            defaults={
                'message': message,
                'is_read': random.random() < 0.4,
            }
        )
        STATS['contact_messages'] += 1

    print(f"  [+] {STATS['contact_messages']} contact messages")


def seed_maintenance_types_and_records(all_cars):
    """Create maintenance types and records for cars."""
    print("\n══ MAINTENANCE ════════════════════════════════")
    types_data = [
        ("Texnik Ko'rik", "tech-inspection", "To'liq texnik ko'rik va diagnostika", "clipboard-check"),
        ("Moy Almashtirish", "oil-change", "Dvigatel moyi va filtrini almashtirish", "droplets"),
        ("Shinalar Almashtirish", "tire-change", "Mavsumiy shina almashtirish", "circle"),
        ("Tormoz Tizimi", "brake-service", "Tormoz kolodkalari va disklarni tekshirish", "octagon"),
        ("Akkumulyator", "battery-check", "Akkumulyator tekshirish va almashtirish", "battery"),
        ("Konditsioner", "ac-service", "Konditsioner gazi to'ldirish va tekshirish", "wind"),
        ("Kuzov Ta'mirlash", "body-repair", "Kuzov chiziq va shikastlanish ta'mirlash", "wrench"),
        ("Ichki Yuvish", "interior-cleaning", "Salon chuqur tozalash va dezinfeksiya", "sparkles"),
    ]

    type_objs = {}
    for name, code, desc, icon in types_data:
        obj, _ = MaintenanceType.objects.get_or_create(
            code=code,
            defaults={'name': name, 'description': desc, 'icon_name': icon}
        )
        type_objs[code] = obj
        STATS['maintenance_types'] += 1

    # Create maintenance records for some cars
    maintenance_cars = [c for c in all_cars if c.status == 'maintenance']
    maintenance_cars += random.sample(all_cars, min(10, len(all_cars)))  # plus some random

    performers = [
        "Ridelux Texnik Servis",
        "AutoPro Tashkent",
        "GM Uzbekistan Service",
        "BYD Tashkent Center",
        "BMW Tashkent Authorized",
        "Hyundai Service Center",
    ]

    for car in maintenance_cars:
        num_records = random.randint(1, 3)
        for _ in range(num_records):
            mtype = random.choice(list(type_objs.values()))
            days_ago = random.randint(1, 90)
            scheduled = (NOW - timedelta(days=days_ago)).date()

            if days_ago > 7:
                status = 'completed'
                completed = scheduled + timedelta(days=random.randint(1, 3))
            elif days_ago < 1:
                status = 'scheduled'
                completed = None
            else:
                status = random.choice(['in_progress', 'completed', 'scheduled'])
                completed = scheduled + timedelta(days=1) if status == 'completed' else None

            cost = random.choice([200000, 500000, 800000, 1200000, 2000000, 3500000])
            mileage = random.randint(5000, 120000)

            MaintenanceRecord.objects.create(
                car=car,
                maintenance_type=mtype,
                scheduled_date=scheduled,
                completed_date=completed,
                mileage_at_service=mileage,
                next_service_mileage=mileage + random.choice([5000, 10000, 15000]),
                cost=cost,
                notes=f"{mtype.name} bajarildi. Keyingi xizmat {mileage + 10000} km da.",
                performed_by=random.choice(performers),
                status=status,
            )
            STATS['maintenance_records'] += 1

    print(f"  [+] {STATS['maintenance_types']} types, {STATS['maintenance_records']} records")


def seed_pricing_rules():
    """Create dynamic pricing rules."""
    print("\n══ PRICING RULES ══════════════════════════════")
    rules = [
        {
            'name': "Dam olish kunlari qo'shimcha", 'rule_type': 'weekend_surge',
            'applies_to_weekdays': '5,6', 'modifier_type': 'multiply',
            'modifier_value': Decimal('1.1500'), 'priority': 10,
            'applies_to_all': True, 'applies_to_categories': '',
        },
        {
            'name': "Yozgi yuqori mavsum", 'rule_type': 'peak_season',
            'date_from': datetime(2026, 6, 1).date(), 'date_to': datetime(2026, 8, 31).date(),
            'modifier_type': 'multiply', 'modifier_value': Decimal('1.2000'), 'priority': 8,
            'applies_to_all': True, 'applies_to_categories': '',
        },
        {
            'name': "Qishki past mavsum", 'rule_type': 'low_season',
            'date_from': datetime(2026, 12, 1).date(), 'date_to': datetime(2027, 2, 28).date(),
            'modifier_type': 'multiply', 'modifier_value': Decimal('0.9000'), 'priority': 7,
            'applies_to_all': True, 'applies_to_categories': '',
        },
        {
            'name': "Navro'z bayram", 'rule_type': 'holiday',
            'date_from': datetime(2026, 3, 20).date(), 'date_to': datetime(2026, 3, 25).date(),
            'modifier_type': 'multiply', 'modifier_value': Decimal('1.3000'), 'priority': 15,
            'applies_to_all': True, 'applies_to_categories': '',
        },
        {
            'name': "Mustaqillik kuni", 'rule_type': 'holiday',
            'date_from': datetime(2026, 9, 1).date(), 'date_to': datetime(2026, 9, 3).date(),
            'modifier_type': 'multiply', 'modifier_value': Decimal('1.2500'), 'priority': 14,
            'applies_to_all': True, 'applies_to_categories': '',
        },
        {
            'name': "Oxirgi daqiqa chegirmasi", 'rule_type': 'last_minute',
            'days_before_start': 1, 'modifier_type': 'add_percent',
            'modifier_value': Decimal('-10.0000'), 'priority': 5,
            'applies_to_all': False, 'applies_to_categories': 'economy,sedan',
        },
        {
            'name': "Erta buyurtma chegirmasi", 'rule_type': 'advance_booking',
            'days_before_start': 14, 'modifier_type': 'add_percent',
            'modifier_value': Decimal('-5.0000'), 'priority': 4,
            'applies_to_all': True, 'applies_to_categories': '',
        },
        {
            'name': "Uzoq muddatli ijara chegirmasi", 'rule_type': 'long_rental',
            'min_days': 7, 'modifier_type': 'add_percent',
            'modifier_value': Decimal('-8.0000'), 'priority': 6,
            'applies_to_all': True, 'applies_to_categories': '',
        },
        {
            'name': "14+ kun uchun mega chegirma", 'rule_type': 'long_rental',
            'min_days': 14, 'modifier_type': 'add_percent',
            'modifier_value': Decimal('-15.0000'), 'priority': 7,
            'applies_to_all': True, 'applies_to_categories': '',
        },
        {
            'name': "Premium avtomobil dam olish kuni", 'rule_type': 'weekend_surge',
            'applies_to_weekdays': '5,6', 'modifier_type': 'multiply',
            'modifier_value': Decimal('1.2500'), 'priority': 12,
            'applies_to_all': False, 'applies_to_categories': 'premium',
        },
    ]

    for r in rules:
        PricingRule.objects.get_or_create(
            name=r['name'],
            defaults={
                'rule_type': r['rule_type'],
                'applies_to_weekdays': r.get('applies_to_weekdays', ''),
                'date_from': r.get('date_from'),
                'date_to': r.get('date_to'),
                'min_days': r.get('min_days'),
                'days_before_start': r.get('days_before_start'),
                'modifier_type': r['modifier_type'],
                'modifier_value': r['modifier_value'],
                'applies_to_all': r['applies_to_all'],
                'applies_to_categories': r.get('applies_to_categories', ''),
                'priority': r['priority'],
                'is_active': True,
            }
        )
        STATS['pricing_rules'] += 1

    print(f"  [+] {STATS['pricing_rules']} pricing rules")


# ═══════════════════════════════════════════════════════════
# CLEAR / FRESH
# ═══════════════════════════════════════════════════════════

def clear_all_data():
    """Delete all seeded data for a fresh start."""
    print("\n🗑️  CLEARING ALL DATA...")
    models_to_clear = [
        PaymentReceipt, BillingInvoice, RefundRequest, DepositHold, Fine,
        PaymentTransaction, PaymentMethod, BookingInsurance,
        Notification, LoyaltyTransaction, LoyaltyAccount, LoyaltyTier,
        Review, Favorite, Waitlist, Booking,
        MaintenanceRecord, MaintenanceType,
        CarImage, Car, CarModel, Amenity,
        KYCProfile, PromoCode,
        ContactMessage, PricingRule,
        # Also clear cars.MaintenanceRecord if exists separately
    ]
    try:
        models_to_clear.append(CarMaintenanceRecord)
    except Exception:
        pass

    for m in models_to_clear:
        try:
            count = m.objects.count()
            if count:
                m.objects.all().delete()
                print(f"  [-] {m.__name__}: {count} deleted")
        except Exception as e:
            print(f"  [!] {m.__name__}: {e}")

    # Delete non-admin users
    deleted = User.objects.filter(is_superuser=False).delete()[0]
    print(f"  [-] Users (non-admin): {deleted} deleted")
    # Delete admin too for fresh
    deleted = User.objects.all().delete()[0]
    print(f"  [-] All users: {deleted} deleted")
    # Clear districts
    District.objects.all().delete()
    print("  [-] Districts cleared")
    print("  ✅ Database cleared\n")


# ═══════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════

def run():
    fresh = '--fresh' in sys.argv or '--reset' in sys.argv

    print("╔══════════════════════════════════════════════════╗")
    print("║   RIDELUX — Professional Demo Seed v3.0         ║")
    print("║   To'liq baza to'ldiruvchi (All Models Seeded)  ║")
    print("╚══════════════════════════════════════════════════╝")
    print(f"  Mode: {'🔄 FRESH (delete + re-seed)' if fresh else '➕ INCREMENTAL (skip existing)'}")
    print(f"  Pillow: {'✅ Available' if HAS_PILLOW else '❌ Not installed (no images)'}")

    if fresh:
        clear_all_data()

    # 1. Districts (with coordinates)
    seed_districts()

    # 2. Users
    user_data = seed_users()

    # 3. KYC Profiles
    seed_kyc_profiles(user_data)

    # 4. Payment Methods
    seed_payment_methods(user_data)

    # 5. Loyalty System
    tier_objs = seed_loyalty()
    seed_loyalty_accounts(user_data, tier_objs)

    # 6. Insurance Plans
    insurance_plans = seed_insurance_plans()

    # 7. Promo Codes
    seed_promo_codes()

    # 8. Cars
    all_cars = seed_cars()

    # 9. Bookings, Payments, Invoices, Deposits, Fines, Refunds
    seed_bookings_and_payments(user_data, all_cars, insurance_plans)

    # 10. Loyalty Transactions (diverse history)
    seed_loyalty_transactions(user_data)

    # 11. Notifications
    seed_notifications(user_data)

    # 12. Reviews & Favorites
    seed_reviews(user_data, all_cars)

    # 13. Waitlist
    seed_waitlist(user_data, all_cars)

    # 14. Contact Messages
    seed_contact_messages()

    # 15. Maintenance Types & Records
    seed_maintenance_types_and_records(all_cars)

    # 16. Pricing Rules
    seed_pricing_rules()

    # ═══════════════════════════════════════════════════════
    # SUMMARY
    # ═══════════════════════════════════════════════════════
    print("\n╔══════════════════════════════════════════════════╗")
    print("║                 SEED SUMMARY                    ║")
    print("╠══════════════════════════════════════════════════╣")
    for key, val in STATS.items():
        if key == 'media_files':
            continue
        print(f"║  {key:<28} {val:>10}     ║")
    print(f"║  {'media_files':<28} {len(STATS['media_files']):>10}     ║")
    print("╠══════════════════════════════════════════════════╣")
    print("║           DEMO CREDENTIALS                      ║")
    print("╠══════════════════════════════════════════════════╣")
    print("║  👑 Admin:     admin / admin123                  ║")
    print("║  🔧 Staff:     staff_mod / staff123              ║")
    print("║  🔧 Staff:     staff_ali / staff123              ║")
    print("║  ✅ User:      jamshid_car / demo123             ║")
    print("║  ✅ User:      madina.lux / demo123              ║")
    print("║  ✅ User:      sardor_88 / demo123               ║")
    print("║  ✅ User:      nilu_drive / demo123              ║")
    print("║  ✅ User:      dilshod_pro / demo123             ║")
    print("║  ✅ User:      shaxzoda.vip / demo123            ║")
    print("║  ✅ User:      aziz_ride / demo123               ║")
    print("║  ✅ User:      kamola_lux / demo123              ║")
    print("║  ⏳ Pending:   anvar_taxi / demo123              ║")
    print("║  ⏳ Pending:   nodir.dev / demo123               ║")
    print("║  ⏳ Pending:   shahlo_2026 / demo123             ║")
    print("║  ❌ Rejected:  malika_queen / demo123            ║")
    print("║  ❌ Rejected:  bobur_fail / demo123              ║")
    print("║  📋 Draft:     feruza_lux / demo123              ║")
    print("║  📋 Draft:     otabek_new / demo123              ║")
    print("║  🏢 Corporate: xurshid_b2b / demo123             ║")
    print("║  🏢 Corporate: zarina_corp / demo123             ║")
    print("║  💎 VIP:       alisher_shark / demo123            ║")
    print("║  🥇 Gold:      bekzod_premium / demo123           ║")
    print("╚══════════════════════════════════════════════════╝")

    if STATS['media_files']:
        print(f"\n📁 Media files saved ({len(STATS['media_files'])})")
        for f in STATS['media_files'][:10]:
            print(f"   → media/{f}")
        if len(STATS['media_files']) > 10:
            print(f"   ... and {len(STATS['media_files']) - 10} more")

    print("\n✅ RIDELUX seed v3.0 completed successfully!")
    print("   Barcha jadvallar to'ldirildi: Users, KYC, Cars, Bookings,")
    print("   Payments, Reviews, Loyalty, Insurance, Maintenance, Pricing,")
    print("   Notifications, Contacts, Waitlist, Favorites, Districts!\n")


if __name__ == '__main__':
    run()
