# 🚀 Library System Project Roadmap (3 Months)

Dokumen ini adalah panduan langkah demi langkah untuk menyelesaikan proyek Library Backend & Frontend dari tahap fondasi hingga production ready.

---

## 📅 Bulan 1: Backend Foundation & Core Features

**Fokus:** Membangun API yang kuat, aman, dan database yang solid menggunakan Express, Drizzle ORM, dan PostgreSQL.

### **Minggu 1: Setup & Authentication (Current)**

- [x] Setup Project (Express + TypeScript + Drizzle).
- [x] Design Database Schema (ERD).
- [ ] **Auth System:** Implementasi Google Auth dengan Better Auth.
- [ ] **Media Storage:** Setup Cloudinary untuk upload cover buku.
- **Materi:** Session vs JWT, Drizzle Relations, Multer.

### **Minggu 2: Master Data API**

- [ ] **CRUD Kategori:** Create, Read, Update, Delete kategori buku.
- [ ] **CRUD Buku (Collections):**
  - Integrasi dengan upload Cloudinary.
  - Relasi ke tabel Kategori.
- [ ] **CRUD Items:** Manajemen stok fisik buku (Barcode generation).
- **Materi:** REST API Standards, Zod Validation, HTTP Status Codes.

### **Minggu 3: Business Logic (Core)**

- [ ] **API Member:** Pendaftaran anggota (Mahasiswa/Dosen).
- [ ] **Fitur Peminjaman (Loans):**
  - Validasi stok buku.
  - Set tanggal pinjam & kembali.
  - `db.transaction()` untuk konsistensi data.
- [ ] **Fitur Pengembalian:**
  - Cek keterlambatan.
  - Hitung denda (Fines) otomatis.
- **Materi:** Date manipulation (`date-fns`), Database Transactions.

### **Minggu 4: Documentation & Testing**

- [ ] **API Documentation:** Setup Swagger UI (OpenAPI).
- [ ] **Testing:** Uji coba manual semua endpoint via Postman.
- [ ] **Optimization:** Indexing database query agar cepat.
- **Materi:** Swagger/OpenAPI Spec, Postman Collections.

---

## 📅 Bulan 2: Frontend Integration

**Fokus:** Membangun antarmuka Next.js yang responsif dan terintegrasi dengan Backend.

### **Minggu 5: UI Foundation & Auth**

- [ ] Setup Next.js App Router + Tailwind/Shadcn UI.
- [ ] **Halaman Login:** Integrasi "Sign in with Google" (Better Auth Client).
- [ ] **Layouting:** Sidebar, Navbar User vs Admin.
- **Materi:** React Server Components (RSC), Client Hooks (`useSession`).

### **Minggu 6: Katalog & Pencarian**

- [ ] **Halaman Katalog:** Grid view buku dengan gambar.
- [ ] **Detail Buku:** Menampilkan info buku + stok tersedia.
- [ ] **Fitur Search:** Pencarian live dengan Debounce.
- **Materi:** React Query (TanStack Query), Debouncing.

### **Minggu 7: Transaksi Frontend**

- [ ] **Form Peminjaman:** Admin memindai barcode / input NIM.
- [ ] **Form Pengembalian:** Hitung denda di UI jika telat.
- [ ] **CRUD Buku UI:** Form upload file cover buku.
- **Materi:** React Hook Form, Handling File Upload di React.

### **Minggu 8: Admin Dashboard**

- [ ] **Dashboard Home:** Ringkasan jumlah buku, peminjam aktif.
- [ ] **User Management:** Table list user, fitur Ban User (Plugin Admin).
- **Materi:** RBAC (Role Based Access Control) di Frontend.

---

## 📅 Bulan 3: Advanced Features & Launch

**Fokus:** Fitur tambahan, integrasi eksternal, dan deployment.

### **Minggu 9: Reporting & Analytics**

- [ ] **Laporan:** Download data peminjaman (Excel/PDF).
- [ ] **Grafik:** Chart statistik peminjaman bulanan.
- **Materi:** Chart.js / Recharts, Library ExcelJS.

### **Minggu 10: Integrasi Eksternal**

- [ ] **Validasi Mahasiswa:** Cek status aktif via API Kampus (Simulasi).
- [ ] **Notifikasi Email:** Reminder H-1 pengembalian buku.
- **Materi:** Nodemailer / Resend, Axios.

### **Minggu 11: Deployment**

- [ ] **Deploy Backend:** Railway / VPS / Render.
- [ ] **Deploy Frontend:** Vercel.
- [ ] **Database Cloud:** Neon / Supabase / Railway Postgres.
- [ ] **DNS Domain:** Setup domain `library.kampus.ac.id`.
- **Materi:** Environment Variables Production, CI/CD Basics.

### **Minggu 12: Launch & Maintenance**

- [ ] **Final Testing:** User Acceptance Test (UAT).
- [ ] **Bug Fixing:** Perbaikan isu yang ditemukan.
- [ ] **Launching!** 🚀

---

## 🎯 Target Minggu Ini (Week 1 Action Items)

1. **Selesaikan Auth:** Pastikan endpoint `/api/auth/*` bisa menerima login Google.
2. **Setup Upload:** Endpoint `/upload` bisa menerima file dan membalas dengan URL Cloudinary.
