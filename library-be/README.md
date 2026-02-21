# 📚 MUCILIB - Library Management System (Backend)

Welcome to the backend repository of **MUCILIB**, a modern, scalable Library Management System designed for Universities. Built with performance and type safety in mind.

![Project Status](https://img.shields.io/badge/Status-In%20Development-orange?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black)

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** Better Auth (Google OAuth + Credentials)
- **Media Storage:** Cloudinary
- **Validation:** Zod
- **Error Handling:** Custom Error Classes

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL Database
- Cloudinary Account (for image upload)
- Google Cloud Console Project (for OAuth)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/MUCILIB/be-library.git
   cd be-library
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Duplicate `.env.example` (if available) or create `.env` file in the root directory:

   ```env
   # Database
   DATABASE_URL="postgresql://user:pass@localhost:5432/library_db"

   # Authentication (Better Auth & Google)
   BETTER_AUTH_SECRET="your_random_secret_string"
   BETTER_AUTH_URL="http://localhost:3000" # Frontend URL
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"

   # Cloudinary
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   ```

4. **Database Migration**
   Push schema to your database:

   ```bash
   npx drizzle-kit push
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```
   Server will start at `http://localhost:5000` (or your configured port).

## 📂 Project Structure

```
src/
├── config/         # Environment & Third-party configs
├── controllers/    # Request handlers (Logic)
├── db/             # Database connection & Schema
│   └── schema.ts   # Drizzle table definitions
├── lib/            # Shared libraries (Better Auth, etc)
├── middlewares/    # Express middlewares
├── routes/         # API Routes definition
├── utils/          # Helper functions (Upload, Formatting)
└── index.ts        # App Entry point
```

## 🤝 Contribution

Contributions are welcome! Please create a Pull Request or open an Issue for discusson.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
