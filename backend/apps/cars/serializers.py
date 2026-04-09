from rest_framework import serializers
from .models import Car, CarImage, CarModel, Amenity, MaintenanceRecord
from apps.reviews.models import Review
from apps.districts.serializers import DistrictSerializer

class CarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = ['id', 'image', 'slot', 'sort_order']

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ['id', 'name', 'code', 'icon_name']

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'user_name', 'user_avatar', 'rating', 'comment', 'created_at']

    def get_user_avatar(self, obj):
        return f"https://i.pravatar.cc/150?u={obj.user.id}"

class CarModelSerializer(serializers.ModelSerializer):
    media = serializers.SerializerMethodField()
    daily_price = serializers.DecimalField(source='base_daily_price', max_digits=12, decimal_places=2, read_only=True)
    model = serializers.CharField(source='model_name', read_only=True)
    unit_count = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    year = serializers.SerializerMethodField()
    available_districts = serializers.SerializerMethodField()
    slug = serializers.SerializerMethodField()
    amenities = AmenitySerializer(many=True, read_only=True)
    images = CarImageSerializer(many=True, read_only=True)

    class Meta:
        model = CarModel
        fields = [
            'id', 'brand', 'model', 'category', 'model_group', 'slug',
            'daily_price', 'short_tagline', 'media', 'transmission', 
            'fuel_type', 'seats', 'unit_count', 'rating', 'review_count',
            'year', 'available_districts', 'allows_chauffeur', 'amenities',
            'images', 'power', 'top_speed', 'acceleration', 
            'fuel_consumption', 'engine_type', 'drive_type', 'cargo_capacity',
            'rear_title', 'rear_description', 'interior_title', 'interior_description'
        ]

    def get_slug(self, obj):
        unit = obj.units.filter(status='available').first() or obj.units.first()
        return unit.slug if unit else None

    def get_unit_count(self, obj):
        return obj.units.filter(status='available').count()

    def get_rating(self, obj):
        from django.db.models import Avg
        val = obj.units.aggregate(Avg('rating'))['rating__avg']
        return round(val, 1) if val else 4.5

    def get_review_count(self, obj):
        from django.db.models import Sum
        val = obj.units.aggregate(Sum('review_count'))['review_count__sum']
        return val if val else 0

    def get_year(self, obj):
        from django.db.models import Max
        val = obj.units.aggregate(Max('year'))['year__max']
        return val if val else 2024

    def get_available_districts(self, obj):
        return list(obj.units.values_list('district_id', flat=True).distinct())

    def get_media(self, obj):
        request = self.context.get('request')
        images = obj.images.filter(is_active=True).order_by('sort_order')
        media_data = {"gallery": []}
        
        main_img_url = None
        for img in images:
            img_url = img.image.url
            if request:
                img_url = request.build_absolute_uri(img_url)
            
            if img.slot == 'card_main':
                main_img_url = img_url
            
            # Har bir rasm o'zining slot nomi bilan topilsin
            media_data[img.slot] = img_url
            
            # Galereya massivida ham saqlaymiz
            if img.slot.startswith('gallery_'):
                media_data["gallery"].append({"slot": img.slot, "url": img_url})

        # Fallback: barcha kerakli slotlarni card_main bilan to'ldiramiz
        for slot in ['card_main', 'detail_background', 'gallery_front', 'gallery_interior', 'gallery_rear']:
            if not media_data.get(slot):
                media_data[slot] = main_img_url
        
        return media_data

