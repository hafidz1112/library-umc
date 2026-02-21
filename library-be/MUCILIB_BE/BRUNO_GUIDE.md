# Panduan Flow API MUCILIB (Bruno/Postman)

File ini berisi daftar URL dan Body Request yang bisa Anda salin langsung ke aplikasi Bruno atau Postman.

## 1. Flow Peminjaman Buku (Loan Flow)

### Langkah 1: Member Mengajukan Pinjaman

**Member** memilih buku yang ingin dipinjam.

- **Method:** `POST`
- **URL:** `{{baseUrl}}/loans/request`
- **Headers:** `Authorization: Bearer <TOKEN_MEMBER>`
- **Body (JSON):**

```json
{
  "itemId": "ID_COPY_BUKU_INI"
}
```

_Hasil: Anda akan mendapatkan `token` (untuk QR) dan `requestId`._

---

### Langkah 2: Admin Verifikasi Token Scan

**Admin/Staff** melakukan scan QR code (token) yang dibawa member.

- **Method:** `GET`
- **URL:** `{{baseUrl}}/loans/verify/TOKEN_DARI_LANGKAH_1`
- **Headers:** `Authorization: Bearer <TOKEN_ADMIN_STAFF>`
- **Body:** `None`

---

### Langkah 3: Admin Menyetujui Pinjaman

Setelah fisik buku diperiksa, **Admin/Staff** menyetujui peminjaman.

- **Method:** `POST`
- **URL:** `{{baseUrl}}/loans/ID_REQUEST_DARI_LANGKAH_1/approve`
- **Headers:** `Authorization: Bearer <TOKEN_ADMIN_STAFF>`
- **Body:** `None`

---

### Langkah 4: Admin Menandai Buku Kembali

Saat member mengembalikan buku, **Admin/Staff** memproses pengembalian.

- **Method:** `POST`
- **URL:** `{{baseUrl}}/loans/ID_LOAN_INI/return`
- **Headers:** `Authorization: Bearer <TOKEN_ADMIN_STAFF>`
- **Body:** `None`

---

## 2. Flow Pengiriman Notifikasi (Notification Flow)

### Kirim Notifikasi Denda (Fine)

- **Method:** `POST`
- **URL:** `{{baseUrl}}/notification/send-fines`
- **Headers:** `Authorization: Bearer <TOKEN_ADMIN_STAFF>`
- **Body (JSON):**

```json
{
  "email": "user@example.com",
  "name": "Nama Member",
  "amount": 5000,
  "bookTitle": "Judul Buku"
}
```

---

### Kirim Notifikasi Pengingat Pinjaman (Loan Reminder)

- **Method:** `POST`
- **URL:** `{{baseUrl}}/notification/send-loans`
- **Headers:** `Authorization: Bearer <TOKEN_ADMIN_STAFF>`
- **Body (JSON):**

```json
{
  "email": "user@example.com",
  "name": "Nama Member",
  "bookTitle": "Judul Buku",
  "tanggalPengembalian": "2024-03-01"
}
```

## Tips Bruno:

1. Gunakan **Environment Variables** di Bruno untuk menyimpan `baseUrl` (Contoh: `http://localhost:4000/api`).
2. Masukkan token ke bagian **Auth -> Bearer Token** di setiap request.
