import { useState } from "react";
import { useNavigate } from "react-router";
import { API_BASE_URL } from "@/lib/api-config";
import { Mail, Lock, User, UserCircle2, ArrowLeft } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  // src/pages/Register.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (formData.password !== formData.confirmPassword) {
    setError("Password tidak cocok");
    return;
  }
  if (formData.password.length < 6) {
    setError("Password minimal 6 karakter");
    return;
  }

  setIsLoading(true);
  setError("");
  setSuccess("");

  try {
    const response = await fetch(`${API_BASE_URL}api/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "member",
        emailVerified: false,
      }),
    });

    // ✅ PERIKSA APAKAH RESPON ADALAH JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      // Coba baca sebagai teks untuk debugging
      const textResponse = await response.text();
      console.error("Non-JSON response:", textResponse);
      
      // Periksa status code
      if (response.status === 404) {
        throw new Error("Endpoint tidak ditemukan. Periksa URL API.");
      } else if (response.status === 500) {
        throw new Error("Server error. Hubungi administrator.");
      } else if (response.status === 400) {
        throw new Error("Data tidak valid. Periksa input Anda.");
      }
      
      throw new Error(`Server mengembalikan respons tidak valid: ${textResponse.substring(0, 100)}`);
    }

    const data = await response.json();
    
    if (!response.ok) {
      // Tangani error dari backend
      throw new Error(data.message || data.error || "Gagal mendaftar");
    }

    setSuccess("Berhasil! Mengalihkan ke login...");
    setTimeout(() => navigate("/login"), 1500);
  } catch (err) {
    console.error("Registration error:", err);
    
    let errorMessage = "Terjadi kesalahan. Silakan coba lagi.";
    
    if (err instanceof Error) {
      // Prioritaskan pesan error yang spesifik
      if (err.message.includes("Endpoint tidak ditemukan")) {
        errorMessage = "❌ Endpoint API tidak ditemukan. Hubungi developer.";
      } else if (err.message.includes("Server error")) {
        errorMessage = "❌ Server sedang bermasalah. Coba lagi nanti.";
      } else if (err.message.includes("Data tidak valid")) {
        errorMessage = "❌ Email sudah terdaftar atau format tidak valid.";
      } else {
        errorMessage = `❌ ${err.message}`;
      }
    }
    
    setError(errorMessage);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="h-screen bg-[#F1F3F6] flex items-center justify-center p-2 font-sans overflow-hidden">
      <div className="w-full max-w-[400px] bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Merah Melengkung */}
        <div className="bg-[#B21F24] pt-5 pb-7 px-6 text-center relative">
          <div className="flex justify-center mb-2">
            <div className="bg-white/10 p-2 rounded-full">
              <UserCircle2 className="text-white w-10 h-10" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-white text-lg font-bold">Daftar Akun</h1>
          <p className="text-white/70 text-[11px]">Bergabung dengan Koleksi Digital UMC</p>
          <div className="absolute -bottom-1 left-0 right-0 h-4 bg-white rounded-t-[24px]"></div>
        </div>

        <div className="px-8 pb-6 pt-1 space-y-3">
          {error && (
            <div className="py-2 px-3 bg-red-50 text-red-600 text-[10px] rounded-lg text-center border border-red-100 italic">
              {error}
            </div>
          )}
          {success && (
            <div className="py-2 px-3 bg-green-50 text-green-600 text-[10px] rounded-lg text-center border border-green-100 font-bold">
              {success}
            </div>
          )}

          {/* Form Register */}
          <form onSubmit={handleSubmit} className="space-y-2.5">
            {/* Nama Field */}
            <div>
              <label className="block text-gray-700 text-[10px] font-bold mb-1 ml-1">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nama Lengkap"
                  className="w-full pl-10 pr-4 h-9 bg-[#F8FAFC] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B21F24]/10 focus:border-[#B21F24] outline-none text-xs text-slate-900 placeholder-gray-400 transition-all"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-gray-700 text-[10px] font-bold mb-1 ml-1">Email Kampus</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nama@email.umc.ac.id"
                  className="w-full pl-10 pr-4 h-9 bg-[#F8FAFC] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B21F24]/10 focus:border-[#B21F24] outline-none text-xs text-slate-900 placeholder-gray-400 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-700 text-[10px] font-bold mb-1 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••"
                    className="w-full pl-10 pr-4 h-9 bg-[#F8FAFC] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B21F24]/10 focus:border-[#B21F24] outline-none text-xs text-slate-900 placeholder-gray-400 transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-[10px] font-bold mb-1 ml-1">Konfirmasi</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••"
                    className="w-full pl-10 pr-4 h-9 bg-[#F8FAFC] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B21F24]/10 focus:border-[#B21F24] outline-none text-xs text-slate-900 placeholder-gray-400 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 mt-2"
            >
              {isLoading ? "Memproses..." : "Daftar Akun Baru"}
            </button>
          </form>

          {/* Back to Login */}
          <div className="pt-2 text-center">
            <p className="text-gray-400 text-[10px] mb-1">Sudah memiliki akun?</p>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center justify-center gap-1.5 w-full h-9 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold text-[11px] transition-all active:scale-95"
            >
              <ArrowLeft size={14} className="text-[#B21F24]" />
              Kembali ke Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;