import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";
import { admin } from "better-auth/plugins";
import { AuthService } from "../service/auth.service";

const authService = new AuthService();

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",
  trustedOrigins: [
    process.env.FRONTEND_URL ?? "http://localhost:5173",
    "http://localhost:4173",
    "https://library-fe-one.vercel.app",
  ], // Whitelist URL frontend
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.Users,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
        input: false,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  },
  plugins: [
    admin({
      defaultRole: "student",
      adminRole: "super_admin",
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          console.log("[HOOK] User Create BEFORE:", user.email);

          // Cek apakah user terdaftar di API Kampus (opsional)
          // Jika tidak ditemukan, tetap izinkan register biasa dengan role default
          const campusUser = await authService.getCampusUser(user.email);
          if (!campusUser || !campusUser.success) {
            console.log(
              "[HOOK] Campus user not found — proceeding as regular registration.",
            );
            // Tetap izinkan user dengan role default (student)
            return { data: user };
          }

          console.log("[HOOK] Campus Verification PASSED.");
          return { data: user };
        },
        after: async (user) => {
          console.log("[HOOK] User Create AFTER Triggered. ID:", user.id);

          // Coba sync dengan kampus, skip jika tidak ditemukan
          const campusUser = await authService.getCampusUser(user.email);
          if (campusUser && campusUser.success) {
            console.log("[HOOK] Calling SyncMember...");
            await authService.syncMember(user.id, campusUser.data);
          } else {
            console.log(
              "[HOOK] No campus data — skipping member sync for:",
              user.email,
            );
          }
        },
      },
    },
  },
});
