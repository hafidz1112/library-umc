// src/pages/KatalogDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { API_BASE_URL } from '../lib/api-config';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/Footer';
import { 
  Share2, 
  Bookmark, 
  QrCode, 
  BookOpen, 
  Calendar, 
  Globe, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';

interface Collection {
  id: string;
  title: string;
  author: string;
  publisher: string;
  publicationYear: number;
  isbn?: string;
  type: string;
  category_id: number;
  description?: string;
  image?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const KatalogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data untuk "Buku Serupa" (Bisa diganti dengan fetch API kategori yang sama)
  const similarBooks = [
    { id: '1', title: 'Bulan', author: 'Tere Liye', image: null, color: 'bg-slate-800' },
    { id: '2', title: 'Matahari', author: 'Tere Liye', image: null, color: 'bg-red-900' },
    { id: '3', title: 'Bintang', author: 'Tere Liye', image: null, color: 'bg-indigo-900' },
    { id: '4', title: 'Ceros dan Batozar', author: 'Tere Liye', image: null, color: 'bg-purple-900' },
  ];

  useEffect(() => {
    const fetchCollectionDetail = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}api/collections/${id}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const responseJson = await response.json();
        if (responseJson.success && responseJson.data) {
          setCollection(responseJson.data);
        } else {
          throw new Error(responseJson.message || 'Data tidak ditemukan');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat detail buku');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCollectionDetail();
    window.scrollTo(0, 0); // Scroll ke atas saat pindah buku
  }, [id]);

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-700"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] text-gray-400 mb-6 font-medium">
          <Link to="/" className="hover:text-red-700">Beranda</Link>
          <ChevronRight size={12} />
          <Link to="/katalog" className="hover:text-red-700">Katalog</Link>
          <ChevronRight size={12} />
          <span className="text-gray-800 font-bold truncate">{collection?.title}</span>
        </nav>

        {/* Card Utama */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row mb-12">
          {/* Sisi Kiri - Visual */}
          <div className="md:w-[35%] bg-[#F8FAFC] p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
            <div className="w-52 h-72 rounded-xl overflow-hidden shadow-2xl bg-white mb-8">
              {collection?.image ? (
                <img src={collection.image} alt={collection.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-emerald-900 flex items-center justify-center text-white p-4 text-center">
                  <span className="font-bold text-lg italic">{collection?.title}</span>
                </div>
              )}
            </div>
            <div className="flex gap-5">
              {[{ icon: <Share2 size={18} />, label: "Bagikan" }, { icon: <Bookmark size={18} />, label: "Simpan" }, { icon: <QrCode size={18} />, label: "QR Code" }].map((btn, idx) => (
                <button key={idx} className="flex flex-col items-center gap-1.5 group">
                  <div className="p-2.5 border border-gray-200 rounded-xl group-hover:bg-white group-hover:shadow-sm text-gray-400 group-hover:text-red-700 transition-all">
                    {btn.icon}
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sisi Kanan - Konten */}
          <div className="md:w-[65%] p-8 md:p-10 flex flex-col">
            <div className="flex gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${collection?.status === 'available' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${collection?.status === 'available' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                {collection?.status === 'available' ? 'Tersedia' : 'Dipinjam'}
              </span>
              <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[10px] font-bold">Fiksi</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">{collection?.title}</h1>
            <p className="text-md text-slate-400 font-medium mb-8">Oleh <span className="text-red-600 font-bold">{collection?.author}</span></p>
            
            <div className="grid grid-cols-3 gap-4 mb-8 border-b border-slate-50 pb-8">
              <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">ISBN</p><p className="text-xs font-bold text-slate-700">{collection?.isbn || '-'}</p></div>
              <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Penerbit</p><p className="text-xs font-bold text-slate-700">{collection?.publisher || '-'}</p></div>
              <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bahasa</p><p className="text-xs font-bold text-slate-700">Indonesia</p></div>
            </div>

            <div className="mb-10 flex-grow">
              <h3 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-tight">Sinopsis</h3>
              <p className="text-slate-600 leading-relaxed text-sm">{collection?.description || 'Deskripsi tidak tersedia.'}</p>
            </div>

            <div className="flex gap-3 mt-auto">
              <button disabled={collection?.status !== 'available'} className="flex-[2] bg-[#9a1b1b] hover:bg-[#7a1515] disabled:bg-slate-200 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98]">
                <Bookmark size={18} /> Pinjam Buku
              </button>
              <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98]">
                <Calendar size={18} /> Reservasi
              </button>
            </div>
          </div>
        </div>

        {/* SECTION: BUKU SERUPA (Sesuai Gambar 4) */}
        <div className="mb-20">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Buku Serupa</h2>
              <p className="text-sm text-slate-400 font-medium">Buku lain dengan topik yang mungkin Anda sukai</p>
            </div>
            <Link to="/katalog" className="text-red-700 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
              Lihat Semua <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {similarBooks.map((book) => (
              <Link 
                key={book.id} 
                to={`/katalog/${book.id}`}
                className="group bg-white p-4 rounded-3xl border border-gray-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
              >
                <div className={`aspect-[3/4] rounded-2xl ${book.color} mb-4 overflow-hidden shadow-md group-hover:shadow-lg transition-all`}>
                  {/* Placeholder jika tidak ada image */}
                  <div className="w-full h-full flex items-center justify-center p-4 text-center">
                    <span className="text-white font-bold text-xs uppercase opacity-80 leading-tight">
                      {book.title}
                    </span>
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1 truncate group-hover:text-red-700 transition-colors">
                  {book.title}
                </h4>
                <p className="text-xs text-slate-400 font-medium">{book.author}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default KatalogDetail;