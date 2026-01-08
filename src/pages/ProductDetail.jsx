import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, ArrowLeft, Package, Shield, Truck, Ruler } from 'lucide-react';
import api from '../services/api';
import axios from 'axios';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [sizeData, setSizeData] = useState({
    height: '',
    weight: '',
    age: ''
  });
  const [recommendedSize, setRecommendedSize] = useState(null);
  const [loadingSize, setLoadingSize] = useState(false);
  
  // State untuk ukuran dan gambar
  const [selectedSize, setSelectedSize] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // SIZE LABEL MAP - untuk mapping angka ke huruf (jika database pakai angka)
  const SIZE_LABEL_MAP = {
    "0": "XS",
    "1": "S",
    "2": "M",
    "3": "L",
    "4": "XL",
    "5": "XXL",
    "6": "XXXL",
  };
  
  // Get available sizes from product.size_stock
  const rawSizeStock = product?.size_stock || {};
  
  // DEBUG: Log untuk cek data
  console.log('🔍 Raw sizeStock:', rawSizeStock);
  console.log('🔍 Type of sizeStock:', typeof rawSizeStock);
  
  // Parse size_stock jika masih string JSON
  let parsedSizeStock = rawSizeStock;
  if (typeof rawSizeStock === 'string') {
    try {
      parsedSizeStock = JSON.parse(rawSizeStock);
      console.log('✅ Parsed sizeStock:', parsedSizeStock);
    } catch (err) {
      console.error('❌ Failed to parse size_stock:', err);
      parsedSizeStock = {};
    }
  }
  
  console.log('🔍 Final parsedSizeStock:', parsedSizeStock);
  console.log('🔍 Keys:', Object.keys(parsedSizeStock));
  
  // Fungsi untuk normalize ukuran - handle format huruf (S, M, L) atau angka (0, 1, 2)
  const normalizeSizeKey = (key) => {
    // Jika key adalah angka (string), convert ke label
    if (SIZE_LABEL_MAP[key]) {
      return SIZE_LABEL_MAP[key];
    }
    // Jika sudah huruf, return uppercase
    return key.toString().toUpperCase();
  };
  
  const availableSizes = Object.keys(parsedSizeStock).filter(size => {
    const stock = parseInt(parsedSizeStock[size]) || 0;
    return stock > 0;
  });
  
  console.log('✅ Available sizes:', availableSizes);
  
  // Get stock for selected size - handle both formats
  const getStockForSize = (label) => {
    // Cari di parsedSizeStock dengan key asli atau normalized
    const entry = Object.entries(parsedSizeStock).find(
      ([k]) => {
        const normalizedKey = normalizeSizeKey(k);
        return normalizedKey === label.toUpperCase() || k === label;
      }
    );
    return entry ? parseInt(entry[1]) : 0;
  };
  
  const currentStock = selectedSize ? getStockForSize(selectedSize) : 0;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // PRIORITAS 1: Cek data dari navigation state
        if (location.state?.product) {
          console.log("✅ Product data from navigation state:", location.state.product);
          setProduct(location.state.product);
          setLoading(false);
          return;
        }
        
        console.log("🔍 Fetching product with ID:", id);
        
        // PRIORITAS 2: Coba berbagai endpoint yang mungkin
        const endpoints = [
          `/products/${id}`,
          `/api/products/${id}`,
          `/products`,
          `/api/products`
        ];

        let foundProduct = null;

        for (const endpoint of endpoints) {
          try {
            console.log(`📡 Trying endpoint: ${endpoint}`);
            const res = await api.get(endpoint);
            
            // Jika endpoint spesifik product
            if (endpoint.includes(`/${id}`)) {
              if (res.data) {
                foundProduct = res.data;
                console.log("✅ Product found from direct endpoint:", foundProduct.nama);
                break;
              }
            } 
            // Jika endpoint list semua products
            else {
              const products = Array.isArray(res.data) ? res.data : res.data.products || [];
              foundProduct = products.find(p => p.id.toString() === id.toString());
              
              if (foundProduct) {
                console.log("✅ Product found from list:", foundProduct.nama);
                break;
              }
            }
          } catch (err) {
            console.log(`❌ Endpoint ${endpoint} failed:`, err.response?.status);
            continue;
          }
        }

        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          console.log("❌ Product not found with ID:", id);
          setProduct(null);
        }

      } catch (err) {
        console.error("❌ Failed to load product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, location.state]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Silakan login terlebih dahulu');
      navigate('/login');
      return;
    }

    // Validasi ukuran jika produk memiliki size_stock
    if (Object.keys(parsedSizeStock).length > 0 && !selectedSize) {
      alert('Mohon pilih ukuran terlebih dahulu');
      return;
    }

    // Validasi stok
    if (Object.keys(parsedSizeStock).length > 0 && currentStock <= 0) {
      alert('Stok ukuran yang dipilih habis');
      return;
    }

    setAddingToCart(true);
    
    try {
      const userId = localStorage.getItem('user_id') || localStorage.getItem('user_email') || '';
      
      // Persiapkan data sesuai struktur backend Flutter
      const cartData = {
        user_id: userId,
        product_id: product.id.toString(),
        nama: product.nama || product.name,
        harga: parseInt(product.harga || product.price),
        foto: allImages.length > 0 ? allImages[0] : '',
        size: selectedSize || '',
        quantity: quantity
      };

      console.log('🔥 Sending cart data:', cartData);

      // Try multiple cart endpoints
      const cartEndpoints = ['/cart', '/api/cart'];
      let success = false;

      for (const endpoint of cartEndpoints) {
        try {
          const response = await api.post(endpoint, cartData);
          console.log('✅ Cart response:', response.data);
          success = true;
          break;
        } catch (err) {
          console.log(`❌ Endpoint ${endpoint} failed:`, err.response?.data);
          continue;
        }
      }

      if (success) {
        alert(`Produk berhasil ditambahkan ke keranjang!${selectedSize ? `\nUkuran: ${selectedSize}` : ''}`);
        navigate('/cart');
      } else {
        throw new Error('Semua cart endpoints gagal');
      }
    } catch (err) {
      console.error('❌ Gagal tambah ke keranjang:', err);
      alert('Gagal menambahkan produk ke keranjang. ' + (err.response?.data?.message || err.message));
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSizeRecommendation = async () => {
    if (!sizeData.height || !sizeData.weight || !sizeData.age) {
      alert('Mohon isi semua field (tinggi badan, berat badan, dan umur)');
      return;
    }

    const height = parseInt(sizeData.height);
    const weight = parseInt(sizeData.weight);
    const age = parseInt(sizeData.age);

    if (isNaN(height) || isNaN(weight) || isNaN(age)) {
      alert('Mohon masukkan angka yang valid');
      return;
    }

    if (height < 100 || height > 250) {
      alert('Tinggi badan harus antara 100-250 cm');
      return;
    }

    if (weight < 30 || weight > 200) {
      alert('Berat badan harus antara 30-200 kg');
      return;
    }

    if (age < 10 || age > 100) {
      alert('Umur harus antara 10-100 tahun');
      return;
    }

    setLoadingSize(true);
    
    try {
      console.log('📡 Requesting size recommendation:', { weight, age, height });
      
      const response = await axios.post('https://knnpp-production.up.railway.app/predict', {
        weight: weight,
        age: age,
        height: height
      });
      
      console.log('✅ Size recommendation response:', response.data);
      
      if (response.data && response.data.recommended_size) {
        setRecommendedSize(response.data.recommended_size);
      } else {
        alert('Gagal mendapatkan rekomendasi ukuran. Respons tidak valid.');
      }
    } catch (err) {
      console.error('❌ Gagal mendapatkan rekomendasi ukuran:', err);
      alert('Gagal mendapatkan rekomendasi ukuran. Silakan coba lagi.');
    } finally {
      setLoadingSize(false);
    }
  };

  const handleCloseSizeModal = () => {
    setShowSizeModal(false);
    setRecommendedSize(null);
    setSizeData({ height: '', weight: '', age: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-white">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-red-900 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Memuat produk...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-white">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-red-900" />
          </div>
          <p className="text-xl text-gray-900 font-semibold mb-2">Produk tidak ditemukan</p>
          <p className="text-gray-600 mb-4">Produk yang Anda cari tidak tersedia atau API backend sedang bermasalah</p>
          <p className="text-sm text-red-600 mb-6">Error: API endpoint tidak merespons (404)</p>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-3 bg-red-900 text-white font-semibold rounded-lg hover:bg-red-800 transition inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Shop
          </button>
        </div>
      </div>
    );
  }

  // Determine image URL
  let imageUrl = null;
  let allImages = [];
  
  if (product.foto) {
    const url = product.foto.startsWith('http') 
      ? product.foto 
      : `http://103.175.219.112:3000${product.foto}`;
    allImages.push(url);
  }
  
  if (product.images && product.images.length > 0) {
    product.images.forEach(img => {
      if (img.image_url) {
        const url = img.image_url.startsWith('http')
          ? img.image_url
          : `http://103.175.219.112:3000${img.image_url}`;
        allImages.push(url);
      }
    });
  }
  
  if (allImages.length === 0) {
    allImages.push('https://via.placeholder.com/600x600/7f1d1d/ffffff?text=Batik+Sekarniti');
  }
  
  imageUrl = allImages[currentImageIndex] || allImages[0];

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="bg-white pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        <button
          onClick={() => navigate('/shop')}
          className="flex items-center gap-2 text-gray-600 hover:text-red-900 transition mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Shop
        </button>

        <div className="grid md:grid-cols-2 gap-12">
          
          {/* IMAGE SLIDER */}
          <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-lg group">
            <img
              src={imageUrl}
              alt={product.nama}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('❌ Image failed to load:', imageUrl);
                e.target.src = 'https://via.placeholder.com/600x600/7f1d1d/ffffff?text=Batik+Sekarniti';
              }}
            />
            
            {/* Navigation Arrows - hanya muncul jika ada lebih dari 1 gambar */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-white w-8' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Image Counter */}
            {allImages.length > 1 && (
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="inline-block px-3 py-1 bg-red-100 text-red-900 text-sm font-semibold rounded-full mb-4">
                {product.kategori || product.category_name || 'Batik'}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.nama}</h1>
              <p className="text-3xl font-bold text-red-900">
                Rp {Number(product.harga).toLocaleString('id-ID')}
              </p>
            </div>

            <div className="border-t border-b py-6 space-y-4">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">
                  {Object.keys(parsedSizeStock).length > 0 ? (
                    selectedSize ? (
                      <>Stok ukuran {selectedSize}: <strong className="text-gray-900">{currentStock}</strong> unit</>
                    ) : (
                      <em className="text-gray-500">Pilih ukuran untuk melihat stok</em>
                    )
                  ) : (
                    <>Stok: <strong className="text-gray-900">{product.stok}</strong> unit</>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">100% Batik Original</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Pengiriman ke seluruh Indonesia</span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">Deskripsi Produk</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.deskripsi || 'Batik tulis berkualitas tinggi dengan motif khas yang indah dan penuh makna. Setiap produk dikerjakan dengan teliti oleh pengrajin berpengalaman untuk menghasilkan batik original yang tahan lama.'}
              </p>
            </div>

            {/* PILIH UKURAN - hanya tampil jika produk memiliki size_stock */}
            {Object.keys(parsedSizeStock).length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block font-bold text-gray-900">Pilih Ukuran</label>
                  <button
                    onClick={() => setShowSizeModal(true)}
                    className="text-sm text-red-900 hover:text-red-800 font-semibold flex items-center gap-1"
                  >
                    <Ruler className="w-4 h-4" />
                    Panduan Ukuran AI
                  </button>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(parsedSizeStock).map(([size, stock]) => {
                    const stockNum = parseInt(stock) || 0;
                    const sizeLabel = normalizeSizeKey(size);
                    const isAvailable = stockNum > 0;
                    const isSelected = selectedSize.toUpperCase() === sizeLabel;
                    const isLowStock = stockNum > 0 && stockNum <= 5;
                    
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedSize(sizeLabel);
                            setQuantity(1);
                          }
                        }}
                        disabled={!isAvailable}
                        className={`relative py-3 px-4 border-2 rounded-lg font-semibold transition ${
                          isSelected
                            ? 'border-red-900 bg-red-900 text-white shadow-lg'
                            : isAvailable
                            ? 'border-gray-300 hover:border-red-900 text-gray-700 hover:text-red-900 hover:bg-red-50'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-lg">{sizeLabel}</span>
                          <span className={`text-xs mt-1 ${
                            isSelected 
                              ? 'text-white/80' 
                              : isAvailable 
                              ? isLowStock 
                                ? 'text-orange-600' 
                                : 'text-gray-500'
                              : 'text-gray-400'
                          }`}>
                            {isAvailable ? `Stok: ${stockNum}` : 'Habis'}
                          </span>
                        </div>
                        
                        {isLowStock && isAvailable && !isSelected && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {selectedSize && (
                  <p className="text-sm text-green-600 mt-3 flex items-center gap-1 font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Ukuran {selectedSize} dipilih (Stok: {currentStock})
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block font-bold text-gray-900 mb-3">Jumlah</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-bold text-gray-900 w-12 text-center">{quantity}</span>
                <button
                  onClick={() => {
                    const maxAvailable = Object.keys(parsedSizeStock).length > 0 ? currentStock : (product.stok || 999);
                    setQuantity(Math.min(maxAvailable, quantity + 1));
                  }}
                  disabled={
                    Object.keys(parsedSizeStock).length > 0 
                      ? quantity >= currentStock || currentStock === 0
                      : quantity >= (product.stok || 999)
                  }
                  className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {Object.keys(parsedSizeStock).length > 0 && selectedSize && (
                <p className="text-xs text-gray-500 mt-2">
                  Maksimal {currentStock} unit untuk ukuran {selectedSize}
                </p>
              )}
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-2xl font-bold text-gray-900">
                  Rp {(Number(product.harga) * quantity).toLocaleString('id-ID')}
                </span>
              </div>
              {selectedSize && (
                <div className="flex items-center justify-between text-sm pt-2 border-t">
                  <span className="text-gray-600">Ukuran dipilih:</span>
                  <span className="font-bold text-red-900">{selectedSize}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={
                addingToCart || 
                (Object.keys(parsedSizeStock).length > 0 && (!selectedSize || currentStock === 0)) ||
                (Object.keys(parsedSizeStock).length === 0 && product.stok === 0)
              }
              className="w-full py-4 bg-red-900 text-white font-bold rounded-xl hover:bg-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              <ShoppingCart className="w-5 h-5" />
              {addingToCart 
                ? 'Menambahkan...' 
                : Object.keys(parsedSizeStock).length > 0
                  ? !selectedSize 
                    ? 'Pilih Ukuran Dulu' 
                    : currentStock === 0 
                      ? 'Stok Habis' 
                      : 'Tambah ke Keranjang'
                  : product.stok === 0 
                    ? 'Stok Habis' 
                    : 'Tambah ke Keranjang'
              }
            </button>
          </div>
        </div>
      </div>

      {showSizeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative animate-slideUp shadow-2xl">
            <button
              onClick={handleCloseSizeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ruler className="w-8 h-8 text-red-900" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Rekomendasi Ukuran AI</h2>
              <p className="text-gray-600">Masukkan data Anda untuk mendapatkan rekomendasi ukuran yang tepat menggunakan AI</p>
            </div>

            {!recommendedSize ? (
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none transition"
                    min="100"
                    max="250"
                  />
                  <p className="text-xs text-gray-500 mt-1">Rentang: 100-250 cm</p>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none transition"
                    min="30"
                    max="200"
                  />
                  <p className="text-xs text-gray-500 mt-1">Rentang: 30-200 kg</p>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none transition"
                    min="10"
                    max="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Rentang: 10-100 tahun</p>
                </div>

                <button
                  onClick={handleSizeRecommendation}
                  disabled={loadingSize}
                  className="w-full py-3 bg-red-900 text-white font-bold rounded-xl hover:bg-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loadingSize ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Memproses...
                    </span>
                  ) : (
                    'Dapatkan Rekomendasi'
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-8 mb-6">
                  <p className="text-gray-600 mb-2">Ukuran yang direkomendasikan:</p>
                  <p className="text-5xl font-bold text-green-600 mb-4">{recommendedSize}</p>
                  <div className="bg-white rounded-lg p-4 text-left">
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Tinggi:</strong> {sizeData.height} cm
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Berat:</strong> {sizeData.weight} kg
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Umur:</strong> {sizeData.age} tahun
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setSelectedSize(recommendedSize);
                      handleCloseSizeModal();
                    }}
                    className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg"
                  >
                    Pilih Ukuran {recommendedSize}
                  </button>
                  
                  <button
                    onClick={handleCloseSizeModal}
                    className="w-full py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
}