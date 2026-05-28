import { API_BASE_URL } from "@/utils/api-config";

export interface Loan {
  id: string;
  requestId?: string;
  itemId: string;
  memberId: string;
  memberName?: string;
  memberNim?: string;
  collectionTitle?: string;
  collectionAuthor?: string;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  // ✅ Status lengkap termasuk alur perpanjangan
  status: "pending" | "approved" | "rejected" | "returned" | "extended" | "extend_pending";
  requestDate?: string;
  approvedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
  rejectReason?: string;
  fine?: number;
  verificationToken?: string;
  qrCodeUrl?: string;
  member?: Record<string, unknown>;
  item?: {
    id: string;
    collectionId: string;
    status: string;
    collection: {
      id: string;
      title: string;
      author: string;
      image?: string;
    };
  } & Record<string, unknown>;
}

class LoanService {
  private baseUrl = API_BASE_URL;

  // ─── MEMBER METHODS ─────────────────────────────────────────────────────────

  /** Request a book loan (Member) */
  async requestLoan(data: {
    memberId: string;
    collectionId: string;
    loanDate: string;
    dueDate: string;
    notes?: string;
  }): Promise<Loan> {
    const response = await fetch(`${this.baseUrl}/api/loans/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!result.success)
      throw new Error(result.message || "Gagal mengajukan peminjaman");
    return result.data;
  }

  /** Get my loan history (Member) */
  async getMyLoanHistory(): Promise<Loan[]> {
    const response = await fetch(`${this.baseUrl}/api/loans/history`, {
      credentials: "include"
    });

    let result: { success?: boolean; message?: string; data?: Loan[] } | null = null;
    try {
      result = await response.json();
    } catch {
      throw new Error("Respon server tidak valid saat memuat riwayat peminjaman");
    }

    if (!response.ok || !result?.success) {
      throw new Error(result?.message || "Gagal memuat riwayat peminjaman");
    }

    return Array.isArray(result.data) ? result.data : [];
  }

  /** Member mengajukan perpanjangan (butuh persetujuan admin) */
  async extendLoan(loanId: string): Promise<{ success: boolean; message: string; data: unknown }> {
    const response = await fetch(`${this.baseUrl}/api/loans/${loanId}/extend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });
    const result = await response.json();
    if (!result.success)
      throw new Error(result.message || "Gagal mengajukan perpanjangan");
    return result;
  }

  /** Member mengajukan pengembalian buku */
  async returnLoan(loanId: string, condition: string = "Baik"): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/loans/${loanId}/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ condition })
    });
    const result = await response.json();
    if (!result.success)
      throw new Error(result.message || "Gagal mengajukan pengembalian buku");
  }

  // ─── ADMIN METHODS ──────────────────────────────────────────────────────────

  /** Get all loans (Admin) */
  async getAllLoans(params?: {
    status?: string;
    memberId?: string;
    itemId?: string;
  }): Promise<Loan[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.memberId) queryParams.append("memberId", params.memberId);
    if (params?.itemId) queryParams.append("itemId", params.itemId);

    const url = `${this.baseUrl}/api/loans${queryParams.toString() ? `?${queryParams}` : ""}`;
    const response = await fetch(url, { credentials: "include" });
    const result = await response.json();
    if (!result.success)
      throw new Error(result.message || "Gagal memuat data peminjaman");
    return result.data;
  }

  /** Approve loan (Admin) */
  async approveLoan(requestId: string, notes?: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/loans/${requestId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ notes })
    });
    const result = await response.json();
    if (!result.success)
      throw new Error(result.message || "Gagal menyetujui peminjaman");
  }

  /** Reject loan (Admin) */
  async rejectLoan(requestId: string, reason: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/loans/${requestId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ reason })
    });
    const result = await response.json();
    if (!result.success)
      throw new Error(result.message || "Gagal menolak peminjaman");
  }

  /** Admin menyetujui perpanjangan */
  async approveExtend(loanId: string, notes?: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/loans/${loanId}/approve-extend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ notes })
    });
    const result = await response.json();
    if (!result.success)
      throw new Error(result.message || "Gagal menyetujui perpanjangan");
  }

  /** Admin menolak perpanjangan */
  async rejectExtend(loanId: string, reason: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/loans/${loanId}/reject-extend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ reason })
    });
    const result = await response.json();
    if (!result.success)
      throw new Error(result.message || "Gagal menolak perpanjangan");
  }

  // ─── VERIFICATION METHODS ────────────────────────────────────────────────────

  /** Verify loan token */
  async verifyLoanToken(token: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/api/loans/verify/${token}`, {
      credentials: "include"
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message || "Token tidak valid");
    return result.data;
  }
}

export default new LoanService();