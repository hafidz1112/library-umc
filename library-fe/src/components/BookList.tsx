// frontend/src/components/BookList.tsx
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router'; // Tambahkan ini
import { API_BASE_URL } from '../lib/api-config';

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

const BookList = () => {
  const navigate = useNavigate(); // Tambahkan ini
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}api/collections`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseJson = await response.json();
        console.log('API Response:', responseJson);

        if (responseJson.success && Array.isArray(responseJson.data)) {
          setCollections(responseJson.data);
        } else {
          throw new Error('Invalid API response structure');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Gagal mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  // Filter berdasarkan tab
  const currentCollections = collections.filter(collection => {
    if (activeTab === 0) {
      return collection.type === 'physical_book';
    } else {
      return collection.type === 'ebook';
    }
  });

  // Helper: Status label
  const getStatusLabel = (status: string) => {
    return status === 'available' ? 'Tersedia' : 'Dipinjam';
  };

  // Helper: Status badge style
  const getStatusBadge = (status: string) => {
    return status === 'available' 
      ? "px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium"
      : "px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-medium";
  };

  // Helper: Cover color fallback
  const getCoverColor = (type: string) => {
    return type === 'physical_book' ? 'bg-purple-500' : 'bg-blue-500';
  };

  // ✅ Tambahkan fungsi untuk navigasi ke detail
  const handleBookClick = (collectionId: string) => {
    navigate(`/katalog/${collectionId}`);
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-gray-50 rounded-xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data koleksi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-gray-50 rounded-xl">
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gray-50 rounded-xl shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Koleksi Perpustakaan</h1>
        <p className="text-sm text-gray-600 mt-1">Klik pada buku untuk melihat detail</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {["Buku Fisik", "E-Book"].map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === index
                ? "text-red-700 border-b-2 border-red-700"
                : "text-gray-700 hover:text-red-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Book List */}
      <div className="space-y-4">
        {currentCollections.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📚</div>
            <p>Tidak ada koleksi {activeTab === 0 ? 'buku fisik' : 'e-book'} yang tersedia</p>
          </div>
        ) : (
          currentCollections.map((collection) => (
            <div
              key={collection.id}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-100 hover:border-red-300 hover:-translate-y-1"
              onClick={() => handleBookClick(collection.id)} // ✅ Ganti dengan fungsi navigasi
            >
              {/* Cover Image */}
              <div className="w-16 h-24 rounded-lg mr-4 flex-shrink-0 overflow-hidden">
                {collection.image ? (
                  <img 
                    src={collection.image} 
                    alt={collection.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="${getCoverColor(collection.type)} w-full h-full flex items-center justify-center">
                            <span class="text-white text-xs font-medium">${collection.type === 'ebook' ? 'E-Book' : 'Buku'}</span>
                          </div>
                        `;
                      }
                    }}
                  />
                ) : (
                  <div className={`w-full h-full ${getCoverColor(collection.type)} flex items-center justify-center`}>
                    <span className="text-white text-xs font-medium">
                      {collection.type === 'ebook' ? 'E-Book' : 'Buku'}
                    </span>
                  </div>
                )}
              </div>

              {/* Book Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  {collection.title}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {collection.author}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                    {collection.type}
                  </span>
                  {collection.publicationYear && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                      {collection.publicationYear}
                    </span>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="ml-4 flex-shrink-0">
                <span className={getStatusBadge(collection.status)}>
                  {getStatusLabel(collection.status)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookList;