# Library Management System

Sistem manajemen perpustakaan modern dengan arsitektur Monorepo (Backend + Frontend).

## 📚 Tech Stack

### Backend

- **Runtime:** Bun
- **Framework:** Express.js v5
- **Database:** PostgreSQL (Neon/Supabase)
- **ORM:** Drizzle ORM
- **Auth:** Better Auth
- **Validation:** Zod
- **Storage:** Cloudinary

### Frontend

- **Framework:** React + TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS (planned)
- **State Management:** TanStack Query (planned)
- **Auth Client:** Better Auth React

### DevOps

- **Containerization:** Docker + Docker Compose
- **Web Server:** Nginx (production)
- **Deployment:** Leapcell

---

## 🚀 Quick Start

### Prerequisites

- Bun v1.0+
- Node.js v20+
- Docker Desktop (opsional)
- PostgreSQL database (online)

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/library-monorepo.git
cd library-monorepo

# Install Backend
cd library-be
bun install

# Install Frontend
cd ../library-fe
npm install
```

### 2. Setup Environment Variables

```bash
# Backend
cd library-be
cp .env.example .env
# Edit .env dengan kredensial Anda

# Frontend
cd ../library-fe
cp .env.example .env
# Edit .env dengan URL backend
```

📖 **Panduan lengkap:** Lihat [ENV_GUIDE.md](./ENV_GUIDE.md)

### 3. Database Migration

```bash
cd library-be
bun run drizzle-kit push
```

### 4. Run Development

**Opsi A: Tanpa Docker (Recommended untuk coding)**

```bash
# Terminal 1 - Backend
cd library-be
bun run dev

# Terminal 2 - Frontend
cd library-fe
npm run dev
```

**Opsi B: Dengan Docker (Simulasi production)**

```bash
# Di root folder
docker-compose up --build
```

Akses:

- Frontend: http://localhost (Docker) atau http://localhost:5173 (Vite)
- Backend: http://localhost:3000
- Database GUI: http://localhost:8080 (Adminer)

---

## 📁 Project Structure

```
library/
├── library-be/              # Backend (Express + Bun)
│   ├── src/
│   │   ├── db/             # Database schema & connection
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Business logic
│   │   ├── middlewares/    # Auth, validation, etc
│   │   └── index.ts        # Entry point
│   ├── drizzle/            # Migration files (auto-generated)
│   ├── Dockerfile          # Docker config
│   └── package.json
│
├── library-fe/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities
│   │   └── main.tsx        # Entry point
│   ├── Dockerfile          # Docker config
│   └── package.json
│
├── docker-compose.yml       # Orchestration
├── EXPLANATION.md           # Docker architecture guide
├── DEPLOYMENT.md            # Deployment guide
├── ENV_GUIDE.md             # Environment variables guide
└── README.md                # This file
```

---

## 📖 Documentation

- **[EXPLANATION.md](./EXPLANATION.md)** - Penjelasan arsitektur Docker & Nginx
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Panduan deploy ke Leapcell
- **[ENV_GUIDE.md](./ENV_GUIDE.md)** - Panduan environment variables
- **[library-be/ROADMAP.md](./library-be/ROADMAP.md)** - Roadmap backend

---

## 🔧 Available Scripts

### Backend (`library-be`)

```bash
bun run dev          # Development mode (hot reload)
bun run start        # Production mode
bun run build        # TypeScript compilation
bun run db:seed      # Seed database (planned)
drizzle-kit push     # Push schema to database
drizzle-kit generate # Generate migration files
```

### Frontend (`library-fe`)

```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
```

### Docker

```bash
docker-compose up              # Start all services
docker-compose up --build      # Rebuild & start
docker-compose down            # Stop all services
docker-compose logs -f backend # View backend logs
```

---

## 🌐 Deployment

### Leapcell (Recommended)

1. Push ke GitHub
2. Connect repository di Leapcell dashboard
3. Deploy Backend:
   - Root Directory: `library-be`
   - Start Command: `bun run start`
   - Environment: Set di dashboard
4. Deploy Frontend:
   - Root Directory: `library-fe`
   - Framework: Vite
   - Environment: Set `VITE_API_URL`

📖 **Panduan lengkap:** Lihat [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🤝 Team Workflow

### Frontend Developer

```bash
cd library-fe
npm run dev
# Develop di http://localhost:5173
# API calls ke http://localhost:3000
```

### Backend Developer

```bash
cd library-be
bun run dev
# Server di http://localhost:3000
# Test dengan Postman/curl
```

### Full Stack Testing

```bash
# Di root folder
docker-compose up
# Test integrasi lengkap
```

---

## 🔐 Security

- ✅ File `.env` tidak di-commit (ada di `.gitignore`)
- ✅ CORS configured untuk frontend
- ✅ Better Auth untuk authentication
- ✅ Zod validation untuk input
- ✅ Environment-based configuration

---

## 📝 License

MIT

---

## 👥 Contributors

- Backend Developer: [Your Name]
- Frontend Developer: [Team Member]

---

## 🐛 Issues & Support

Jika ada masalah:

1. Cek dokumentasi di folder ini
2. Lihat logs: `docker-compose logs -f`
3. Buat issue di GitHub repository
