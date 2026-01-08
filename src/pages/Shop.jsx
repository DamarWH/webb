import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, Ruler, X } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import axios from 'axios';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // State untuk prediksi ukuran
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [sizeData, setSizeData] = useState({
    height: '',
    weight: '',
    age: ''
  });
  const [predictedSize, setPredictedSize] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      // Parse size_stock jika berupa string JSON
      const productsWithParsedSizes = response.data.map(product => {
        if (product.size_stock && typeof product.size_stock === 'string') {
          try {
            product.size_stock = JSON.parse(product.size_stock);
          } catch (e) {
            console.error('Failed to parse size_stock:', e);
          }
        }
        return product;
      });
      setProducts(productsWithParsedSizes);
    } catch (err) {
      console.error('Gagal ambil produk:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSizePrediction = async () => {
    if (!sizeData.height || !sizeData.weight || !sizeData.age) {
      alert('Mohon isi tinggi badan, berat badan, dan umur');
      return;
    }

    const height = parseInt(sizeData.height);
    const weight = parseInt(sizeData.weight);
    const age = parseInt(sizeData.age);

    // Validasi input
    if (height < 100 || height > 250 || weight < 30 || weight > 200 || age < 10 || age > 100) {
      alert('Input diluar rentang wajar. Tinggi: 100-250cm, Berat: 30-200kg, Umur: 10-100 tahun');
      return;
    }

    setLoadingPrediction(true);
    
    try {
      const response = await axios.post('https://knnpp-production.up.railway.app/predict', {
        weight: weight,
        age: age,
        height: height
      });
      
      if (response.data && response.data.recommended_size) {
        setPredictedSize(response.data.recommended_size);
      } else {
        alert('Gagal mendapatkan prediksi ukuran');
      }
    } catch (err) {
      console.error('Gagal mendapatkan prediksi ukuran:', err);
      alert('Gagal mendapatkan prediksi ukuran. Silakan coba lagi.');
    } finally {
      setLoadingPrediction(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.kategori === selectedCategory;
    
    let matchesSize = true;
    if (predictedSize) {
      // Cek apakah produk memiliki size_stock
      if (product.size_stock && typeof product.size_stock === 'object') {
        const sizeStockMap = product.size_stock;
        const availableSizes = Object.keys(sizeStockMap).map(s => s.toLowerCase());
        matchesSize = availableSizes.includes(predictedSize.toLowerCase());
        
        // Cek juga stok untuk ukuran tersebut
        if (matchesSize) {
          const stockValue = sizeStockMap[predictedSize] || 
                            sizeStockMap[predictedSize.toLowerCase()] || 
                            sizeStockMap[predictedSize.toUpperCase()];
          if (stockValue !== undefined) {
            const stock = typeof stockValue === 'number' ? stockValue : parseInt(stockValue) || 0;
            matchesSize = stock > 0;
          }
        }
      } else {
        matchesSize = false;
      }
    }
    
    return matchesSearch && matchesCategory && matchesSize;
  });

  const categories = ['all', ...new Set(products.map(p => p.kategori).filter(Boolean))];

  return (
    <div className="bg-white pt-20 min-h-screen">
      
      {/* HEADER */}
      <section className="py-16 px-6 bg-gradient-to-br from-red-50 to-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Shop Batik</h1>
          <p className="text-xl text-gray-600">
            Koleksi batik tulis dan cap berkualitas tinggi langsung dari pengrajin
          </p>
        </div>
      </section>

      {/* FILTER & SEARCH */}
      <section className="py-8 px-6 border-b bg-white sticky top-20 z-40">
        <div className="max-w-7xl mx-auto space-y-4">
          
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* SEARCH */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none"
              />
            </div>

            {/* SIZE PREDICTION BUTTON */}
            <button
              onClick={() => setShowSizeModal(true)}
              className="px-6 py-3 bg-red-900 text-white font-semibold rounded-xl hover:bg-red-800 transition flex items-center gap-2 whitespace-nowrap"
            >
              <Ruler className="w-5 h-5" />
              Prediksi Ukuran Saya
            </button>
          </div>

          {/* CATEGORY FILTER */}
          <div className="flex items-center gap-3 w-full overflow-x-auto pb-2">
            <SlidersHorizontal className="w-5 h-5 text-gray-600 flex-shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full font-medium transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-red-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat === 'all' ? 'Semua' : cat}
              </button>
            ))}
          </div>

          {/* PREDICTED SIZE INDICATOR */}
          {predictedSize && (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Ruler className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">
                    Filter Aktif: Ukuran {predictedSize}
                  </p>
                  <p className="text-sm text-gray-600">
                    Menampilkan produk sesuai ukuran Anda
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPredictedSize(null);
                  setSizeData({ height: '', weight: '', age: '' });
                }}
                className="p-2 hover:bg-green-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* PRODUCTS GRID */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-red-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Memuat produk...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600 mb-2">
                {predictedSize 
                  ? `Tidak ada produk dengan ukuran ${predictedSize} yang tersedia`
                  : searchQuery 
                  ? `Tidak ada produk yang cocok dengan pencarian "${searchQuery}"`
                  : 'Produk tidak ditemukan'
                }
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setPredictedSize(null);
                  setSizeData({ height: '', weight: '', age: '' });
                }}
                className="mt-4 px-6 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 transition"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 text-gray-600">
                Menampilkan {filteredProducts.length} produk
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* SIZE PREDICTION MODAL */}
      {showSizeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => {
                setShowSizeModal(false);
                if (!predictedSize) {
                  setSizeData({ height: '', weight: '', age: '' });
                }
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ruler className="w-8 h-8 text-red-900" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Prediksi Ukuran Saya</h2>
              <p className="text-gray-600">Temukan produk yang sesuai dengan ukuran Anda</p>
            </div>

            {!predictedSize ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Tinggi Badan (cm)
                  </label>
                  <input
                    type="number"
                    value={sizeData.height}
                    onChange={(e) => setSizeData({ ...sizeData, height: e.target.value })}
                    placeholder="Contoh: 170"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Berat Badan (kg)
                  </label>
                  <input
                    type="number"
                    value={sizeData.weight}
                    onChange={(e) => setSizeData({ ...sizeData, weight: e.target.value })}
                    placeholder="Contoh: 65"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Umur (tahun)
                  </label>
                  <input
                    type="number"
                    value={sizeData.age}
                    onChange={(e) => setSizeData({ ...sizeData, age: e.target.value })}
                    placeholder="Contoh: 25"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none"
                  />
                </div>

                <button
                  onClick={handleSizePrediction}
                  disabled={loadingPrediction}
                  className="w-full py-3 bg-red-900 text-white font-bold rounded-xl hover:bg-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingPrediction ? 'Memproses...' : 'Dapatkan Prediksi'}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-8 mb-6">
                  <p className="text-gray-600 mb-2">Ukuran yang cocok untuk Anda:</p>
                  <p className="text-5xl font-bold text-green-600 mb-2">{predictedSize}</p>
                  <p className="text-sm text-gray-500">
                    Berdasarkan tinggi {sizeData.height} cm, berat {sizeData.weight} kg, umur {sizeData.age} tahun
                  </p>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Produk akan difilter sesuai ukuran Anda
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => setShowSizeModal(false)}
                    className="w-full py-3 bg-red-900 text-white font-bold rounded-xl hover:bg-red-800 transition"
                  >
                    Lihat Produk
                  </button>
                  
                  <button
                    onClick={() => {
                      setPredictedSize(null);
                      setSizeData({ height: '', weight: '', age: '' });
                    }}
                    className="w-full py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                  >
                    Reset Prediksi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}