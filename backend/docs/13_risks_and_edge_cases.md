# RISKS & EDGE CASES

Ushbu hujjat Ridelux platformasining barqarorligi va xavfsizligi bilan bog'liq bo'lgan asosiy xavf-hatarlar va ularni bartaraf etish choralarini o'z ichiga oladi.

## 1. Booking & Availability (Bron qilish)

### 1.1. Race Condition (Talashuv)
*   **Risk:** Ikki foydalanuvchi bir vaqtning o'zida bitta avtomobilni bir xil vaqtga bron qilishi.
*   **Yechim:** Database darajasida tranzaktsiyalar (`select_for_update`) va unique constraints (car + range) orqali bloklash. Hozirda backendda `overlapping` validation mavjud, yuqori yuklamalarda DB locking tavsiya etiladi.

### 1.2. Multiple Overlapping Maintenance
*   **Risk:** Admin avtomobilni xizmatga (maintenance) qo'ygan vaqtda mavjud bronlar bilan to'qnashuv.
*   **Yechim:** Maintenance yaratishda kelajakdagi 'confirmed' bronlar tekshiriladi va xatolik qaytariladi.

## 2. Payments (To'lovlar)

### 2.1. Expired OTP
*   **Risk:** Foydalanuvchi OTP kodini uzoq vaqt kiritmaydi.
*   **Yechim:** Tranzaktsiya statusi kutilayotgan holatda qoladi. Admin panelda "Stale Transactions" tozalash mexanizmi bo'lishi kerak.

### 2.2. Intentional Triple Payment
*   **Risk:** Internet uzilishi yoki foydalanuvchi xatosi sababli bir nechta tranzaktsiya yaratilishi.
*   **Yechim:** `idempotency-key` (masalan, booking_id + billing_attempt_id) orqali bir xil to'lovlarni bloklash.

## 3. KYC & Security (Shaxsni Tasdiqlash)

### 3.1. Document Forgery (Fake hujjatlar)
*   **Risk:** Foydalanuvchi boshqa shaxsning hujjatlarini yuklashi.
*   **Yechim:** Admin qo'lda tekshiradi. Kelajakda Biometrik (Face ID) tekshiruvini qo'shish tavsiya etiladi.

### 3.2. Sensitive Data Leak
*   **Risk:** Foydalanuvchi pasport ma'lumotlarining ochiq qolishi.
*   **Yechim:** Hujjatlarni saqlashda S3 Private bucketlar va vaqtinchalik URL'lar (`presigned urls`) ishlatish kerak.

## 4. Infrastructure & Scaling

### 4.1. Large Media Files
*   **Risk:** Car images va KYC hujjatlari server diskini to'ldirib yuborishi.
*   **Yechim:** Local disk o'rniga tashqi Storage (AWS S3, Google Cloud Storage) dan foydalanish.

### 4.2. Database N+1 queries
*   **Risk:** Foydalanuvchilar ko'paygani sari serverning sekinlashishi.
*   **Yechim:** `select_related` va `prefetch_related` doimiy ravishda monitoring qilinishi kerak (Sentry yoki Django Silk).

---
*RIDELUX PRODUCTION READINESS DOCUMENT*
