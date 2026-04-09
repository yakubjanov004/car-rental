"""
RIDELUX — Professional Demo Data Generator (seed_extended.py)
=============================================================
Generates complete, realistic demo data for all platform entities.
Supports --fresh flag to reset all data before seeding.

Usage:
    python scripts/seed_extended.py          # Incremental (skip existing)
    python scripts/seed_extended.py --fresh  # Delete all + re-seed
"""
import os
import sys
import django
import random
import uuid
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
from apps.cars.models import CarModel, Car, Amenity, CarImage
from apps.bookings.models import Booking, Fine
from apps.reviews.models import Review
from apps.payments.models import (
    PaymentMethod, PaymentTransaction, BillingInvoice,
    PaymentReceipt, PromoCode, DepositHold,
)
from apps.users.models import Notification, KYCProfile
from apps.loyalty.models import LoyaltyTier, LoyaltyAccount, LoyaltyTransaction
from apps.insurance.models import InsurancePlan, BookingInsurance
from apps.favorites.models import Favorite

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
# DEMO USER PROFILES
# ═══════════════════════════════════════════════════════════

DEMO_USERS = [
    # (first, last, username, role, kyc_status, verification_status)
    ("Admin", "Ridelux", "admin", "admin", None, "verified"),
    ("Staff", "Moderator", "staff_mod", "staff", None, "verified"),
    # KYC Approved users with bookings
    ("Jamshid", "Abduqodirov", "jamshid_car", "user", "approved", "verified"),
    ("Madina", "Xodjayeva", "madina.lux", "user", "approved", "verified"),
    ("Sardor", "Rustamov", "sardor_88", "user", "approved", "verified"),
    ("Nilufar", "G'aniyeva", "nilu_drive", "user", "approved", "verified"),
    ("Dilshod", "To'rayev", "dilshod_pro", "user", "approved", "verified"),
    ("Shaxzoda", "Umarova", "shaxzoda.vip", "user", "approved", "verified"),
    # KYC Pending users
    ("Anvar", "Karimov", "anvar_taxi", "user", "submitted", "pending"),
    ("Nodir", "Sodiqov", "nodir.dev", "user", "under_review", "pending"),
    # KYC Rejected user
    ("Malika", "Saidova", "malika_queen", "user", "rejected", "unverified"),
    # New users (no KYC)
    ("Feruza", "Normatova", "feruza_lux", "user", "draft", "unverified"),
    # Corporate user
    ("Xurshid", "Toshmatov", "xurshid_b2b", "user", "approved", "verified"),
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
]

HAS_PILLOW = _ensure_pillow()

# ═══════════════════════════════════════════════════════════
# SEEDING FUNCTIONS
# ═══════════════════════════════════════════════════════════

