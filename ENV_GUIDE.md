# Environment Variables Guide

Panduan lengkap mengelola environment variables untuk development dan production.

---

## 📋 Konsep Dasar

Environment variables adalah **konfigurasi rahasia** yang berbeda antara:

- **Development** (laptop Anda)
- **Production** (server Leapcell)

**ATURAN EMAS:** File `.env` **JANGAN PERNAH** di-commit ke GitHub!

---

## 🗂️ Struktur File

```
library/
├── library-be/
│   ├── .env              ← File RAHASIA (di .gitignore)
│   └── .env.example      ← Template (boleh di-commit)
├── library-fe/
│   ├── .env              ← File RAHASIA (di .gitignore)
│   └── .env.example      ← Template (boleh di-commit)
└── .gitignore            ← Proteksi .env
```

---

## 🔧 Setup Development (Lokal)

### Backend

1. **Copy template:**

   ```bash
   cd library-be
   cp .env.example .env
   ```

2. **Edit `.env` dengan nilai sebenarnya:**

   ```env
   DATABASE_URL=postgresql://user:pass@neon.tech:5432/library_dev
   BETTER_AUTH_SECRET=generate_random_32_chars_here
   BETTER_AUTH_URL=http://localhost:3000
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=123456789
   CLOUDINARY_API_SECRET=abcdefghijk
   NODE_ENV=development
   ```

3. **Jalankan:**
   ```bash
   bun run dev
   ```

### Frontend

1. **Copy template:**

   ```bash
   cd library-fe
   cp .env.example .env
   ```

2. **Edit `.env`:**

   ```env
   VITE_API_URL=http://localhost:3000
   VITE_BETTER_AUTH_URL=http://localhost:3000
   ```

3. **Jalankan:**
   ```bash
   npm run dev
   ```

---

## 🚀 Setup Production (Leapcell)

### Backend

Di dashboard Leapcell → Service `library-backend` → **Environment Variables**, tambahkan:

| Variable                | Value                                                | Keterangan                             |
| ----------------------- | ---------------------------------------------------- | -------------------------------------- |
| `NODE_ENV`              | `production`                                         | Wajib untuk production mode            |
| `DATABASE_URL`          | `postgresql://user:pass@neon.tech:5432/library_prod` | URL database production                |
| `BETTER_AUTH_SECRET`    | `random_32_chars`                                    | Generate baru (jangan sama dengan dev) |
| `BETTER_AUTH_URL`       | `https://library-backend-xxx.leapcell.app`           | URL backend production                 |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud`                                         | Sama dengan dev (atau beda cloud)      |
| `CLOUDINARY_API_KEY`    | `123456`                                             | Dari dashboard Cloudinary              |
| `CLOUDINARY_API_SECRET` | `abcdef`                                             | Dari dashboard Cloudinary              |
| `GOOGLE_CLIENT_ID`      | `xxx.apps.googleusercontent.com`                     | Jika pakai Google OAuth                |
| `GOOGLE_CLIENT_SECRET`  | `GOCSPX-xxx`                                         | Jika pakai Google OAuth                |

### Frontend

Di dashboard Leapcell → Service `library-frontend` → **Environment Variables**:

| Variable                     | Value                                      |
| ---------------------------- | ------------------------------------------ |
| `VITE_API_URL`               | `https://library-backend-xxx.leapcell.app` |
| `VITE_BETTER_AUTH_URL`       | `https://library-backend-xxx.leapcell.app` |
| `VITE_CLOUDINARY_CLOUD_NAME` | `your_cloud`                               |

**Catatan:** Ganti `xxx` dengan URL backend Anda yang sebenarnya.

---

## 🔐 Cara Generate Secret Keys

### BETTER_AUTH_SECRET (32+ karakter random)

**Opsi 1 - Bun/Node:**

```bash
bun -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Opsi 2 - Online:**

```bash
openssl rand -hex 32
```

**Opsi 3 - Manual:**
Ketik random 32 karakter (huruf + angka + simbol).

---

## ⚠️ Perbedaan Development vs Production

| Variabel          | Development             | Production                         |
| ----------------- | ----------------------- | ---------------------------------- |
| `DATABASE_URL`    | DB lokal/dev            | DB production (Neon/Supabase)      |
| `BETTER_AUTH_URL` | `http://localhost:3000` | `https://backend-xxx.leapcell.app` |
| `VITE_API_URL`    | `http://localhost:3000` | `https://backend-xxx.leapcell.app` |
| `NODE_ENV`        | `development`           | `production`                       |

**PENTING:** Jangan gunakan database production untuk development! Buat database terpisah.

---

## 🛡️ Security Checklist

- [ ] File `.env` ada di `.gitignore`
- [ ] File `.env.example` tidak berisi nilai sebenarnya (hanya template)
- [ ] Secret production berbeda dengan development
- [ ] Database production berbeda dengan development
- [ ] Tidak pernah hardcode password di kode

---

## 🐛 Troubleshooting

### "Cannot find module 'dotenv'"

```bash
bun add dotenv
```

### Environment variable tidak terbaca

**Backend:**

- Pastikan `import 'dotenv/config'` ada di file entry point
- Cek nama variabel (case-sensitive)

**Frontend (Vite):**

- Variabel harus diawali `VITE_`
- Restart dev server setelah ubah `.env`

### Docker tidak baca .env

Pastikan `docker-compose.yml` punya:

```yaml
env_file:
  - ./library-be/.env
```

---

## 📚 Referensi

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Better Auth Configuration](https://better-auth.com/docs/configuration)
- [Cloudinary Setup](https://cloudinary.com/documentation)
