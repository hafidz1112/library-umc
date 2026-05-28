// src/components/dashboard/LoansSection.tsx

import { useState, useEffect, Fragment } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  BookOpen,
  Search,
  User,
  Calendar,
  ChevronDown,
  RefreshCw,
  RotateCcw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { API_BASE_URL } from "@/utils/api-config";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";
import loanService from "@/services/loanService";

interface Loan {
  id: string;
  itemId: string;
  memberId: string;
  loanDate: string;
  dueDate: string;
  returnDate?: string | null;
  purpose?: string;
  notes?: string;
  // ✅ Tambah status extend_pending untuk permintaan perpanjangan
  status: "pending" | "approved" | "rejected" | "returned" | "extended" | "extend_pending";
  requestDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectReason?: string;
  item?: {
    collection?: {
      title?: string;
    };
  };
  member?: {
    nimNidn?: string;
    user?: {
      name?: string;
    };
  };
}

interface LoansSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function LoansSection({ searchTerm, onSearchChange }: LoansSectionProps) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  // ✅ Tambah opsi filter "extend_pending"
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "returned" | "extend_pending">("pending");
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [returnModalLoan, setReturnModalLoan] = useState<Loan | null>(null);
  const [returnResult, setReturnResult] = useState<{ message: string; isLate: boolean } | null>(null);
  const [rejectModal, setRejectModal] = useState<{ loanId: string; reason: string; type: 'loan' | 'extend' } | null>(null);
  // ✅ Modal approve perpanjangan
  const [extendApproveModal, setExtendApproveModal] = useState<Loan | null>(null);
  const [extendApproveNotes, setExtendApproveNotes] = useState("");

  const toast = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchLoans();
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = filter !== "all" ? `?status=${filter}` : "";
      const response = await fetch(`${API_BASE_URL}/api/loans${statusParam}`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        if (Array.isArray(data.data)) {
          setLoans(data.data);
        } else {
          setLoans([]);
          setError("Format data tidak sesuai");
        }
      } else {
        setLoans([]);
        setError(data.message || "Gagal memuat data");
      }
    } catch (error) {
      console.error("Failed to fetch loans:", error);
      setError("Gagal terhubung ke server");
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Approve peminjaman baru ──────────────────────────────────────────────────
  const handleApprove = async (loanId: string) => {
    setProcessingId(loanId);
    const loadingId = toast.loading("Memproses...", "Menyetujui peminjaman");
    try {
      const response = await fetch(`${API_BASE_URL}/api/loans/${loanId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notes: actionNotes }),
      });
      const data = await response.json();
      toast.removeToast(loadingId);
      if (data.success) {
        toast.success("Disetujui!", "Peminjaman berhasil disetujui");
        setSelectedLoan(null);
        setActionNotes("");
        fetchLoans();
      } else {
        toast.error("Gagal", data.message || "Gagal menyetujui peminjaman");
      }
    } catch {
      toast.removeToast(loadingId);
      toast.error("Error", "Gagal terhubung ke server");
    } finally {
      setProcessingId(null);
    }
  };

  // ── Approve perpanjangan ─────────────────────────────────────────────────────
  const handleApproveExtend = async () => {
    if (!extendApproveModal) return;
    const loanId = extendApproveModal.id;
    setProcessingId(loanId);
    const loadingId = toast.loading("Memproses...", "Menyetujui perpanjangan");
    try {
      await loanService.approveExtend(loanId, extendApproveNotes);
      toast.removeToast(loadingId);
      toast.success("Perpanjangan Disetujui!", "Batas kembali buku telah diperpanjang");
      setExtendApproveModal(null);
      setExtendApproveNotes("");
      fetchLoans();
    } catch (err) {
      toast.removeToast(loadingId);
      toast.error("Gagal", err instanceof Error ? err.message : "Gagal menyetujui perpanjangan");
    } finally {
      setProcessingId(null);
    }
  };

  // ── Reject (peminjaman atau perpanjangan) ────────────────────────────────────
  const openRejectModal = (loanId: string, type: 'loan' | 'extend') => {
    setRejectModal({ loanId, reason: "", type });
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    const { loanId, reason, type } = rejectModal;
    if (!reason.trim()) {
      toast.warning("Isi Alasan", "Alasan penolakan tidak boleh kosong");
      return;
    }

    setProcessingId(loanId);
    setRejectModal(null);
    const loadingId = toast.loading("Memproses...", type === 'extend' ? "Menolak perpanjangan" : "Menolak peminjaman");
    try {
      if (type === 'extend') {
        await loanService.rejectExtend(loanId, reason);
        toast.success("Ditolak", "Perpanjangan berhasil ditolak");
      } else {
        const response = await fetch(`${API_BASE_URL}/api/loans/${loanId}/reject`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ reason }),
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        toast.success("Ditolak", "Peminjaman berhasil ditolak");
      }
      toast.removeToast(loadingId);
      fetchLoans();
    } catch (err) {
      toast.removeToast(loadingId);
      toast.error("Error", err instanceof Error ? err.message : "Gagal terhubung ke server");
    } finally {
      setProcessingId(null);
    }
  };

  // ── Return book ──────────────────────────────────────────────────────────────
  const handleReturn = async (loanId: string) => {
    setProcessingId(loanId);
    const loadingId = toast.loading("Memproses...", "Memproses pengembalian buku");
    try {
      const response = await fetch(`${API_BASE_URL}/api/loans/${loanId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      const data = await response.json();
      toast.removeToast(loadingId);
      if (data.success) {
        const isLate = data.message?.toLowerCase().includes("terlambat");
        setReturnResult({ message: data.message, isLate });
        fetchLoans();
      } else {
        toast.error("Gagal", data.message || "Gagal memproses pengembalian");
        setReturnModalLoan(null);
      }
    } catch {
      toast.removeToast(loadingId);
      toast.error("Error", "Gagal terhubung ke server");
      setReturnModalLoan(null);
    } finally {
      setProcessingId(null);
    }
  };

  // ── Status badge ─────────────────────────────────────────────────────────────
  const getStatusBadge = (status: string, dueDate?: string) => {
    if (status === "approved" && dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(dueDate);
      due.setHours(0, 0, 0, 0);
      if (today > due) {
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide bg-red-100 text-red-700">
            <Clock size={14} /> Terlambat
          </span>
        );
      }
    }

    const statusConfig: Record<string, { color: string; icon: React.ElementType; text: string }> = {
      pending:        { color: "bg-yellow-100 text-yellow-700",  icon: Clock,        text: "Menunggu" },
      approved:       { color: "bg-blue-100 text-blue-700",      icon: BookOpen,     text: "Dipinjam" },
      rejected:       { color: "bg-red-100 text-red-700",        icon: XCircle,      text: "Ditolak" },
      returned:       { color: "bg-gray-100 text-gray-700",      icon: CheckCircle,  text: "Dikembalikan" },
      extended:       { color: "bg-purple-100 text-purple-700",  icon: RotateCcw,    text: "Diperpanjang" },
      // ✅ Badge khusus untuk permintaan perpanjangan yang menunggu persetujuan admin
      extend_pending: { color: "bg-orange-100 text-orange-700",  icon: Clock,        text: "Minta Perpanjang" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide ${config.color}`}>
        <Icon size={14} /> {config.text}
      </span>
    );
  };

  const handleSearchChange = (val: string) => {
    onSearchChange(val);
    setCurrentPage(1);
  };

  const filteredLoans = Array.isArray(loans)
    ? loans.filter((loan) => {
        if (!loan) return false;
        const bookTitle = loan.item?.collection?.title?.toLowerCase() || "";
        const borrowerName = loan.member?.user?.name?.toLowerCase() || "";
        const borrowerNim = loan.member?.nimNidn?.toString() || "";
        const searchLower = searchTerm.toLowerCase();
        return (
          bookTitle.includes(searchLower) ||
          borrowerName.includes(searchLower) ||
          borrowerNim.includes(searchTerm)
        );
      })
    : [];

  const totalPages = Math.max(1, Math.ceil(filteredLoans.length / itemsPerPage));
  const paginatedLoans = filteredLoans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    pending:        Array.isArray(loans) ? loans.filter((l) => l?.status === "pending").length : 0,
    extend_pending: Array.isArray(loans) ? loans.filter((l) => l?.status === "extend_pending").length : 0,
    approved:       Array.isArray(loans) ? loans.filter((l) => l?.status === "approved" && new Date(l.dueDate).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0)).length : 0,
    overdue:        Array.isArray(loans) ? loans.filter((l) => l?.status === "approved" && new Date(l.dueDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0)).length : 0,
    returned:       Array.isArray(loans) ? loans.filter((l) => l?.status === "returned").length : 0,
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">

        {/* Header Controls */}
        <div className="p-6 md:px-8 border-b border-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-extrabold text-[#0F172A] tracking-tight">Peminjaman & Persetujuan</h2>
            {/* ✅ Badge notif perpanjangan pending */}
            {stats.extend_pending > 0 && (
              <p className="text-xs text-orange-600 font-bold mt-1">
                ⚠ {stats.extend_pending} permintaan perpanjangan menunggu persetujuan
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Filter Status */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="appearance-none bg-[#F8FAFC] border-none rounded-xl pl-4 pr-10 py-2.5 text-[13px] font-bold text-slate-600 focus:ring-2 focus:ring-red-500/10 cursor-pointer min-w-[220px]"
              >
                <option value="pending">Menunggu Persetujuan</option>
                {/* ✅ Opsi filter permintaan perpanjangan */}
                <option value="extend_pending">Permintaan Perpanjangan {stats.extend_pending > 0 ? `(${stats.extend_pending})` : ''}</option>
                <option value="approved">Sedang Dipinjam</option>
                <option value="returned">Dikembalikan</option>
                <option value="all">Semua</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" strokeWidth={3} />
            </div>

            {/* Search */}
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari peminjaman..."
                className="w-full md:w-64 pl-11 pr-4 py-2.5 bg-[#F8FAFC] border-none rounded-xl text-[13px] font-medium text-slate-600 focus:ring-2 focus:ring-red-500/10 placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            {/* Refresh */}
            <button
              onClick={fetchLoans}
              className="w-10 h-10 bg-[#F8FAFC] rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-all flex items-center justify-center shrink-0"
              title="Refresh data"
            >
              <RefreshCw size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-6 md:px-8 border-b border-slate-50">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-[#FEFCE8] rounded-2xl p-4 flex flex-col justify-between h-[90px]">
              <div className="flex items-start justify-between w-full">
                <Clock className="text-[#A16207]" size={18} strokeWidth={2.5} />
                <span className="text-[26px] font-black leading-none text-[#A16207]">{stats.pending}</span>
              </div>
              <p className="text-[10px] font-bold text-[#A16207]">Menunggu Persetujuan</p>
            </div>

            {/* ✅ Card khusus perpanjangan pending */}
            <div className="bg-orange-50 rounded-2xl p-4 flex flex-col justify-between h-[90px]">
              <div className="flex items-start justify-between w-full">
                <RotateCcw className="text-orange-600" size={18} strokeWidth={2.5} />
                <span className="text-[26px] font-black leading-none text-orange-600">{stats.extend_pending}</span>
              </div>
              <p className="text-[10px] font-bold text-orange-600">Minta Perpanjang</p>
            </div>

            <div className="bg-[#EFF6FF] rounded-2xl p-4 flex flex-col justify-between h-[90px]">
              <div className="flex items-start justify-between w-full">
                <BookOpen className="text-[#1D4ED8]" size={18} strokeWidth={2.5} />
                <span className="text-[26px] font-black leading-none text-[#1D4ED8]">{stats.approved}</span>
              </div>
              <p className="text-[10px] font-bold text-[#1D4ED8]">Sedang Dipinjam</p>
            </div>

            <div className="bg-[#F3F4F6] rounded-2xl p-4 flex flex-col justify-between h-[90px]">
              <div className="flex items-start justify-between w-full">
                <CheckCircle className="text-[#4B5563]" size={18} strokeWidth={2.5} />
                <span className="text-[26px] font-black leading-none text-[#4B5563]">{stats.returned}</span>
              </div>
              <p className="text-[10px] font-bold text-[#4B5563]">Dikembalikan</p>
            </div>

            <div className="bg-[#FEF2F2] rounded-2xl p-4 flex flex-col justify-between h-[90px]">
              <div className="flex items-start justify-between w-full">
                <XCircle className="text-[#B91C1C]" size={18} strokeWidth={2.5} />
                <span className="text-[26px] font-black leading-none text-[#B91C1C]">{stats.overdue}</span>
              </div>
              <p className="text-[10px] font-bold text-[#B91C1C]">Terlambat</p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-6 md:px-8">
          {loading ? (
            <div className="space-y-4 animate-in fade-in duration-500">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[140px] w-full rounded-[20px]" />
              ))}
            </div>
          ) : paginatedLoans.length === 0 ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-slate-400">
              <BookOpen className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-[15px] font-bold text-slate-400">
                {searchTerm ? "Tidak ada hasil pencarian" : "Tidak ada data peminjaman"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="bg-[#F8FAFC] rounded-[20px] p-6 border border-slate-100 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 border border-slate-100 group-hover:border-red-100 group-hover:bg-red-50 transition-colors">
                        <BookOpen className="text-slate-400 group-hover:text-[#B91C1C] transition-colors" size={20} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[#0F172A] text-[15px] leading-snug">
                          {loan.item?.collection?.title || "Judul tidak tersedia"}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <User size={13} className="text-slate-400" />
                          <span className="text-[13px] font-bold text-slate-600">
                            {loan.member?.user?.name || "Nama tidak tersedia"}
                          </span>
                          {loan.member?.nimNidn && (
                            <span className="text-[11px] font-medium text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-100">
                              {loan.member.nimNidn}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(loan.status, loan.dueDate)}
                  </div>

                  {/* Date Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white p-4 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Mulai Pinjam</p>
                      <div className="flex items-center gap-2 text-[13px]">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="font-bold text-slate-700">
                          {loan.loanDate
                            ? new Date(loan.loanDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                            : "-"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Batas Kembali</p>
                      <div className="flex items-center gap-2 text-[13px]">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="font-bold text-[#B91C1C]">
                          {loan.dueDate
                            ? new Date(loan.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                            : "-"}
                        </span>
                      </div>
                    </div>
                    {loan.purpose && (
                      <div className="md:col-span-2 lg:col-span-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Catatan</p>
                        <span className="text-[13px] font-medium text-slate-600 truncate block">{loan.purpose}</span>
                      </div>
                    )}
                  </div>

                  {/* ── Actions: Peminjaman Baru (pending) ── */}
                  {loan.status === "pending" && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-5 mt-5 border-t border-slate-200">
                      <button
                        onClick={() => { setSelectedLoan(loan); setActionNotes(""); }}
                        disabled={processingId === loan.id}
                        className="flex-1 bg-green-50 text-green-700 border border-green-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-green-600 hover:text-white transition-all disabled:opacity-50"
                      >
                        {processingId === loan.id ? "Memproses..." : "✓ Setujui Peminjaman"}
                      </button>
                      <button
                        onClick={() => openRejectModal(loan.id, 'loan')}
                        disabled={processingId === loan.id}
                        className="flex-none bg-white text-slate-400 border border-slate-200 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50"
                      >
                        Tolak
                      </button>
                    </div>
                  )}

                  {/* ── Actions: Permintaan Perpanjangan (extend_pending) ── */}
                  {loan.status === "extend_pending" && (
                    <div className="pt-5 mt-5 border-t border-orange-100">
                      {/* Info banner */}
                      <div className="flex items-center gap-2 mb-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
                        <RotateCcw size={14} className="text-orange-600 shrink-0" />
                        <p className="text-[12px] font-bold text-orange-700">
                          Peminjam mengajukan permintaan perpanjangan batas kembali.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => { setExtendApproveModal(loan); setExtendApproveNotes(""); }}
                          disabled={processingId === loan.id}
                          className="flex-1 bg-orange-500 text-white border border-orange-400 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <RotateCcw size={14} />
                          {processingId === loan.id ? "Memproses..." : "Setujui Perpanjangan"}
                        </button>
                        <button
                          onClick={() => openRejectModal(loan.id, 'extend')}
                          disabled={processingId === loan.id}
                          className="flex-none bg-white text-slate-400 border border-slate-200 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50"
                        >
                          Tolak
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Actions: Proses Pengembalian (approved) ── */}
                  {loan.status === "approved" && (
                    <div className="pt-5 mt-5 border-t border-slate-200">
                      <button
                        onClick={() => { setReturnModalLoan(loan); setReturnResult(null); }}
                        disabled={processingId === loan.id}
                        className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
                      >
                        <RotateCcw size={14} />
                        {processingId === loan.id ? "Memproses..." : "Proses Pengembalian"}
                      </button>
                    </div>
                  )}

                  {/* Reject reason info */}
                  {loan.status === "rejected" && loan.rejectReason && (
                    <div className="mt-4 p-3 bg-red-50/50 rounded-xl text-[13px] border border-red-100">
                      <span className="font-bold text-red-700">Alasan Penolakan: </span>
                      <span className="text-red-600 font-medium">{loan.rejectReason}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 md:px-8 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400 font-medium">
              Menampilkan {Math.min((currentPage - 1) * itemsPerPage + 1, filteredLoans.length)}–
              {Math.min(currentPage * itemsPerPage, filteredLoans.length)} dari {filteredLoans.length} data
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all disabled:opacity-30"
              >
                <ChevronLeft size={16} /> Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => {
                  const showDot = idx > 0 && arr[idx - 1] !== p - 1;
                  return (
                    <Fragment key={p}>
                      {showDot && <span className="px-2 text-slate-300">...</span>}
                      <button
                        onClick={() => setCurrentPage(p)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                          currentPage === p
                            ? "bg-[#B91C1C] text-white shadow-md shadow-red-900/20"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        }`}
                      >
                        {p}
                      </button>
                    </Fragment>
                  );
                })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all disabled:opacity-30"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal: Approve Peminjaman Baru ── */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] p-6 max-w-md w-full shadow-2xl animate-slide-up">
            <h3 className="text-[18px] font-extrabold text-slate-900 mb-5">Setujui Peminjaman</h3>
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
                <p className="text-[13px] text-slate-600 flex justify-between">
                  <span className="font-bold text-slate-400">Buku</span>
                  <span className="font-bold text-slate-900 text-right">{selectedLoan.item?.collection?.title}</span>
                </p>
                <div className="h-px bg-slate-200" />
                <p className="text-[13px] text-slate-600 flex justify-between">
                  <span className="font-bold text-slate-400">Peminjam</span>
                  <span className="font-bold text-slate-900 text-right">
                    {selectedLoan.member?.user?.name}{" "}
                    <span className="text-slate-400">({selectedLoan.member?.nimNidn})</span>
                  </span>
                </p>
              </div>
              <div>
                <label className="text-[12px] font-bold text-slate-700 mb-2 block">Catatan (Opsional)</label>
                <textarea
                  placeholder="Berikan pesan ke mahasiswa..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-black font-medium focus:ring-2 focus:ring-green-500/20 outline-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setSelectedLoan(null); setActionNotes(""); }}
                className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => handleApprove(selectedLoan.id)}
                disabled={processingId === selectedLoan.id}
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-xl text-[13px] font-bold hover:bg-green-700 transition-all disabled:opacity-50"
              >
                {processingId === selectedLoan.id ? "Memproses..." : "Setujui Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Approve Perpanjangan ── */}
      {extendApproveModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] p-6 max-w-md w-full shadow-2xl animate-slide-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <RotateCcw size={18} className="text-orange-600" />
              </div>
              <h3 className="text-[18px] font-extrabold text-slate-900">Setujui Perpanjangan</h3>
            </div>
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
                <p className="text-[13px] text-slate-600 flex justify-between">
                  <span className="font-bold text-slate-400">Buku</span>
                  <span className="font-bold text-slate-900 text-right max-w-[60%] truncate">
                    {extendApproveModal.item?.collection?.title}
                  </span>
                </p>
                <div className="h-px bg-slate-200" />
                <p className="text-[13px] text-slate-600 flex justify-between">
                  <span className="font-bold text-slate-400">Peminjam</span>
                  <span className="font-bold text-slate-900">
                    {extendApproveModal.member?.user?.name}
                  </span>
                </p>
                <div className="h-px bg-slate-200" />
                <p className="text-[13px] text-slate-600 flex justify-between">
                  <span className="font-bold text-slate-400">Batas Kembali Saat Ini</span>
                  <span className="font-bold text-[#B91C1C]">
                    {new Date(extendApproveModal.dueDate).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </span>
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                <p className="text-[12px] text-orange-700 font-medium">
                  Menyetujui akan memperpanjang batas kembali sesuai kebijakan perpustakaan (biasanya +7 hari).
                </p>
              </div>
              <div>
                <label className="text-[12px] font-bold text-slate-700 mb-2 block">Catatan (Opsional)</label>
                <textarea
                  placeholder="Berikan informasi tambahan ke mahasiswa..."
                  value={extendApproveNotes}
                  onChange={(e) => setExtendApproveNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-black font-medium focus:ring-2 focus:ring-orange-500/20 outline-none"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setExtendApproveModal(null); setExtendApproveNotes(""); }}
                className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleApproveExtend}
                disabled={processingId === extendApproveModal.id}
                className="flex-1 bg-orange-500 text-white px-4 py-3 rounded-xl text-[13px] font-bold hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} />
                {processingId === extendApproveModal.id ? "Memproses..." : "Setujui Perpanjangan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Return Book ── */}
      {returnModalLoan && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] p-6 max-w-md w-full shadow-2xl animate-slide-up">
            {returnResult ? (
              <>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${returnResult.isLate ? "bg-orange-100" : "bg-green-100"}`}>
                  {returnResult.isLate
                    ? <AlertTriangle size={28} className="text-orange-500" />
                    : <CheckCircle size={28} className="text-green-500" />
                  }
                </div>
                <h3 className="text-[18px] font-extrabold text-slate-900 mb-3 text-center">
                  {returnResult.isLate ? "Pengembalian Terlambat" : "Buku Berhasil Dikembalikan!"}
                </h3>
                <p className="text-sm text-slate-600 font-medium text-center leading-relaxed mb-6">
                  {returnResult.message}
                </p>
                <button
                  onClick={() => { setReturnModalLoan(null); setReturnResult(null); }}
                  className="w-full bg-[#B91C1C] hover:bg-[#991b1b] text-white px-4 py-3 rounded-xl text-[13px] font-bold transition-all"
                >
                  Tutup
                </button>
              </>
            ) : (
              <>
                <h3 className="text-[18px] font-extrabold text-slate-900 mb-5">Konfirmasi Pengembalian Buku</h3>
                <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100 mb-6">
                  <p className="text-[13px] text-slate-600 flex justify-between">
                    <span className="font-bold text-slate-400">Buku</span>
                    <span className="font-bold text-slate-900 text-right max-w-[60%] truncate">
                      {returnModalLoan.item?.collection?.title}
                    </span>
                  </p>
                  <div className="h-px bg-slate-200" />
                  <p className="text-[13px] text-slate-600 flex justify-between">
                    <span className="font-bold text-slate-400">Peminjam</span>
                    <span className="font-bold text-slate-900">{returnModalLoan.member?.user?.name}</span>
                  </p>
                  <div className="h-px bg-slate-200" />
                  <p className="text-[13px] text-slate-600 flex justify-between">
                    <span className="font-bold text-slate-400">Batas Kembali</span>
                    <span className={`font-bold ${
                      new Date(returnModalLoan.dueDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0)
                        ? "text-red-600" : "text-slate-900"
                    }`}>
                      {new Date(returnModalLoan.dueDate).toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </span>
                  </p>
                </div>
                <p className="text-[12px] text-slate-500 font-medium mb-5 text-center">
                  Denda keterlambatan: <strong className="text-[#B91C1C]">Rp 500 / hari</strong>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setReturnModalLoan(null)}
                    className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleReturn(returnModalLoan.id)}
                    disabled={processingId === returnModalLoan.id}
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl text-[13px] font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={14} />
                    {processingId === returnModalLoan.id ? "Memproses..." : "Kembalikan Buku"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: Reject (loan atau extend) ── */}
      {rejectModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-[18px] font-extrabold text-slate-900 mb-2">
              {rejectModal.type === 'extend' ? "Tolak Perpanjangan" : "Tolak Peminjaman"}
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              {rejectModal.type === 'extend'
                ? "Berikan alasan mengapa perpanjangan tidak dapat disetujui."
                : "Berikan alasan penolakan yang jelas kepada peminjam."
              }
            </p>
            <textarea
              autoFocus
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              placeholder={
                rejectModal.type === 'extend'
                  ? "Contoh: Buku sudah direservasi pengguna lain, dll."
                  : "Contoh: Buku sedang dalam perbaikan, kartu tidak valid, dll."
              }
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium focus:ring-2 focus:ring-red-500/20 outline-none mb-5 resize-none"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-xl text-[13px] font-bold hover:bg-red-700 transition-all"
              >
                {rejectModal.type === 'extend' ? "Tolak Perpanjangan" : "Tolak Peminjaman"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}