def seed_users():
    """Create demo users with avatars and document images."""
    print("\n══ USERS ══════════════════════════════════════")
    created_users = []

    for first, last, uname, role, kyc_status, verif in DEMO_USERS:
        full_name = f"{first} {last}"
        passport_num = f"A{chr(65 + hash(uname) % 26)}{abs(hash(uname)) % 9000000 + 1000000}"
        license_num = f"AF{abs(hash(uname + 'lic')) % 9000000 + 1000000}"
        phone = f"+9989{abs(hash(uname)) % 10}{abs(hash(uname+'p')) % 900 + 100}{abs(hash(uname+'q')) % 90 + 10}{abs(hash(uname+'r')) % 90 + 10}"

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
                'is_corporate': uname == 'xurshid_b2b',
                'company_name': "TechCorp LLC" if uname == 'xurshid_b2b' else None,
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
    for user, role, kyc_status, full_name, passport_num, license_num in user_data:
        if role in ('admin', 'staff') or kyc_status is None:
            continue
        kyc, created = KYCProfile.objects.update_or_create(
            user=user,
            defaults={
                'status': kyc_status,
                'full_name': full_name,
                'date_of_birth': datetime(1990 + hash(user.username) % 10, 1 + hash(user.username) % 12, 1 + hash(user.username) % 28).date(),
                'nationality': "Uzbekistan",
                'passport_series': passport_num[:2],
                'passport_issued_by': "IIV Yunusobod tumani",
                'passport_issue_date': datetime(2020, 3, 15).date(),
                'passport_expiry_date': datetime(2030, 3, 15).date(),
                'license_number': license_num,
                'license_category': 'B',
                'license_issue_date': datetime(2019, 6, 1).date(),
                'license_expiry_date': datetime(2029, 6, 1).date(),
                'rejection_reason': "Passport rasmi noaniq" if kyc_status == 'rejected' else '',
                'submitted_at': NOW - timedelta(days=random.randint(1, 30)) if kyc_status != 'draft' else None,
                'reviewed_at': NOW - timedelta(days=random.randint(0, 5)) if kyc_status in ('approved', 'rejected') else None,
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
    for user, role, kyc_status, *_ in user_data:
        if role in ('admin', 'staff'):
            continue
        if PaymentMethod.objects.filter(user=user).exists():
            continue
        num_cards = 2 if kyc_status == 'approved' else 1
        for i in range(num_cards):
            ctype, prefix = card_defs[(hash(user.username) + i) % len(card_defs)]
            pan = f"{prefix} **** **** {abs(hash(user.username + str(i))) % 9000 + 1000}"
            PaymentMethod.objects.create(
                user=user, card_type=ctype, masked_pan=pan,
                expiry_month=f"{(hash(user.username) % 12) + 1:02d}",
                expiry_year=f"{27 + i}",
                card_holder=f"{user.first_name} {user.last_name}".upper(),
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
        'sardor_88': 500,         # Bronze
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


def seed_insurance_plans():
    """Create insurance plans."""
    print("\n══ INSURANCE PLANS ════════════════════════════")
    plans = [
        ("Asosiy Himoya", "basic", "basic", 50000, 5000000, True, False, False, False, False, 0),
        ("Standart Paket", "standard", "standard", 100000, 2000000, True, True, False, True, False, 1),
        ("Premium Qoplama", "premium", "premium", 200000, 500000, True, True, True, True, True, 2),
        ("Elite VIP", "elite", "elite", 350000, 0, True, True, True, True, True, 3),
    ]
    plan_objs = []
    for name, slug, lvl, price, ded, col, thf, nat, road, pers, sort in plans:
        plan, _ = InsurancePlan.objects.get_or_create(
            slug=slug,
            defaults={
                'name': name, 'coverage_level': lvl, 'daily_price': price,
                'deductible': ded, 'covers_collision': col, 'covers_theft': thf,
                'covers_natural_disaster': nat, 'covers_roadside_assistance': road,
                'covers_personal_accident': pers, 'sort_order': sort,
            }
        )
        plan_objs.append(plan)
        STATS['insurance_plans'] += 1
    print(f"  [+] {len(plan_objs)} insurance plans")
    return plan_objs


def seed_promo_codes():
    """Create promo codes."""
    print("\n══ PROMO CODES ════════════════════════════════")
    promos = [
        ("RIDELUX10", "percentage", 10, 30),
        ("WELCOME25", "percentage", 25, 14),
        ("VIP50K", "fixed", 50000, 60),
        ("SPRING2026", "percentage", 15, 45),
    ]
    for code, dtype, val, days in promos:
        PromoCode.objects.get_or_create(
            code=code,
            defaults={
                'discount_type': dtype,
                'discount_value': val,
                'valid_until': NOW + timedelta(days=days),
                'is_active': True,
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

        # Units
        for idx in range(random.randint(2, 4)):
            district = ensure_district(random.choice(cfg['districts']))
            color = random.choice(cfg['colors'])
            inv = f"{cfg['brand'][:3].upper()}-{abs(hash(code+str(idx))) % 9000 + 1000}-{idx}"
            plate = f"{random.randint(10,99)} {random.randint(100,999)} {chr(65+random.randint(0,25))}{chr(65+random.randint(0,25))}{chr(65+random.randint(0,25))}"
            car, _ = Car.objects.get_or_create(
                inventory_code=inv,
                defaults={
                    'model_info': model, 'district': district,
                    'plate_number': plate, 'color_name': color[0], 'color_hex': color[1],
                    'year': random.randint(cfg['year_range'][0], cfg['year_range'][1]),
                    'daily_price': Decimal(cfg['base_daily_price']),
                    'deposit': Decimal(cfg['base_deposit']),
                    'status': 'available', 'is_available': True,
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
        # (status, payment_status, days_offset, duration)
        ('completed', 'paid', -30, 3),
        ('completed', 'paid', -20, 2),
        ('active', 'paid', -1, 5),
        ('confirmed', 'paid', 5, 3),
        ('payment_pending', 'initiated', 7, 2),
        ('pending', None, 10, 1),
        ('cancelled', 'refunded', -15, 2),
        ('rejected', None, -10, 1),
        ('failed', 'failed', -5, 2),
    ]

    invoice_counter = 1000

    for user, full_name in booking_users:
        num_bookings = random.randint(2, 4)
        scenarios = random.sample(booking_scenarios, min(num_bookings, len(booking_scenarios)))

        for status, pay_status, day_offset, duration in scenarios:
            car = random.choice(all_cars)
            start_dt = NOW + timedelta(days=day_offset)
            end_dt = start_dt + timedelta(days=duration)
            total = car.daily_price * duration

            booking = Booking.objects.create(
                user=user, car=car,
                start_datetime=start_dt, end_datetime=end_dt,
                total_price=total, status=status,
                full_name=full_name,
                phone_number=user.phone_number or '+998900000000',
                comment=f"Demo booking — {status}" if status in ('cancelled', 'rejected') else '',
                rejection_reason="Hujjatlar to'liq emas" if status == 'rejected' else '',
            )
            STATS['bookings'] += 1

            # Payment transaction
            txn = None
            if pay_status:
                txn = PaymentTransaction.objects.create(
                    user=user, booking=booking, amount=total,
                    provider='mock', method='card', status=pay_status,
                    paid_at=NOW if pay_status == 'paid' else None,
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

            # Deposit hold for active bookings
            if status == 'active' and txn:
                DepositHold.objects.create(
                    user=user, booking=booking,
                    amount=car.deposit or car.model_info.base_deposit,
                    status='held', transaction=txn,
                )

            # Fine for some completed bookings
            if status == 'completed' and random.random() < 0.3:
                Fine.objects.create(
                    booking=booking,
                    amount=random.choice([100000, 200000, 500000]),
                    reason=random.choice(["Kech qaytarish", "Salon iflos", "Chiziq"]),
                    status=random.choice(['paid', 'unpaid']),
                )
                STATS['fines'] += 1

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


def seed_notifications(user_data):
    """Create notifications for various events."""
    print("\n══ NOTIFICATIONS ══════════════════════════════")
    notif_templates = [
        ('booking_created', "Yangi buyurtma", "Sizning buyurtmangiz qabul qilindi."),
        ('payment_completed', "To'lov muvaffaqiyatli", "To'lov amalga oshirildi."),
        ('booking_approved', "Buyurtma tasdiqlandi", "Admin buyurtmangizni tasdiqladi."),
        ('kyc_approved', "KYC tasdiqlandi", "Hujjatlaringiz tasdiqlandi."),
        ('kyc_rejected', "KYC rad etildi", "Hujjatlaringiz rad etildi. Qayta yuboring."),
        ('system', "Xush kelibsiz!", "RIDELUX platformasiga xush kelibsiz!"),
    ]
    for user, role, kyc_status, *_ in user_data:
        if role in ('admin', 'staff'):
            # Admin notification
            Notification.objects.get_or_create(
                user=user, type='system', title="Admin Panel",
                defaults={'message': "Admin paneliga xush kelibsiz!", 'admin_only': role == 'admin'}
            )
            STATS['notifications'] += 1
            continue
        # System welcome
        Notification.objects.get_or_create(
            user=user, type='system', title="Xush kelibsiz!",
            defaults={'message': f"Salom {user.first_name}! RIDELUX platformasiga xush kelibsiz."}
        )
        STATS['notifications'] += 1
        if kyc_status == 'approved':
            Notification.objects.get_or_create(
                user=user, type='kyc_approved', title="KYC tasdiqlandi",
                defaults={'message': "Sizning hujjatlaringiz muvaffaqiyatli tasdiqlandi."}
            )
            Notification.objects.get_or_create(
                user=user, type='booking_created', title="Buyurtma yaratildi",
                defaults={'message': "Sizning demo buyurtmangiz yaratildi."}
            )
            STATS['notifications'] += 2
        elif kyc_status == 'rejected':
            Notification.objects.get_or_create(
                user=user, type='kyc_rejected', title="KYC rad etildi",
                defaults={'message': "Hujjatlaringiz rad etildi. Iltimos qayta yuboring."}
            )
            STATS['notifications'] += 1

    # Admin-only notification
    Notification.objects.get_or_create(
        user=None, admin_only=True, type='booking_pending_admin',
        title="Yangi buyurtmalar kutmoqda",
        defaults={'message': "3 ta buyurtma admin tasdig'ini kutmoqda."}
    )
    STATS['notifications'] += 1
    print(f"  [+] {STATS['notifications']} notifications")


def seed_reviews(user_data, all_cars):
    """Create reviews from approved users."""
    print("\n══ REVIEWS & FAVORITES ════════════════════════")
    review_texts = [
        ("Ajoyib mashina, juda toza va qulay edi!", 5),
        ("Xizmat yaxshi, lekin kech topshirildi.", 3),
        ("Premium sifat, tavsiya qilaman!", 5),
        ("Yaxshi tajriba, yana qaytaman.", 4),
        ("Narxi adolatli, mashina yangi.", 5),
        ("Mashina soz edi, shunchaki oddiy.", 3),
    ]
    approved_users = [u for u, role, kyc, *_ in user_data if kyc == 'approved']
    for car in all_cars[:15]:  # Reviews for first 15 cars
        user = random.choice(approved_users)
        text, rating = random.choice(review_texts)
        _, created = Review.objects.get_or_create(
            user=user, car=car, defaults={'comment': text, 'rating': rating}
        )
        if created:
            STATS['reviews'] += 1

    # Favorites
    for user in approved_users[:5]:
        fav_cars = random.sample(all_cars, min(3, len(all_cars)))
        for car in fav_cars:
            _, created = Favorite.objects.get_or_create(user=user, car=car)
            if created:
                STATS['favorites'] += 1

    print(f"  [+] {STATS['reviews']} reviews, {STATS['favorites']} favorites")


# ═══════════════════════════════════════════════════════════
# CLEAR / FRESH
# ═══════════════════════════════════════════════════════════

def clear_all_data():
    """Delete all seeded data for a fresh start."""
    print("\n🗑️  CLEARING ALL DATA...")
    models_to_clear = [
        PaymentReceipt, BillingInvoice, DepositHold, Fine,
        PaymentTransaction, PaymentMethod, BookingInsurance,
        Notification, LoyaltyTransaction, LoyaltyAccount, LoyaltyTier,
        Review, Favorite, Booking, CarImage, Car, CarModel, Amenity,
        KYCProfile, PromoCode,
    ]
    for m in models_to_clear:
        count = m.objects.count()
        if count:
            m.objects.all().delete()
            print(f"  [-] {m.__name__}: {count} deleted")
    # Delete non-admin users
    deleted = User.objects.filter(is_superuser=False).delete()[0]
    print(f"  [-] Users (non-admin): {deleted} deleted")
    # Delete admin too for fresh
    deleted = User.objects.all().delete()[0]
    print(f"  [-] All users: {deleted} deleted")
    print("  ✅ Database cleared\n")


# ═══════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════

def run():
    fresh = '--fresh' in sys.argv or '--reset' in sys.argv

    print("╔══════════════════════════════════════════════╗")
    print("║   RIDELUX — Professional Demo Seed v2.0     ║")
    print("╚══════════════════════════════════════════════╝")
    print(f"  Mode: {'🔄 FRESH (delete + re-seed)' if fresh else '➕ INCREMENTAL (skip existing)'}")
    print(f"  Pillow: {'✅ Available' if HAS_PILLOW else '❌ Not installed (no images)'}")

    if fresh:
        clear_all_data()

    # 1. Users
    user_data = seed_users()

    # 2. KYC Profiles
    seed_kyc_profiles(user_data)

    # 3. Payment Methods
    seed_payment_methods(user_data)

    # 4. Loyalty System
    tier_objs = seed_loyalty()
    seed_loyalty_accounts(user_data, tier_objs)

    # 5. Insurance Plans
    insurance_plans = seed_insurance_plans()

    # 6. Promo Codes
    seed_promo_codes()

    # 7. Cars
    all_cars = seed_cars()

    # 8. Bookings, Payments, Invoices
    seed_bookings_and_payments(user_data, all_cars, insurance_plans)

    # 9. Notifications
    seed_notifications(user_data)

    # 10. Reviews & Favorites
    seed_reviews(user_data, all_cars)

    # ═══════════════════════════════════════════════════════
    # SUMMARY
    # ═══════════════════════════════════════════════════════
    print("\n╔══════════════════════════════════════════════╗")
    print("║              SEED SUMMARY                   ║")
    print("╠══════════════════════════════════════════════╣")
    for key, val in STATS.items():
        if key == 'media_files':
            continue
        print(f"║  {key:<25} {val:>10}     ║")
    print(f"║  {'media_files':<25} {len(STATS['media_files']):>10}     ║")
    print("╠══════════════════════════════════════════════╣")
    print("║          DEMO CREDENTIALS                   ║")
    print("╠══════════════════════════════════════════════╣")
    print("║  👑 Admin:    admin / admin123               ║")
    print("║  🔧 Staff:    staff_mod / staff123           ║")
    print("║  ✅ User:     jamshid_car / demo123          ║")
    print("║  ✅ User:     madina.lux / demo123           ║")
    print("║  ⏳ Pending:  anvar_taxi / demo123           ║")
    print("║  ❌ Rejected: malika_queen / demo123         ║")
    print("║  🏢 Corp:    xurshid_b2b / demo123          ║")
    print("║  💎 VIP:     alisher_shark / demo123         ║")
    print("╚══════════════════════════════════════════════╝")

    if STATS['media_files']:
        print(f"\n📁 Media files saved ({len(STATS['media_files'])}):")
        for f in STATS['media_files'][:10]:
            print(f"   → media/{f}")
        if len(STATS['media_files']) > 10:
            print(f"   ... and {len(STATS['media_files']) - 10} more")

    print("\n✅ RIDELUX seed completed successfully!")


if __name__ == '__main__':
    run()
