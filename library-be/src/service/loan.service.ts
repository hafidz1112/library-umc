import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { items, loans, members } from "../db/schema";
import crypto from "crypto";

export class LoanService {
  // 1. Mahasiswa Request Pinjam Bukuu
  async requestLoan(memberId: string, itemId: string) {
    // Validasi item
    const item = await db.query.items.findFirst({
      where: eq(items.id, itemId),
    });

    if (!item || item.status !== "available")
      throw new Error("Buku ini tidak tersedia");

    // Generate token & expire (2 jam)
    const token = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 jam

    // Simpan di db

    const [loan] = await db
      .insert(loans)
      .values({
        memberId,
        itemId,
        status: "pending",
        loanDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0], // 3 hari
        verificationToken: token,
        verificationExpiresAt: expiresAt,
      })
      .returning();

    return loan;
  }

  // 2. Admin Scan / Check Token

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

    if (!loan) throw new Error("Token invalid atau peminjaman sudah di proses");

    if (new Date() > loan.verificationExpiresAt!)
      throw new Error("Token Expired");

    return loan;
  }

  // 3. ADmin approve peminjaman
  async approveLoan(loanId: string, adminId: string) {
    // update loan status & item status transactionally ideally
    await db.transaction(async (tx) => {
      // 1. Update Loan Status
      const [updatedLoan] = await tx
        .update(loans)
        .set({
          status: "approved",
          approvedBy: adminId,
          verificationToken: null,
        })
        .where(eq(loans.id, loanId))
        .returning();

      if (!updatedLoan) {
        throw new Error("Peminjaman tidak ditemukan");
      }

      // 2. Update Item Status menjadi 'loaned'
      await tx
        .update(items)
        .set({ status: "loaned" })
        .where(eq(items.id, updatedLoan.itemId));
    });

    return {
      message: "Peminjaman berhasil disetujui",
    };
  }

  // 4. Admin reject peminjaman
  async rejectLoan(loanId: string, adminId: string) {
    // update loan status & item status transactionally ideally
    await db.transaction(async (tx) => {
      // 1. Update Loan Status
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

      // 2. Update Item Status menjadi 'loaned'
      await tx
        .update(items)
        .set({ status: "available" })
        .where(eq(items.id, updatedLoan.itemId));
    });

    return {
      message: "Peminjaman berhasil ditolak",
    };
  }

  // Helper: Get Member by User ID
  async getMemberIdByUserId(userId: string) {
    const member = await db.query.members.findFirst({
      where: eq(members.userId, userId),
    });
    return member?.id;
  }

  // 5. Get All Loans (With filters)
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
