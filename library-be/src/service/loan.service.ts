import { db } from "../db";
import { eq, and, sql } from "drizzle-orm";
import { items, loans, members } from "../db/schema";
import crypto from "crypto";
import { NotificationService } from "./notification.service";

const notificationService = new NotificationService();

export class LoanService {
  /**
   * 1. Mahasiswa Request Pinjam Buku
   */
  async requestLoan(memberId: string, itemId: string) {
    // Best Practice: Cek apakah member sudah meminjam terlalu banyak (Limit: 3 buku aktif)
    const activeLoansCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(loans)
      .where(
        and(
          eq(loans.memberId, memberId),
          sql`${loans.status} IN ('approved', 'pending', 'extended')`,
        ),
      );

    if (Number(activeLoansCount[0].count) >= 3) {
      throw new Error(
        "Anda sudah mencapai batas maksimal peminjaman (3 buku). Silakan kembalikan buku terlebih dahulu.",
      );
    }

    // Validasi item
    const item = await db.query.items.findFirst({
      where: eq(items.id, itemId),
    });

    if (!item || item.status !== "available") {
      throw new Error("Buku ini tidak tersedia untuk dipinjam");
    }

    // Generate token & expire (2 jam) untuk verifikasi di tempat
    const token = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 jam

    const [loan] = await db
      .insert(loans)
      .values({
        memberId,
        itemId,
        status: "pending",
        loanDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0], // Standar: 7 hari
        verificationToken: token,
        verificationExpiresAt: expiresAt,
      })
      .returning();

    return loan;
  }

  /**
   * 2. Admin Scan / Check Token
   */
  async verifyToken(token: string) {
    const loan = await db.query.loans.findFirst({
      where: and(
        eq(loans.verificationToken, token),
        eq(loans.status, "pending"),
      ),
      with: {
        member: { with: { user: true } },
        item: { with: { collection: true } },
      },
    });

    if (!loan) {
      throw new Error("Token invalid atau peminjaman sudah di proses");
    }

    if (new Date() > (loan.verificationExpiresAt ?? new Date(0))) {
      throw new Error("Token telah kadaluarsa. Silakan request ulang.");
    }

    return loan;
  }

  /**
   * 3. Admin approve peminjaman (Email Otomatis)
   */
  async approveLoan(loanId: string, adminId: string) {
    const result = await db.transaction(async (tx) => {
      // Ambil data peminjaman untuk kirim email
      const loanData = await tx.query.loans.findFirst({
        where: eq(loans.id, loanId),
        with: {
          member: { with: { user: true } },
          item: { with: { collection: true } },
        },
      });

      if (!loanData) {
        throw new Error("Data peminjaman tidak ditemukan");
      }

      // Update Loan Status
      const [updatedLoan] = await tx
        .update(loans)
        .set({
          status: "approved",
          approvedBy: adminId,
          verificationToken: null, // Hapus token setelah digunakan
        })
        .where(eq(loans.id, loanId))
        .returning();

      // Update Item Status menjadi 'loaned'
      await tx
        .update(items)
        .set({ status: "loaned", updatedAt: new Date() })
        .where(eq(items.id, updatedLoan.itemId));

      return loanData;
    });

    // Kirim Email Notifikasi (Async - tidak menunggu email terkirim untuk return response)
    if (result.member.user.email) {
      void notificationService.sendLoansNotification(
        result.member.user.email,
        result.member.user.name,
        result.item.collection.title ?? "Buku",
        result.dueDate,
      );
    }

    return {
      message: "Peminjaman berhasil disetujui, email notifikasi telah dikirim.",
    };
  }

  /**
   * 4. Admin reject peminjaman
   */
  async rejectLoan(loanId: string, adminId: string) {
    await db.transaction(async (tx) => {
      const [updatedLoan] = await tx
        .update(loans)
        .set({
          status: "rejected",
          approvedBy: adminId,
          verificationToken: null,
        })
        .where(eq(loans.id, loanId))
        .returning();

      if (!updatedLoan) {
        throw new Error("Peminjaman tidak ditemukan");
      }

      await tx
        .update(items)
        .set({ status: "available", updatedAt: new Date() })
        .where(eq(items.id, updatedLoan.itemId));
    });

    return {
      message: "Peminjaman berhasil ditolak",
    };
  }

  /**
   * 5. Return Loan (Pengembalian Buku) - NEW
   */
  async returnLoan(loanId: string, _adminId: string) {
    return await db.transaction(async (tx) => {
      const loan = await tx.query.loans.findFirst({
        where: eq(loans.id, loanId),
      });

      if (!loan || loan.status !== "approved") {
        throw new Error(
          "Buku ini tidak dalam status dipinjam atau data tidak ditemukan",
        );
      }

      // Update status peminjaman jadi 'returned'
      await tx
        .update(loans)
        .set({
          status: "returned",
          returnDate: new Date().toISOString().split("T")[0],
          updatedAt: new Date(),
        })
        .where(eq(loans.id, loanId));

      // Kembalikan status buku jadi 'available'
      await tx
        .update(items)
        .set({
          status: "available",
          updatedAt: new Date(),
        })
        .where(eq(items.id, loan.itemId));

      return {
        success: true,
        message: "Buku telah berhasil dikembalikan.",
      };
    });
  }

  // Helper: Get Member by User ID
  async getMemberIdByUserId(userId: string) {
    const member = await db.query.members.findFirst({
      where: eq(members.userId, userId),
    });
    return member?.id;
  }

  /**
   * 6. Get All Loans (With filters)
   */
  async getAllLoans(filters: {
    memberId?: string;
    status?: "pending" | "approved" | "returned" | "extended" | "rejected";
    limit?: number;
    offset?: number;
  }) {
    const whereConditions = [];

    if (filters.memberId) {
      whereConditions.push(eq(loans.memberId, filters.memberId));
    }

    if (filters.status) {
      whereConditions.push(eq(loans.status, filters.status));
    }

    const result = await db.query.loans.findMany({
      where: and(...whereConditions),
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      with: {
        item: {
          with: {
            collection: true,
            location: true,
          },
        },
        member: {
          with: {
            user: true,
          },
        },
      },
      orderBy: (loans, { desc }) => [desc(loans.createdAt)],
    });

    return {
      success: true,
      message: "Loans retrieved successfully",
      data: result,
    };
  }
}
