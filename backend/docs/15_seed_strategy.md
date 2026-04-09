# RIDELUX — Seed Strategy (v2.0)

## Umumiy ko'rinish

`seed_extended.py` — bu RIDELUX platformasi uchun professional demo data generator.
U barcha asosiy entitylarni yaratadi va ular orasidagi bog'lanishlarni to'g'ri sozlaydi.

## Seed nima yaratadi?

| # | Entity              | Soni    | Izoh                                    |
|---|---------------------|---------|------------------------------------------|
| 1 | Users               | ~15     | Admin, Staff, KYC approved/pending/rejected, Corporate, VIP |
| 2 | KYC Profiles        | ~13     | Har bir userga passport, license, selfie hujjatlari         |
| 3 | Payment Methods     | ~20     | Uzcard, Humo, Visa, Mastercard                              |
| 4 | Loyalty Tiers       | 4       | Bronze, Silver, Gold, Platinum                              |
| 5 | Loyalty Accounts    | ~13     | Har bir userga loyalty account                              |
| 6 | Insurance Plans     | 4       | Basic, Standard, Premium, Elite                             |
| 7 | Promo Codes         | 4       | RIDELUX10, WELCOME25, VIP50K, SPRING2026                    |
| 8 | Car Models          | 6+      | BMW, Mercedes, Chevrolet, Toyota (kengaytirish mumkin)      |
| 9 | Car Units           | ~18     | Har bir modeldan 2-4 ta unit                                |
| 10| Car Images          | ~30     | 5 slot per model (card_main, detail_bg, gallery x3)         |
| 11| Bookings            | ~30     | Turli statuslar: pending, confirmed, active, completed...   |
| 12| Payment Transactions| ~20     | initiated, paid, failed, refunded                           |
| 13| Billing Invoices    | ~15     | Faqat paid tranzaksiyalar uchun                             |
| 14| Payment Receipts    | ~15     | Invoice bilan 1:1                                           |
| 15| Notifications       | ~30     | KYC, booking, payment, system turlari                       |
| 16| Reviews             | ~15     | Approved userlardan                                         |
| 17| Favorites           | ~15     | Random tanlov                                               |
| 18| Booking Insurance   | ~10     | Confirmed/Active/Completed bookinglar uchun                 |
| 19| Fines               | ~5      | Completed bookinglarning 30% da                             |

## Media fayllar qayerga saqlanadi?

```
media/
├── avatars/                    ← User avatar rasmlari
│   └── avatar_{username}.webp
├── documents/
│   ├── passports/              ← User passport rasmlari
│   │   └── pp_{username}.webp
│   └── licenses/               ← User haydovchilik guvohnomasi
│       └── dl_{username}.webp
├── kyc/
│   ├── passports/
│   │   ├── front/              ← KYC passport old tomoni
│   │   │   └── pf_{username}.webp
│   │   └── back/               ← KYC passport orqa tomoni
│   │       └── pb_{username}.webp
│   ├── licenses/               ← KYC haydovchilik guvohnomasi
│   │   └── lic_{username}.webp
│   └── selfies/                ← KYC selfie with document
│       └── selfie_{username}.webp
└── cars/
    └── gallery/                ← Mashina rasmlari
        └── {model}__{slot}.webp
```

## Qayta ishga tushirish logikasi

### Incremental (default)
```bash
python scripts/seed_extended.py
```
- `get_or_create` ishlatadi — mavjud objektlarni o'tkazib yuboradi
- Xavfsiz, qayta ishga tushirsa tizim sinmaydi
- Yangi userlar/bookinglar qo'shilmaydi agar mavjud bo'lsa

### Fresh (--fresh yoki --reset)
```bash
python scripts/seed_extended.py --fresh
python scripts/seed_extended.py --reset
```
- Barcha seeded datani o'chiradi (users, bookings, payments, KYC, etc.)
- Keyin boshidan yaratadi
- **Ogohlantirish**: Barcha mavjud ma'lumotlar yo'qoladi!

## Demo accountlar

| Role     | Username       | Password  | KYC Status | Loyalty   |
|----------|----------------|-----------|------------|-----------|
| 👑 Admin | `admin`        | admin123  | —          | —         |
| 🔧 Staff | `staff_mod`    | staff123  | —          | —         |
| ✅ User  | `jamshid_car`  | demo123   | Approved   | Silver    |
| ✅ User  | `madina.lux`   | demo123   | Approved   | Silver    |
| ✅ User  | `sardor_88`    | demo123   | Approved   | Bronze    |
| ⏳ Pending| `anvar_taxi`  | demo123   | Submitted  | Bronze    |
| ⏳ Review | `nodir.dev`   | demo123   | Under Review| Bronze   |
| ❌ Rejected| `malika_queen`| demo123  | Rejected   | —         |
| 🆕 New   | `feruza_lux`   | demo123   | Draft      | Bronze    |
| 🏢 Corp  | `xurshid_b2b`  | demo123   | Approved   | Bronze    |
| 💎 VIP   | `alisher_shark`| demo123   | Approved   | Platinum  |
| 🥇 Gold  | `bekzod_premium`| demo123  | Approved   | Gold      |

## Booking statuslar

- `pending` — Admin tasdig'ini kutmoqda
- `payment_pending` — To'lov kutilmoqda
- `confirmed` — Tasdiqlangan
- `active` — Hozir ijarada
- `completed` — Yakunlangan
- `cancelled` — Bekor qilingan
- `rejected` — Admin rad etgan
- `failed` — To'lov muvaffaqiyatsiz

## Payment statuslar

- `initiated` — Boshlangan
- `otp_pending` — OTP kutilmoqda
- `authorized` — Avtorizatsiya qilingan
- `paid` — To'langan
- `failed` — Muvaffaqiyatsiz
- `refunded` — Qaytarilgan

## Texnik talablar

- **Pillow** kutubxonasi kerak (avatar va hujjat rasmlari uchun)
- Pillow yo'q bo'lsa, seed ishlaydi lekin rasmlar yaratilmaydi
- `random.seed(42)` — deterministic natijalar (qayta ishlatishda bir xil)
- Barcha DB path lar real mavjud fayllarga ishora qiladi
