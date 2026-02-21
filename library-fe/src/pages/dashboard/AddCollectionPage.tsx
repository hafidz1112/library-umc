import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { ArrowLeft, Upload, Book, Info, Image as ImageIcon, CheckCircle2, Hash } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-config";

interface Category {
  id: number;
  name: string;
}

export default function AddCollectionPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    publisher: "",
    publicationYear: "",
    isbn: "",
    type: "physical_book",
    categoryId: "",
    description: "",
    quantity: "1", // Field quantity tetap ada
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}api/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      if (coverFile) {
        formDataToSend.append("cover", coverFile);
      }

      const res = await fetch(`${API_BASE_URL}api/collections`, {
        method: "POST",
        credentials: "include",
        body: formDataToSend,
      });

      const data = await res.json();
      if (data.success) {
        navigate("/dashboard/super-admin");
      } else {
        alert("Gagal menambahkan koleksi: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat menambahkan koleksi");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#9a1b1b]/5 focus:border-[#9a1b1b] transition-all font-medium text-slate-700 placeholder:text-slate-300 text-sm";
  const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <div className="max-w-4xl mx-auto px-6 py-10">
        
        {/* Header Section */}
        <div className="mb-12">
          <Link
            to="/dashboard/super-admin"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-[#9a1b1b] font-bold text-xs transition-all mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            KEMBALI KE DASHBOARD
          </Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Tambah Koleksi</h1>
          <p className="text-slate-400 font-medium italic text-sm">Lengkapi data inventaris buku fisik maupun digital.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Card 1: Media Upload */}
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 md:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-red-50 text-[#9a1b1b] rounded-lg"><ImageIcon size={20} /></div>
              <h3 className="font-bold text-xl text-slate-800 tracking-tight">Visual & Cover</h3>
            </div>

            <div className="flex flex-col md:flex-row gap-10">
              <div className="flex-1">
                <label className={labelClass}>File Cover Buku</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="cover-upload" />
                <label htmlFor="cover-upload" className="flex flex-col items-center justify-center gap-4 w-full h-64 border-2 border-dashed border-slate-200 rounded-[28px] cursor-pointer hover:border-[#9a1b1b] hover:bg-red-50/30 transition-all duration-300 group">
                  <div className="p-4 bg-slate-50 rounded-full group-hover:bg-white transition-colors"><Upload className="w-6 h-6 text-slate-300 group-hover:text-[#9a1b1b]" /></div>
                  <span className="text-sm font-bold text-slate-600 group-hover:text-[#9a1b1b] truncate max-w-[200px]">{coverFile ? coverFile.name : "Pilih Gambar"}</span>
                </label>
              </div>
              <div className="w-full md:w-56 text-center">
                 <label className={labelClass}>Preview</label>
                 <div className="w-full h-64 bg-slate-100 rounded-[28px] overflow-hidden border border-slate-100 flex items-center justify-center shadow-inner">
                    {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <Book size={40} className="opacity-20" />}
                 </div>
              </div>
            </div>
          </div>

          {/* Card 2: Metadata Form */}
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 md:p-10 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Info size={20} /></div>
              <h3 className="font-bold text-xl text-slate-800 tracking-tight">Detail Bibliografi</h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelClass}>Judul Buku</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputClass} placeholder="Judul lengkap..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Penulis</label>
                  <input type="text" required value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} className={inputClass} placeholder="Nama penulis..." />
                </div>
                <div>
                  <label className={labelClass}>Penerbit</label>
                  <input type="text" required value={formData.publisher} onChange={(e) => setFormData({ ...formData, publisher: e.target.value })} className={inputClass} placeholder="Penerbit..." />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Tipe Koleksi</label>
                  <select required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className={inputClass}>
                    <option value="physical_book">Buku Fisik</option>
                    <option value="ebook">E-Book</option>
                    <option value="journal">Jurnal</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Kategori</label>
                  <select required value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className={inputClass}>
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                  </select>
                </div>
              </div>

              {/* FIELD JUMLAH BUKU - Ditempatkan agar mudah terlihat */}
              <div className="pt-2 border-t border-slate-50 mt-4">
                <label className={`${labelClass} text-[#9a1b1b]`}>Jumlah Stok / Eksemplar (Buku Fisik)</label>
                <div className="relative">
                  <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    type="number" 
                    min="1" 
                    value={formData.quantity} 
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} 
                    className={`${inputClass} pl-12 font-bold`} 
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Deskripsi</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`${inputClass} min-h-[120px] resize-none`} placeholder="Sinopsis singkat..." />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 items-center">
            <button type="button" onClick={() => navigate("/dashboard/super-admin")} className="px-6 text-slate-400 font-bold text-sm">Batal</button>
            <button type="submit" disabled={loading} className="bg-[#9a1b1b] hover:bg-[#7a1515] text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-red-900/20 transition-all active:scale-[0.98] disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle2 size={18} /> Simpan Koleksi</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}