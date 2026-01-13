# Deployment Guide - Leapcell

Panduan lengkap deploy aplikasi Library ke Leapcell.

## Prasyarat

1. ✅ Akun GitHub (repo sudah di-push)
2. ✅ Akun Leapcell ([leapcell.io](https://leapcell.io))
3. ✅ Database Online (Neon/Supabase/Aiven) - Anda sudah punya
4. ✅ Akun Cloudinary (untuk upload gambar)

---

## 1. Push ke GitHub

```bash
# Di folder library (root)
git add .
git commit -m "Initial commit: Library monorepo with Docker"
git branch -M main
git remote add origin https://github.com/USERNAME/library-monorepo.git
git push -u origin main
```

**PENTING:** Pastikan file `.env` sudah masuk `.gitignore`!

---

## 2. Deploy Backend di Leapcell

### A. Buat Service Baru

1. Login ke dashboard Leapcell
2. Klik **"New Project"** atau **"Deploy"**
3. Pilih **"Import from GitHub"**
4. Pilih repository `library-monorepo`

### B. Konfigurasi Backend

- **Service Name:** `library-backend`
- **Root Directory:** `library-be` ⚠️ PENTING!
- **Runtime:** Pilih "Docker" atau "Bun" (jika ada)
- **Build Command:** (Kosongkan atau `bun install`)
- **Start Command:** `bun run start`
- **Port:** `3000`

### C. Environment Variables

Klik **"Environment Variables"** dan masukkan:

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/dbname
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Cara dapat nilai:**

- `DATABASE_URL`: Copy dari dashboard Neon/Supabase Anda
- Cloudinary: Dari dashboard Cloudinary → Settings → API Keys

### D. Deploy

Klik **"Deploy"**. Tunggu 2-5 menit.

Setelah selesai, Anda akan dapat URL seperti:

```
https://library-backend-xxx.leapcell.app
```

Test dengan:

```bash
curl https://library-backend-xxx.leapcell.app/health
```

---

## 3. Deploy Frontend di Leapcell

### A. Buat Service Baru (Lagi)

Ulangi langkah di atas, tapi kali ini untuk Frontend.

### B. Konfigurasi Frontend

- **Service Name:** `library-frontend`
- **Root Directory:** `library-fe` ⚠️ PENTING!
- **Framework Preset:** Pilih "Vite" atau "React"
- **Build Command:** `npm run build` (otomatis terdeteksi)
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### C. Environment Variables (Frontend)

```env
VITE_API_URL=https://library-backend-xxx.leapcell.app
```

Ganti `xxx` dengan URL backend Anda yang sudah dideploy di langkah 2.

### D. Deploy

Klik **"Deploy"**.

Setelah selesai, Anda akan dapat URL seperti:

```
https://library-frontend-yyy.leapcell.app
```

---

## 4. Setup Database (Migrasi)

Setelah backend deploy, Anda perlu menjalankan migrasi database.

### Opsi A: Dari Lokal (Recommended)

```bash
cd library-be

# Pastikan DATABASE_URL di .env mengarah ke DB production
# Atau export manual:
export DATABASE_URL="postgresql://user:pass@production-host:5432/dbname"

# Jalankan migrasi
bun run drizzle-kit push
```

### Opsi B: Dari Leapcell Console (Jika Ada)

Beberapa platform menyediakan console/shell. Cek dokumentasi Leapcell.

---

## 5. Testing Production

### Backend

```bash
# Health check
curl https://library-backend-xxx.leapcell.app/health

# Test API
curl https://library-backend-xxx.leapcell.app/api/users
```

### Frontend

Buka browser: `https://library-frontend-yyy.leapcell.app`

---

## 6. Custom Domain (Opsional)

Jika Anda punya domain (misal: `library.myuniv.ac.id`):

1. Di Leapcell dashboard, pilih service → **Settings** → **Domains**
2. Tambahkan custom domain
3. Update DNS di registrar domain Anda:
   ```
   Type: CNAME
   Name: library (atau @)
   Value: library-frontend-yyy.leapcell.app
   ```

---

## Troubleshooting

### Backend tidak bisa connect ke Database

- Cek `DATABASE_URL` di Environment Variables
- Pastikan IP Leapcell tidak diblokir oleh firewall DB (whitelist `0.0.0.0/0` untuk testing)

### Frontend tidak bisa fetch API

- Cek `VITE_API_URL` sudah benar
- Pastikan CORS sudah diaktifkan di backend (sudah ada di `src/index.ts`)

### Build Failed

- Cek log error di dashboard Leapcell
- Pastikan `Root Directory` sudah benar (`library-be` atau `library-fe`)

---

## Update Aplikasi

Setiap kali Anda push ke GitHub branch `main`, Leapcell akan otomatis rebuild dan redeploy (jika auto-deploy diaktifkan).

```bash
git add .
git commit -m "Update feature X"
git push
```

Tunggu 2-5 menit, aplikasi akan update otomatis.

---

## Monitoring

- **Logs:** Dashboard Leapcell → Service → Logs
- **Metrics:** Dashboard Leapcell → Service → Metrics (CPU, RAM, Request)
- **Database:** Dashboard Neon/Supabase untuk monitoring query

---

**Selamat! Aplikasi Anda sudah live di internet! 🎉**
