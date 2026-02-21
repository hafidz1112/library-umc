import { useState } from "react";
import { useNavigate } from "react-router";
import { authClient } from "@/lib/auth-client";
import { API_BASE_URL } from "@/lib/api-config";
import { Mail, Lock, LogIn, UserCircle2, UserPlus } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError("");
      await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.origin,
      });
    } catch (err) {
      setError("Gagal login SSO.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Email/Password salah");
      localStorage.setItem("access_token", data.token);
      navigate("/katalog");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#F1F3F6] flex items-center justify-center p-2 font-sans overflow-hidden">
      <div className="w-full max-w-[380px] bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Merah */}
        <div className="bg-[#B21F24] pt-5 pb-7 px-6 text-center relative">
          <div className="flex justify-center mb-2">
            <div className="bg-white/10 p-2 rounded-full">
              <UserCircle2 className="text-white w-10 h-10" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-white text-lg font-bold">Selamat Datang</h1>
          <p className="text-white/70 text-[11px]">Akses Koleksi Digital UMC</p>
          <div className="absolute -bottom-1 left-0 right-0 h-4 bg-white rounded-t-[24px]"></div>
        </div>

        <div className="px-8 pb-6 pt-1 space-y-3.5">
          {error && (
            <div className="py-2 px-3 bg-red-50 text-red-600 text-[10px] rounded-lg text-center border border-red-100">
              {error}
            </div>
          )}

          {/* Tombol SSO */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 h-10 bg-[#B21F24] hover:bg-[#961a1e] text-white rounded-xl font-semibold text-xs transition-all active:scale-95"
          >
            <LogIn size={16} />
            <span>Login SSO</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="absolute w-full border-t border-gray-100"></div>
            <span className="relative px-3 bg-white text-gray-400 text-[9px] uppercase font-bold tracking-widest">Atau</span>
          </div>

          {/* Form Login Manual */}
          <form onSubmit={handleManualLogin} className="space-y-3">
            <div>
              <label className="block text-gray-700 text-[10px] font-bold mb-1 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email"
                  className="w-full pl-10 pr-4 h-10 bg-[#F8FAFC] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B21F24]/10 focus:border-[#B21F24] outline-none text-xs transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 ml-1">
                <label className="text-gray-700 text-[10px] font-bold">Kata Sandi</label>
                <button type="button" className="text-[#B21F24] text-[9px] font-bold hover:underline">Lupa sandi?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 h-10 bg-[#F8FAFC] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B21F24]/10 focus:border-[#B21F24] outline-none text-xs transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3 h-3 rounded border-gray-300 text-[#B21F24] focus:ring-[#B21F24]"
                />
                <span className="text-gray-500 text-[10px]">Ingat saya</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 mt-1"
            >
              {isLoading ? "Memproses..." : "Masuk Ke Perpustakaan"}
            </button>
          </form>

          {/* Tombol Register - Mengarah ke /register */}
          <div className="pt-2 text-center">
            <p className="text-gray-400 text-[10px] mb-1">Belum memiliki akun?</p>
            <button
              onClick={() => navigate("/register")}
              className="flex items-center justify-center gap-1.5 w-full h-9 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold text-[11px] transition-all active:scale-95"
            >
              <UserPlus size={14} className="text-[#B21F24]" />
              Daftar Akun Baru
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;