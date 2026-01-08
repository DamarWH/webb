import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ShoppingCart, CreditCard, X } from 'lucide-react';
import api from '../services/api';

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  // ✅ Helper untuk format image URL
  const getImageUrl = (foto) => {
    if (!foto) {
      return 'https://via.placeholder.com/150x150/7f1d1d/ffffff?text=Batik';
    }

    if (typeof foto === 'string') {
      // Jika sudah URL lengkap
      if (foto.startsWith('http://') || foto.startsWith('https://')) {
        return foto;
      }
      // Jika mulai dengan /uploads
      if (foto.startsWith('/uploads')) {
        return `http://103.175.219.112:3000${foto}`;
      }
      // Jika mengandung uploads tapi tidak ada /
      if (foto.includes('uploads')) {
        return `http://103.175.219.112:3000/${foto}`;
      }
      // Default: return as-is
      return foto;
    }

    return 'https://via.placeholder.com/150x150/7f1d1d/ffffff?text=Batik';
  };

  // ✅ Fungsi untuk enrich cart items dengan data produk dari API
  const enrichCartItems = async (items) => {
    return Promise.all(
      items.map(async (item) => {
        if (item.nama && item.harga && item.foto) return item;

        try {
          // 🔥 pakai endpoint list supaya lebih aman
          const res = await api.get('/products');
          const products = Array.isArray(res.data)
            ? res.data
            : res.data.products || [];

          const product = products.find(
            p => String(p.id) === String(item.product_id)
          );

          if (!product) return item;

          return {
            ...item,
            nama: product.nama,
            harga: product.harga,
            foto: product.foto,
          };
        } catch (err) {
          console.error('❌ Enrich failed:', err);
          return item;
        }
      })
    );
  };

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const userId = localStorage.getItem('user_id') || localStorage.getItem('user_email');
      console.log('🔍 Fetching cart for user:', userId);

      // GET /cart dengan query param
      const response = await api.get('/cart', {
        params: userId ? { user_id: userId } : {}
      });
      
      console.log('✅ Cart data received:', response.data);
      
      const cartData = Array.isArray(response.data)
        ? response.data
        : response.data.items || [];

      // ✅ Enrich cart items dengan data produk
      const enrichedData = await enrichCartItems(cartData);
      console.log('✅ Enriched cart data:', enrichedData);
      
      setCartItems(enrichedData);

    } catch (err) {
      console.error('❌ Failed to load cart:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdating(true);
    try {
      console.log(`🔥 Updating item ${itemId} quantity to ${newQuantity}`);
      
      await api.put(`/cart/${itemId}`, { quantity: newQuantity });
      
      console.log('✅ Quantity updated successfully');
      
      setCartItems(cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
      
    } catch (err) {
      console.error('❌ Failed to update quantity:', err);
      alert(err.response?.data?.error || 'Gagal mengupdate jumlah produk');
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId) => {
    if (!confirm('Hapus produk dari keranjang?')) return;

    setUpdating(true);
    try {
      console.log(`🔥 Attempting to remove item ${itemId}`);
      
      // Panggil API delete dengan endpoint yang benar
      const response = await api.delete(`/cart/${itemId}`);
      
      console.log('✅ Server response:', response.data);
      
      // Setelah berhasil dihapus di server, hapus dari state
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
      
      console.log('✅ Item successfully removed from cart');
      
    } catch (err) {
      console.error('❌ Failed to remove item:', err);
      console.error('❌ Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      // Jika item tidak ditemukan (sudah terhapus), refresh cart
      if (err.response?.status === 404) {
        console.log('ℹ️ Item not found, refreshing cart...');
        await fetchCart();
      } else {
        const errorMsg = err.response?.data?.error || 'Gagal menghapus produk. Silakan coba lagi.';
        alert(errorMsg);
      }
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!confirm('Hapus semua produk dari keranjang?')) return;

    setUpdating(true);
    try {
      const userId = localStorage.getItem('user_id') || localStorage.getItem('user_email');

      await api.delete('/cart/clear', {
        params: { user_id: userId }
      });

      setCartItems([]);
      console.log('✅ Cart cleared successfully');
      
    } catch (err) {
      console.error('❌ Failed to clear cart:', err);
      alert(err.response?.data?.error || 'Gagal menghapus keranjang');
    } finally {
      setUpdating(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = parseInt(item.harga || 0);
      const qty = parseInt(item.quantity || 1);
      return sum + (price * qty);
    }, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Keranjang kosong');
      return;
    }
    
    navigate('/checkout', { state: { cartItems } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-red-900 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Memuat keranjang...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 pt-20 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        <button
          onClick={() => navigate('/shop')}
          className="flex items-center gap-2 text-gray-600 hover:text-red-900 transition mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Lanjut Belanja
        </button>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-900 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Keranjang Belanja</h1>
              <p className="text-gray-600">{cartItems.length} produk</p>
            </div>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              disabled={updating}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              <X className="w-5 h-5" />
              Kosongkan Keranjang
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Keranjang Kosong</h2>
            <p className="text-gray-600 mb-8">Belum ada produk di keranjang Anda</p>
            <button
              onClick={() => navigate('/shop')}
              className="px-8 py-3 bg-red-900 text-white font-bold rounded-xl hover:bg-red-800 transition inline-flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Mulai Belanja
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* CART ITEMS */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const imageUrl = getImageUrl(item.foto);
                const price = parseInt(item.harga || 0);
                const quantity = parseInt(item.quantity || 1);
                const subtotal = price * quantity;

                return (
                  <div key={item.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                    <div className="flex gap-6">
                      
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={item.nama || 'Produk'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('❌ Image failed to load:', imageUrl);
                              e.target.src = 'https://via.placeholder.com/150x150/7f1d1d/ffffff?text=Batik+Sekarniti';
                            }}
                          />
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {item.nama || 'Nama produk tidak tersedia'}
                            </h3>
                            {item.size && (
                              <p className="text-sm text-gray-600">
                                Ukuran: <span className="font-semibold text-red-900">{item.size}</span>
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              ID Produk: {item.product_id}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={updating}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition disabled:opacity-50"
                            title="Hapus produk"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <p className="text-2xl font-bold text-red-900 mb-4">
                          Rp {price.toLocaleString('id-ID')}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                            <button
                              onClick={() => updateQuantity(item.id, quantity - 1)}
                              disabled={quantity <= 1 || updating}
                              className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition"
                              title="Kurangi jumlah"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-lg font-bold text-gray-900 w-8 text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, quantity + 1)}
                              disabled={updating}
                              className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition"
                              title="Tambah jumlah"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-gray-600">Subtotal</p>
                            <p className="text-xl font-bold text-gray-900">
                              Rp {subtotal.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>

                        {item.created_at && (
                          <p className="text-xs text-gray-400 mt-3">
                            Ditambahkan: {new Date(item.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ORDER SUMMARY */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Ringkasan Belanja</h2>
                
                <div className="space-y-3 mb-6 pb-6 border-b">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.length} produk)</span>
                    <span className="font-semibold">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Ongkos Kirim</span>
                    <span className="text-green-600 font-semibold">Dihitung di checkout</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Biaya Admin</span>
                    <span className="text-gray-900 font-semibold">Rp 0</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6 pb-6 border-b">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-red-900">
                    Rp {calculateTotal().toLocaleString('id-ID')}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={updating || cartItems.length === 0}
                  className="w-full py-4 bg-red-900 text-white font-bold rounded-xl hover:bg-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                  <CreditCard className="w-5 h-5" />
                  {updating ? 'Memproses...' : 'Lanjut ke Pembayaran'}
                </button>

                <div className="mt-6 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Pembayaran aman & terpercaya</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Gratis retur 7 hari</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>100% Batik Original</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}