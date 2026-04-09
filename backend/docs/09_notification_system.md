# Ridelux Notification System (Sprint 3)

## Arxitektura
RIDELUX bildirishnomalar tizimi **Event-Driven** (hodisaga asoslangan) arxitektura asosida qurilgan. Bu tizim foydalanuvchi va admin o'rtasidagi muloqotni avtomatlashtiradi.

### 1. Notification Modeli
`apps/users/models.py` faylida joyhazgan:
- `user`: Xabar egasi (admin_only bo'lmasa).
- `type`: Hodisa turi (booking_created, kyc_approved va hkz).
- `metadata`: JSON formatidagi qo'shimcha ma'lumotlar (booking_id, user_id).
- `admin_only`: Faqat adminlar uchun mo'ljallangan global xabarlar.

### 2. Hodisalar (Events)
Quyidagi hodisalar uchun avtomatlashtirilgan signallar sozlangan:

| Hodisa | Kimga | Trigger |
| :--- | :--- | :--- |
| `booking_created` | Admin | Yangi bron qilish amalga oshirilganda |
| `booking_confirmed`| User | Admin buyurtmani tasdiqlaganda |
| `booking_rejected` | User | Admin buyurtmani rad etganda (sababi bilan) |
| `kyc_submitted` | Admin | Foydalanuvchi hujjatlarini yuborganda |
| `kyc_approved` | User | Admin KYCni tasdiqlaganda |
| `kyc_rejected` | User | Admin KYCni rad etganda (sababi bilan) |

### 3. Utils (Yordamchi funksiyalar)
`apps/users/utils.py`:
- `send_notification(user, type, title, message, metadata)`: Foydalanuvchiga xabar yuborish.
- `notify_admins(type, title, message, metadata)`: Barcha adminlarga xabar yuborish.

---

## Maintenance Management (Texnik Xizmat)
Avtomobillarning mavjudligini (availability) boshqarish uchun yangi **MaintenanceRecord** tizimi joriy etildi.

### Imkoniyatlar:
- **Availability Override**: Admin mashinani ma'lum vaqt oralig'ida "Maintenance" holatiga o'tkaza oladi.
- **Overlap Protection**: Bron qilish logikasi ushbu vaqtni avtomatik ravishda "Band" deb hisoblaydi va foydalanuvchiga bron qilishga yo'l qo'ymaydi.
- **Admin UI**: Admin panelning "Flot" bo'limida har bir mashina uchun maintenance qo'shish tugmasi mavjud.

### Status Sync (Background Tasks)
`python manage.py sync_booking_statuses` komandasi orqali buyurtmalar holati vaqt o'tishi bilan avtomatik o'zgaradi:
- `Confirmed` -> `Active` (Ijara vaqti kelganda)
- `Active` -> `Completed` (Ijara vaqti tugaganda)
