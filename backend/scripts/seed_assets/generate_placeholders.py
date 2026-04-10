"""
RENTAL CAR — Demo Asset Generator
Generates professional placeholder images for user avatars,
passport documents, driver licenses, and KYC selfies.
All images are deterministic and styled for demo purposes.
"""
import os
import io
from PIL import Image, ImageDraw, ImageFont

# ─── Paths ────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
USERS_DIR = os.path.join(SCRIPT_DIR, 'users')
KYC_DIR = os.path.join(SCRIPT_DIR, 'kyc')

os.makedirs(USERS_DIR, exist_ok=True)
os.makedirs(KYC_DIR, exist_ok=True)


def _get_font(size=24):
    """Try to load a TrueType font, fall back to default."""
    try:
        return ImageFont.truetype("arial.ttf", size)
    except (IOError, OSError):
        try:
            return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)
        except (IOError, OSError):
            return ImageFont.load_default()


def _draw_centered_text(draw, text, y, width, font, fill):
    """Draw text centered horizontally at a given y position."""
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    x = (width - text_width) // 2
    draw.text((x, y), text, fill=fill, font=font)


def generate_avatar(name, filename, bg_color=(30, 60, 120)):
    """Generate a professional circular-style avatar placeholder."""
    size = 400
    img = Image.new('RGB', (size, size), bg_color)
    draw = ImageDraw.Draw(img)

    # Draw circle background
    circle_color = (255, 255, 255, 40)
    draw.ellipse([40, 40, size - 40, size - 40], fill=(50, 90, 160))

    # Draw initials
    initials = ''.join(word[0].upper() for word in name.split()[:2])
    font_large = _get_font(96)
    _draw_centered_text(draw, initials, size // 2 - 50, size, font_large, (255, 255, 255))

    # Bottom label
    font_small = _get_font(18)
    _draw_centered_text(draw, "RENTAL CAR DEMO", size - 60, size, font_small, (180, 200, 240))

    filepath = os.path.join(USERS_DIR, filename)
    img.save(filepath, 'WEBP', quality=90)
    return filepath


def generate_passport_front(name, series, filename):
    """Generate a professional passport front placeholder."""
    w, h = 800, 560
    img = Image.new('RGB', (w, h), (250, 248, 240))
    draw = ImageDraw.Draw(img)

    # Header band
    draw.rectangle([0, 0, w, 80], fill=(0, 72, 153))
    font_title = _get_font(28)
    font_body = _get_font(20)
    font_small = _get_font(14)
    _draw_centered_text(draw, "O'ZBEKISTON RESPUBLIKASI PASPORTI", 25, w, font_title, (255, 255, 255))

    # Coat of arms placeholder
    draw.ellipse([340, 95, 460, 215], fill=(0, 72, 153), outline=(200, 170, 50), width=3)
    _draw_centered_text(draw, "🇺🇿", 130, w, font_title, (255, 255, 255))

    # Photo placeholder
    draw.rectangle([50, 250, 250, 480], fill=(220, 220, 220), outline=(150, 150, 150), width=2)
    _draw_centered_text(draw, "FOTO", 350, 300, font_body, (120, 120, 120))

    # Text fields
    y = 260
    fields = [
        ("Familiya / Surname", name.split()[-1].upper() if ' ' in name else name.upper()),
        ("Ism / Name", name.split()[0].upper()),
        ("Seriya / Series", series),
        ("Millatiy / Nationality", "O'ZBEKISTON"),
    ]
    for label, value in fields:
        draw.text((280, y), label, fill=(100, 100, 100), font=font_small)
        draw.text((280, y + 18), value, fill=(20, 20, 20), font=font_body)
        y += 52

    # Footer
    draw.rectangle([0, h - 40, w, h], fill=(0, 72, 153))
    _draw_centered_text(draw, "DEMO DOCUMENT — NOT VALID", h - 32, w, font_small, (255, 200, 200))

    filepath = os.path.join(KYC_DIR, filename)
    img.save(filepath, 'WEBP', quality=90)
    return filepath


def generate_passport_back(name, series, filename):
    """Generate passport back page placeholder."""
    w, h = 800, 560
    img = Image.new('RGB', (w, h), (250, 248, 240))
    draw = ImageDraw.Draw(img)

    # Header
    draw.rectangle([0, 0, w, 60], fill=(0, 72, 153))
    font_title = _get_font(22)
    font_body = _get_font(18)
    font_small = _get_font(14)
    font_mrz = _get_font(16)
    _draw_centered_text(draw, "PASSPORT — BACK PAGE", 15, w, font_title, (255, 255, 255))

    # Registration info
    y = 90
    fields = [
        ("Ro'yxatga olingan manzil", "Toshkent sh., Yunusobod tumani"),
        ("Berilgan sana", "15.03.2020"),
        ("Amal qilish muddati", "15.03.2030"),
        ("Kim tomonidan berilgan", "IIV Yunusobod tumani bo'limi"),
    ]
    for label, value in fields:
        draw.text((50, y), label, fill=(100, 100, 100), font=font_small)
        draw.text((50, y + 20), value, fill=(20, 20, 20), font=font_body)
        y += 55

    # MRZ zone
    draw.rectangle([0, h - 120, w, h], fill=(240, 240, 240))
    mrz_line1 = f"P<UZB{name.split()[-1].upper() if ' ' in name else name.upper()}<<{'<' * 20}"
    mrz_line2 = f"{series}{'<' * 5}UZB{'0' * 6}M{'0' * 6}{'<' * 14}{'0' * 2}"
    draw.text((30, h - 110), mrz_line1[:44], fill=(50, 50, 50), font=font_mrz)
    draw.text((30, h - 85), mrz_line2[:44], fill=(50, 50, 50), font=font_mrz)

    # Footer
    draw.rectangle([0, h - 30, w, h], fill=(0, 72, 153))
    _draw_centered_text(draw, "DEMO DOCUMENT — NOT VALID", h - 25, w, font_small, (255, 200, 200))

    filepath = os.path.join(KYC_DIR, filename)
    img.save(filepath, 'WEBP', quality=90)
    return filepath


def generate_license(name, license_num, category, filename):
    """Generate a driver's license placeholder."""
    w, h = 800, 500
    img = Image.new('RGB', (w, h), (245, 245, 250))
    draw = ImageDraw.Draw(img)

    # Top band
    draw.rectangle([0, 0, w, 70], fill=(180, 20, 20))
    font_title = _get_font(24)
    font_body = _get_font(18)
    font_small = _get_font(14)
    _draw_centered_text(draw, "HAYDOVCHILIK GUVOHNOMASI / DRIVER'S LICENSE", 20, w, font_title, (255, 255, 255))

    # Photo placeholder
    draw.rectangle([40, 100, 220, 320], fill=(220, 220, 220), outline=(150, 150, 150), width=2)
    _draw_centered_text(draw, "FOTO", 195, 260, font_body, (120, 120, 120))

    # Fields
    y = 100
    fields = [
        ("1. Familiya", name.split()[-1].upper() if ' ' in name else name.upper()),
        ("2. Ism", name.split()[0].upper()),
        ("3. Tug'ilgan sana", "01.01.1990"),
        ("5. Guvohnoma raqami", license_num),
        ("9. Toifalar", category),
    ]
    for label, value in fields:
        draw.text((260, y), label, fill=(100, 100, 100), font=font_small)
        draw.text((260, y + 18), value, fill=(20, 20, 20), font=font_body)
        y += 48

    # Barcode area
    draw.rectangle([40, 360, 760, 420], fill=(240, 240, 240))
    for i in range(0, 720, 4):
        bar_w = 1 if i % 8 == 0 else 2
        draw.rectangle([40 + i, 370, 40 + i + bar_w, 410], fill=(30, 30, 30))

    # Footer
    draw.rectangle([0, h - 35, w, h], fill=(180, 20, 20))
    _draw_centered_text(draw, "DEMO DOCUMENT — NOT VALID", h - 28, w, font_small, (255, 200, 200))

    filepath = os.path.join(KYC_DIR, filename)
    img.save(filepath, 'WEBP', quality=90)
    return filepath


def generate_selfie(name, filename):
    """Generate a selfie-with-document placeholder."""
    w, h = 600, 800
    img = Image.new('RGB', (w, h), (240, 235, 230))
    draw = ImageDraw.Draw(img)

    font_body = _get_font(22)
    font_small = _get_font(16)

    # Head silhouette (circle)
    draw.ellipse([200, 80, 400, 280], fill=(180, 160, 140))

    # Body silhouette
    draw.ellipse([150, 250, 450, 550], fill=(100, 100, 120))

    # Document in hand
    draw.rectangle([170, 420, 430, 580], fill=(250, 248, 240), outline=(150, 150, 150), width=2)
    _draw_centered_text(draw, "PASSPORT", 480, w, font_small, (100, 100, 100))

    # Name
    _draw_centered_text(draw, name, 620, w, font_body, (50, 50, 50))

    # Demo label
    draw.rectangle([0, h - 50, w, h], fill=(0, 72, 153))
    _draw_centered_text(draw, "DEMO SELFIE — NOT VALID", h - 40, w, font_small, (255, 200, 200))

    filepath = os.path.join(KYC_DIR, filename)
    img.save(filepath, 'WEBP', quality=90)
    return filepath


def generate_user_assets(username, full_name, passport_series, license_num, license_cat='B'):
    """Generate all image assets for a single demo user. Returns dict of paths."""
    safe = username.lower().replace(' ', '_')
    return {
        'avatar': generate_avatar(full_name, f"avatar_{safe}.webp"),
        'passport_front': generate_passport_front(full_name, passport_series, f"passport_front_{safe}.webp"),
        'passport_back': generate_passport_back(full_name, passport_series, f"passport_back_{safe}.webp"),
        'license': generate_license(full_name, license_num, license_cat, f"license_{safe}.webp"),
        'selfie': generate_selfie(full_name, f"selfie_{safe}.webp"),
    }


def to_content_file(filepath):
    """Read a file from disk and return a Django ContentFile."""
    from django.core.files.base import ContentFile
    with open(filepath, 'rb') as f:
        return ContentFile(f.read(), name=os.path.basename(filepath))


if __name__ == '__main__':
    # Quick test: generate a single set of assets
    assets = generate_user_assets('test_user', 'Jamshid Abduqodirov', 'AB1234567', 'AF9876543')
    for key, path in assets.items():
        print(f"  {key}: {path}")
    print("Done!")