class CarSerializer(serializers.ModelSerializer):
    district_info = DistrictSerializer(source='district', read_only=True)
    main_image = serializers.SerializerMethodField()
    dynamic_price = serializers.DecimalField(source='get_dynamic_price', max_digits=12, decimal_places=2, read_only=True)
    dynamic_price_details = serializers.SerializerMethodField()
    model_info = CarModelSerializer(read_only=True)
    media = serializers.SerializerMethodField()
    amenities = AmenitySerializer(source='model_info.amenities', many=True, read_only=True)
    
    # Model ma'lumotlarini qulaylik uchun tekis qilib chiqaramiz (Flattening)
    brand = serializers.CharField(source='model_info.brand', read_only=True)
    model = serializers.CharField(source='model_info.model_name', read_only=True)
    category = serializers.CharField(source='model_info.category', read_only=True)
    transmission = serializers.CharField(source='model_info.transmission', read_only=True)
    fuel_type = serializers.CharField(source='model_info.fuel_type', read_only=True)
    seats = serializers.IntegerField(source='model_info.seats', read_only=True)
    model_group = serializers.CharField(source='model_info.model_group', read_only=True)
    
    short_tagline = serializers.CharField(source='model_info.short_tagline', read_only=True)
    short_description = serializers.CharField(source='model_info.short_description', read_only=True)
    detail_title = serializers.CharField(source='model_info.detail_title', read_only=True)
    detail_summary = serializers.CharField(source='model_info.detail_summary', read_only=True)
    
    # New Technical Specs (Flattened)
    power = serializers.IntegerField(source='model_info.power', read_only=True)
    top_speed = serializers.IntegerField(source='model_info.top_speed', read_only=True)
    acceleration = serializers.CharField(source='model_info.acceleration', read_only=True)
    fuel_consumption = serializers.CharField(source='model_info.fuel_consumption', read_only=True)
    engine_type = serializers.CharField(source='model_info.engine_type', read_only=True)
    drive_type = serializers.CharField(source='model_info.drive_type', read_only=True)
    cargo_capacity = serializers.CharField(source='model_info.cargo_capacity', read_only=True)
    
    # New Marketing Content (Flattened)
    rear_title = serializers.CharField(source='model_info.rear_title', read_only=True)
    rear_description = serializers.CharField(source='model_info.rear_description', read_only=True)
    interior_title = serializers.CharField(source='model_info.interior_title', read_only=True)
    interior_description = serializers.CharField(source='model_info.interior_description', read_only=True)

    same_model_units = serializers.SerializerMethodField()
    reviews = ReviewSerializer(many=True, read_only=True)
    
    class Meta:
        model = Car
        fields = '__all__'

    def get_main_image(self, obj):
        return obj.get_image_url

    def get_same_model_units(self, obj):
        """Ushbu modelga tegishli boshqa barcha unitlarni qaytaradi"""
        units = Car.objects.filter(model_info=obj.model_info).exclude(id=obj.id)
        data = []
        for u in units:
            data.append({
                "id": u.id,
                "color_name": u.color_name,
                "color_hex": u.color_hex,
                "plate_number": u.plate_number,
                "card_main": self.get_media(u).get('card_main')
            })
        return data

    def get_media(self, obj):
        request = self.context.get('request')
        # Rasmlarni car_model orqali olamiz
        images = obj.model_info.images.filter(is_active=True).order_by('sort_order')
        
        media_data = {"gallery": []}
        media_roles = ['card_main', 'detail_main', 'detail_background', 'compare_thumb', 'booking_cover', 'admin_thumb']
        for role in media_roles:
            media_data[role] = None

        for img in images:
            img_url = img.image.url
            if request:
                img_url = request.build_absolute_uri(img_url)
            
            # Har bir rasm o'zining slot nomi bilan topilsin (masalan: gallery_front, detail_background)
            media_data[img.slot] = img_url
            
            # Shuningdek, galereya massivida ham saqlaymiz (eski kodlar uchun)
            if img.slot.startswith('gallery_'):
                media_data["gallery"].append({"slot": img.slot, "url": img_url})
        
        # Fallback logic: agar ba'zi slotlar bo'sh bo'lsa, card_main bilan to'ldiramiz
        main_img_url = obj.get_image_url
        if request and main_img_url and not main_img_url.startswith('http'):
            main_img_url = request.build_absolute_uri(main_img_url)
        
        for slot in ['card_main', 'detail_background', 'gallery_front', 'gallery_interior', 'gallery_rear']:
            if not media_data.get(slot):
                media_data[slot] = main_img_url
                
        return media_data

    def get_dynamic_price_details(self, obj):
        from apps.pricing.engine import PriceEngine
        from datetime import datetime, timedelta
        import logging
        
        # Use query params for dates if provided, or default to tomorrow
        request = self.context.get('request')
        start_date_str = request.query_params.get('start_date') if request else None
        end_date_str = request.query_params.get('end_date') if request else None
        
        try:
            if start_date_str:
                from django.utils.dateparse import parse_date
                start_date = parse_date(start_date_str) or (datetime.now().date() + timedelta(days=1))
            else:
                start_date = datetime.now().date() + timedelta(days=1)
                
            if end_date_str:
                from django.utils.dateparse import parse_date
                end_date = parse_date(end_date_str) or (start_date + timedelta(days=1))
            else:
                end_date = start_date + timedelta(days=1)
                
            engine = PriceEngine(obj, start_date, end_date)
            return engine.calculate()
        except Exception as e:
            logging.error(f"Price engine error: {e}")
            return None

class MaintenanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceRecord
        fields = '__all__'
