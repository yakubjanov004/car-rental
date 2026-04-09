from django.db import models
from django.utils.text import slugify
from apps.districts.models import District
from decimal import Decimal


class Amenity(models.Model):
    name = models.CharField(max_length=100, help_text="Masalan: Panorama")
    code = models.SlugField(unique=True, help_text="Masalan: panorama")
    icon_name = models.CharField(max_length=50, blank=True, help_text="Lucide icon name")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Qulaylik"
        verbose_name_plural = "Qulayliklar"


class CarModel(models.Model):
    """Mashinaning umumiy modeli (Brand, Model, Rasmlar va h.k.)"""
    brand = models.CharField(max_length=50)
    model_name = models.CharField(max_length=50)
    category = models.CharField(max_length=50, default='sedan')
    model_group = models.SlugField(max_length=100, unique=True, help_text="Masalan: chevrolet-spark")
    
    # Marketing Content (Modelga tegishli)
    short_tagline = models.CharField(max_length=255, null=True, blank=True)
    short_description = models.TextField(null=True, blank=True)
    detail_title = models.CharField(max_length=255, null=True, blank=True)
    detail_summary = models.TextField(null=True, blank=True)
    
    # Umumiy texnik xususiyatlar
    power = models.PositiveIntegerField(null=True, blank=True, help_text="Ot kuchi (HP/OT)")
    top_speed = models.PositiveIntegerField(null=True, blank=True, help_text="Maksimal tezlik (km/h)")
    acceleration = models.CharField(max_length=50, null=True, blank=True, help_text="0-100 tezlanish (s)")
    fuel_consumption = models.CharField(max_length=50, null=True, blank=True, help_text="Yoqilg'i sarfi (L/100km or kWh/100km)")
    engine_type = models.CharField(max_length=100, null=True, blank=True, help_text="Dvigatel turi (masalan: V8 Biturbo)")
    drive_type = models.CharField(max_length=50, null=True, blank=True, help_text="Privod (masalan: AWD, RWD)")
    cargo_capacity = models.CharField(max_length=50, null=True, blank=True, help_text="Yukxona hajmi (masalan: 500 L)")

    FUEL_CHOICES = [('benzin', 'Benzin'), ('gaz', 'Gaz'), ('gibrid', 'Gibrid'), ('elektro', 'Elektro')]
    TRANSMISSION_CHOICES = [('manual', 'Manual'), ('automatic', 'Automatic')]
    transmission = models.CharField(max_length=20, choices=TRANSMISSION_CHOICES, default='automatic')
    fuel_type = models.CharField(max_length=20, choices=FUEL_CHOICES, default='benzin')
    seats = models.PositiveIntegerField(default=5)
    
    # Marketing Content (Modelga tegishli - Extended)
    rear_title = models.CharField(max_length=255, null=True, blank=True)
    rear_description = models.TextField(null=True, blank=True)
    interior_title = models.CharField(max_length=255, null=True, blank=True)
    interior_description = models.TextField(null=True, blank=True)

    # Narxlar (Model uchun bazaviy narx)
    base_daily_price = models.DecimalField(max_digits=10, decimal_places=2)
    base_deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Chauffeur Service
    allows_chauffeur = models.BooleanField(default=False, help_text="Haydovchi bilan xizmat ko'rsatish mumkinmi?")
    

    # Features & Amenities
    amenities = models.ManyToManyField(Amenity, related_name='car_models', blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-id']

    def __str__(self):
        return f"{self.brand} {self.model_name}"


class Car(models.Model):
    """Aniq bir fizik mashina (Unit)"""
    model_info = models.ForeignKey(CarModel, on_delete=models.CASCADE, related_name='units')
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='cars')
    
    # Unitga xos ma'lumotlar
    inventory_code = models.CharField(max_length=50, unique=True, db_index=True)
    plate_number = models.CharField(max_length=20, unique=True, db_index=True)
    color_name = models.CharField(max_length=50)
    color_hex = models.CharField(max_length=10)
    year = models.PositiveIntegerField()
    
    # Individual narx (Modeldagi narxdan farq qilishi mumkin)
    daily_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    deposit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    # MODIFIED: main_image olib tashlandi, diskni tejash uchun modeldan o'qiydi
    
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('rented', 'Rented'),
        ('maintenance', 'Maintenance'),
        ('hidden', 'Hidden')
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    
    rating = models.FloatField(default=0.0)
    review_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-id']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.model_info.brand}-{self.model_info.model_name}-{self.inventory_code}")
        
        # Agar individual narx ko'rsatilmagan bo'lsa, modelning narxini oladi
        if not self.daily_price:
            self.daily_price = self.model_info.base_daily_price
        if not self.deposit:
            self.deposit = self.model_info.base_deposit
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.model_info.brand} {self.model_info.model_name} ({self.plate_number})"

    @property
    def get_image_url(self):
        """Modelga biriktirilgan asosiy rasmni (card_main) dinamik ravishda olib beradi"""
        main_img = self.model_info.images.filter(slot='card_main', is_active=True).first()
        if main_img:
            return main_img.image.url
        return None

    @property
    def get_dynamic_price(self):
        from django.utils import timezone
        now = timezone.now()
        price = self.daily_price
        if now.weekday() in [4, 5, 6]:
            price *= Decimal('1.15')
        return price.quantize(Decimal('1.00'))


class CarImage(models.Model):
    """Rasmlar endi Modelga tegishli!"""
    car_model = models.ForeignKey(CarModel, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='cars/gallery/')
    slot = models.CharField(max_length=50, default='gallery_front')
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['sort_order']

    def __str__(self):
        return f"{self.car_model.brand} {self.car_model.model_name} - {self.slot}"
class MaintenanceRecord(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='maintenances')
    reason = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_datetime']

    def __str__(self):
        return f"M: {self.car.plate_number} | {self.reason}"
