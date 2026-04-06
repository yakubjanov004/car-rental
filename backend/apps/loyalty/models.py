from django.conf import settings
from django.db import models


class LoyaltyTier(models.Model):
    name = models.CharField(max_length=50)
    slug = models.SlugField(unique=True)
    min_points = models.PositiveIntegerField()
    max_points = models.PositiveIntegerField(null=True, blank=True)
    discount_percentage = models.DecimalField(max_digits=4, decimal_places=1, default=0)
    free_insurance_upgrade = models.BooleanField(default=False)
    priority_support = models.BooleanField(default=False)
    free_delivery = models.BooleanField(default=False)
    badge_color = models.CharField(max_length=20, default='#CD7F32')
    icon_emoji = models.CharField(max_length=5, default='B')

    class Meta:
        ordering = ['min_points']

    def __str__(self):
        return f"{self.name} ({self.min_points}+)"


class LoyaltyAccount(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='loyalty_account')
    points = models.PositiveIntegerField(default=0)
    lifetime_points = models.PositiveIntegerField(default=0)
    tier = models.ForeignKey(LoyaltyTier, on_delete=models.PROTECT, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def _update_tier(self):
        tier = LoyaltyTier.objects.filter(min_points__lte=self.lifetime_points).order_by('-min_points').first()
        if tier:
            self.tier = tier

    def add_points(self, amount, reason, booking=None):
        amount = max(0, int(amount))
        self.points += amount
        self.lifetime_points += amount
        self._update_tier()
        self.save()
        LoyaltyTransaction.objects.create(
            account=self,
            transaction_type='earn',
            points=amount,
            reason=reason,
            booking=booking,
            balance_after=self.points,
        )

    def redeem_points(self, amount, reason):
        amount = max(0, int(amount))
        if self.points < amount:
            raise ValueError('Insufficient points')
        self.points -= amount
        self.save(update_fields=['points', 'updated_at'])
        LoyaltyTransaction.objects.create(
            account=self,
            transaction_type='redeem',
            points=-amount,
            reason=reason,
            balance_after=self.points,
        )

    def __str__(self):
        return f"{self.user.username} - {self.points}"


class LoyaltyTransaction(models.Model):
    TYPE_CHOICES = [
        ('earn', 'Earn'),
        ('redeem', 'Redeem'),
        ('expire', 'Expire'),
        ('bonus', 'Bonus'),
        ('referral', 'Referral'),
        ('admin_adjust', 'Admin Adjust'),
    ]

    account = models.ForeignKey(LoyaltyAccount, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    points = models.IntegerField()
    reason = models.CharField(max_length=255)
    booking = models.ForeignKey('bookings.Booking', null=True, blank=True, on_delete=models.SET_NULL)
    balance_after = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_type} {self.points}"
