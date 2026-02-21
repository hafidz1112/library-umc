import { useState } from "react";
import { Download, Printer } from "lucide-react";

interface MemberCardProps {
  name: string;
  nim: string;
  category?: string;
  major: string;
  validUntil?: string; // ✅ Tambahkan
  status?: string;     // ✅ Tambahkan
  profileImage?: string;
  onPrint?: () => void;
  onSave?: () => void;
}

const MemberCard = ({
  name = "Rizqi Noor Fauzan",
  nim = "202400000", // ✅ Default value untuk nim
  category = "Mahasiswa",
  major = "Teknik Informatika",
  profileImage,
  onPrint = () => {},
  onSave = () => {}
}: MemberCardProps) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    onPrint();
    setTimeout(() => setIsPrinting(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col items-center gap-6">
      {/* Container Kartu Utama */}
      <div className="w-full aspect-[1.6/1] bg-white rounded-[24px] shadow-xl border-2 border-blue-400 overflow-hidden flex flex-col">
        
        {/* Header Merah Melengkung */}
        <div className="bg-[#B21F24] p-4 flex items-center gap-3 relative">
          {/* Logo UMC Placeholder */}
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border border-white/20">
            <div className="bg-red-600 w-8 h-8 rounded-full flex items-center justify-center text-[8px] text-white font-bold">UMC</div>
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight uppercase tracking-tight">UMC Library</h2>
            <p className="text-white/80 text-[10px] font-medium uppercase tracking-wider italic">Digital Library System</p>
          </div>
          
          {/* ✅ NIM ditampilkan di pojok kanan header - sesuai desain asli */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-right">
            <p className="text-white/90 text-[9px] font-medium uppercase tracking-wider">NIM</p>
            <p className="text-white font-mono text-xs font-bold mt-0.5">{nim}</p>
          </div>
        </div>

        {/* Konten Utama */}
        <div className="flex-1 flex items-center px-10 gap-10">
          {/* Foto Profil */}
          <div className="w-32 h-40 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 shadow-inner">
            {profileImage ? (
              <img src={profileImage} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                <div className="w-20 h-24 bg-gray-400 rounded-md"></div>
              </div>
            )}
          </div>

          {/* Informasi Anggota */}
          <div className="flex-1 flex flex-col gap-1">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
              {name}
            </h3>
            <p className="text-[#B21F24] font-bold text-sm">
              {category}
            </p>
            <p className="text-slate-800 font-bold text-sm tracking-tight">
              {major}
            </p>
          </div>
        </div>

        {/* Barcode Area */}
        <div className="px-8 pb-6">
          <div className="w-full h-20 bg-[#0F172A] rounded-xl flex flex-col items-center justify-center p-3">
            {/* Simulasi Garis Barcode */}
            <div className="w-full h-full flex items-end justify-center gap-[2px] bg-white p-2 rounded-sm overflow-hidden">
              {[...Array(40)].map((_, i) => (
                <div 
                  key={i} 
                  className="bg-black h-full" 
                  style={{ width: `${Math.random() * 4 + 1}px` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tombol Aksi Bawah */}
      <div className="flex gap-4">
        <button
          onClick={onSave}
          className="flex items-center gap-2 bg-[#0F172A] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95"
        >
          <Download size={18} />
          Simpan Gambar
        </button>
        <button
          onClick={handlePrint}
          disabled={isPrinting}
          className="flex items-center gap-2 bg-white border-2 border-slate-100 text-slate-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
        >
          {isPrinting ? (
            <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
          ) : (
            <Printer size={18} />
          )}
          Cetak Kartu
        </button>
      </div>
    </div>
  );
};

export default MemberCard;