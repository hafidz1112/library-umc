# Penjelasan Arsitektur Docker Anda

Dokumen ini menjelaskan bagaimana setiap komponen dalam setup Docker Anda bekerja, mengapa mereka bisa saling berkomunikasi, dan mengapa setup ini siap untuk deployment modern.

---

## 1. Konsep Utama: Orkestrasi (Docker Compose)

File `docker-compose.yml` di root adalah "Dirigen" orkestra. Tanpa file ini, Anda harus menyalakan Backend, Frontend, dan Database satu per satu secara manual. File ini menyatukan semuanya dalam satu jaringan virtual.

### Bedah File `docker-compose.yml`

```yaml
services:
  # --- 1. SERVICE BACKEND ---
  backend:
    build:
      context: ./library-be # Cari resep (Dockerfile) di folder ini
      dockerfile: Dockerfile
    container_name: library_backend
    restart: always # Kalau crash, otomatis hidup lagi
    ports:
      - "3000:3000" # Buka Pintu: Laptop port 3000 -> Container port 3000
    env_file:
      - ./library-be/.env # !PENTING!: Baca password DB dari file .env di laptop Anda
        # Docker menyuntikkan isinya ke dalam container secara aman

  # --- 2. SERVICE FRONTEND ---
  frontend:
    build:
      context: ./library-fe # Cari resep (Dockerfile) di folder FE
      dockerfile: Dockerfile
    container_name: library_frontend
    ports:
      - "80:80" # Buka Pintu: Laptop port 80 (HTTP standar) -> Container port 80
    depends_on:
      - backend # Pastikan Backend hidup dulu baru Frontend nyala (opsional tapi bagus)

  # --- 3. SERVICE DB LOKAL (Opsional) ---
  postgres:
    image: postgres:16-alpine # Download image resmi Postgres versi 16 (kecil/alpine)
    # ... konfigurasi standard
```

**Mengapa DB Lokalnya Merah?**
Jika Anda melihat status _Exited_ atau merah di Docker Desktop untuk service `postgres`:

1.  Ini mungkin karena Anda **belum mengatur kredensial** (User/Pass/DB Name) di file `.env` untuk `postgres` (ia mencari variabel environment tapi kosong/default).
2.  **ATAU** Port 5432 di laptop Anda sudah terpakai oleh Postgres lain yang Anda install manual di Windows.
    **Solusi:** Tidak perlu panik. Anda menggunakan **Database Online (Cloud)**. Jadi kalau DB Lokal merah/mati, **Abaikan Saja**. Aplikasi Backend Anda tetap bisa jalan karena dia koneknya ke URL Cloud, bukan ke container postgres lokal ini.

---

## 2. Bedah Resep Backend (`library-be/Dockerfile`)

File ini memberitahu Docker cara "Memasak" aplikasi Backend Anda.

```dockerfile
# 1. Ambil Base Image
FROM oven/bun:1 AS base      # Kita pakai BUN (bukan Node) karena lebih cepat & support TS bawaan

WORKDIR /app                 # Set folder kerja di dalam container

# 2. Install Dependensi (Pintar)
COPY package.json bun.lock* ./   # Copy daftar belanjaan dulu
RUN bun install ...              # Install dependensi (Docker akan men-cache langkah ini biar cepat)

# 3. Masukkan Kode
COPY . .                     # Copy seluruh kode src/ ts/ dll ke dalam container

# 4. Jalankan
EXPOSE 3000                  # Beritahu bahwa aplikasi ini jalan di port 3000
CMD ["bun", "run", "dev"]    # Perintah start
```

**Kenapa bisa jalan?**
Karena Bun memiliki runtime TypeScript bawaan. Kita tidak perlu compile `tsc` ke JS dulu. Docker langsung menjalankan file `.ts` mentah-mentah. Sangat efisien untuk dev.

**Development vs Production Mode:**
Dockerfile ini menggunakan **Build Argument** `NODE_ENV` untuk switch antara mode development dan production:

```dockerfile
ARG NODE_ENV=development  # Default: development
```

**Cara Pakai:**

- **Lokal (Development):** `docker-compose up` → Otomatis pakai mode `dev` (dengan --watch)
- **Leapcell (Production):** Platform akan otomatis set `NODE_ENV=production` atau Anda bisa set manual di dashboard.

**Perbedaan:**
| Mode | Install Dependencies | CMD |
|------|---------------------|-----|
| Development | Semua (termasuk devDependencies) | `bun run dev` (hot reload) |
| Production | Hanya production deps | `bun run start` (stabil, hemat RAM) |

**Build Manual untuk Production:**
Jika ingin test production mode di lokal:

```bash
docker build --build-arg NODE_ENV=production -t library-be-prod ./library-be
docker run -p 3000:3000 --env-file ./library-be/.env library-be-prod
```

---

## 3. Bedah Resep Frontend (`library-fe/Dockerfile`)

Ini bagian paling menarik karena menggunakan teknik **Multi-Stage Build** (Masak di satu panci, sajikan di piring bersih).

```dockerfile
# --- TAHAP 1: KOKI (Builder) ---
FROM node:20-alpine AS builder
# ... install & copy source code ...
RUN npm run build
# Hasilnya adalah folder 'dist' yang berisi file HTML/CSS/JS statis
# (Browser tidak mengerti React, dia butuh file statis ini)

# --- TAHAP 2: PELAYAN (Server) ---
FROM nginx:alpine
# Kita membuang seluruh Node.js dan source code React yang berat.
# Kita GANTI dengan NGINX (Server super ringan, cuma 10-20MB).

COPY --from=builder /app/dist .  # Ambil folder 'dist' dari Tahap 1, taruh di piring Nginx
CMD ["nginx", ...]               # Sajikan ke browser
```

**Kenapa Frontend Docker berbeda dengan Local `npm run dev`?**

- **Lokal (`npm run dev`):** Menggunakan Vite Server. Berat, memakan memori, hot-reload aktif.
- **Docker (`nginx`):** Menggunakan Nginx. Sangat ringan, file statis beku (tidak bisa diedit), siap production. Ini mensimulasikan kondisi User saat membuka website asli.

---

## 4. Apakah Siap Deploy ke GitHub & Leapcell?

**Status: SIAP 95%.**

**Checklist sebelum Push:**

1.  **Environment Variable:** Pastikan file `.env` (berisi URL database rahasia) masuk ke `.gitignore`. **JANGAN PERNAH** push file `.env` ke GitHub.
    - _Cek:_ Buka `.gitignore` di `library-be`, pastikan ada tulisan `.env`.
2.  **Repo Structure:** Pastikan folder `.git` hanya ada di root `library`, bukan di dalam `library-be` atau `library-fe`.
3.  **Deploy Leapcell:**
    - Leapcell akan meminta "Environment Variables". Anda harus copy paste isi `.env` Anda (DATABASE_URL, CLOUDINARY_SECRET, dll) ke dashboard Leapcell secara manual. GitHub hanya menyimpan kode, Leapcell menyimpan rahasia.

**Kesimpulan:**
Struktur folder Anda sekarang sudah **Best Practice** untuk Monorepo modern. Anda bisa mendeploy Backend dan Frontend secara independen namun tetap dalam satu repository source code.
