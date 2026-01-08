import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, User, Phone, Home, MapPin, Mail, FileText, Truck } from 'lucide-react';
import api from '../services/api';
import {jwtDecode} from 'jwt-decode';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  const SHIPPING_COST = 50000; // ⭐ Ongkir flat 50k

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
  });

  useEffect(() => {
    loadUserDataAndCart();
  }, []);

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const decoded = jwtDecode(token);
      console.log('🔑 Decoded token:', decoded);

      return decoded.id || decoded.email || decoded.sub;
    } catch (err) {
      console.error('❌ Failed to decode token:', err);
      return null;
    }
  };

  const loadUserDataAndCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const uid = getUserIdFromToken();
      const email = localStorage.getItem('user_email');
      
      console.log('📦 User ID (from token):', uid);
      console.log('📦 Email:', email);
      
      if (!uid) {
        console.error('❌ Cannot extract user ID from token');
        navigate('/login');
        return;
      }

      setUserId(uid);
      setUserEmail(email);

      if (location.state?.cartItems) {
        setCartItems(location.state.cartItems);
        console.log('✅ Cart items loaded:', location.state.cartItems.length);
      } else {
        console.log('❌ No cart items, redirecting to cart');
        navigate('/cart');
        return;
      }

      await loadSavedAddress(uid);

    } catch (err) {
      console.error('❌ Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedAddress = async (uid) => {
    try {
      console.log('🔥 Loading saved address for user:', uid);
      
      const response = await api.get(`/users/${uid}/shipping`);
      
      console.log('✅ Address response:', response.data);
      
      if (response.data) {
        setFormData({
          fullName: response.data.fullName || '',
          phone: response.data.phone || '',
          address: response.data.address || '',
          city: response.data.city || '',
          postalCode: response.data.postalCode || '',
          notes: response.data.notes || '',
        });
        console.log('✅ Address loaded successfully');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        console.log('ℹ️ No saved address found');
      } else if (err.response?.status === 403) {
        console.error('❌ Forbidden - Token user ID tidak match dengan parameter');
        alert('Session tidak valid. Silakan login ulang.');
        navigate('/login');
      } else {
        console.error('⚠️ Failed to load address:', err);
      }
    }
  };

  const saveShippingAddress = async () => {
    try {
      console.log('🔥 Saving shipping address...');
      
      const shippingData = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        postalCode: formData.postalCode.trim(),
        notes: formData.notes.trim(),
      };

      console.log('📦 Shipping data:', shippingData);
      console.log('📦 User ID:', userId);
      
      const response = await api.put(`/users/${userId}/shipping`, shippingData);
      
      console.log('✅ Address saved:', response.data);
    } catch (err) {
      console.error('⚠️ Failed to save address:', err);
      if (err.response?.status === 403) {
        alert('Session tidak valid. Silakan login ulang.');
        navigate('/login');
      }
      throw err;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ⭐ Calculate subtotal (tanpa ongkir)
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = parseInt(item.harga || 0);
      const qty = parseInt(item.quantity || 1);
      return sum + (price * qty);
    }, 0);
  };

  // ⭐ Calculate total (dengan ongkir)
  const calculateTotal = () => {
    return calculateSubtotal() + SHIPPING_COST;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi
    if (!formData.fullName.trim()) {
      alert('Nama lengkap tidak boleh kosong');
      return;
    }

    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      alert('Nomor telepon tidak valid (minimal 10 digit)');
      return;
    }

    if (!formData.address.trim()) {
      alert('Alamat lengkap tidak boleh kosong');
      return;
    }

    if (!formData.city.trim()) {
      alert('Kota/Kabupaten tidak boleh kosong');
      return;
    }

    if (!formData.postalCode.trim() || formData.postalCode.trim().length !== 5) {
      alert('Kode pos harus 5 digit');
      return;
    }

    setProcessing(true);

    try {
      console.log('🔥 Starting checkout process...');
      
      await saveShippingAddress();

      console.log('✅ Navigating to payment page...');
      
      navigate('/payment', {
        state: {
          totalAmount: calculateTotal(), // ⭐ Total dengan ongkir
          shippingCost: SHIPPING_COST, // ⭐ Pass ongkir
          cartItems: cartItems,
          shippingInfo: {
            name: formData.fullName.trim(),
            email: userEmail || '',
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            postalCode: formData.postalCode.trim(),
            notes: formData.notes.trim(),
          }
        }
      });

    } catch (err) {
      console.error('❌ Checkout failed:', err);
      alert(err.response?.data?.error || 'Gagal memproses checkout. Silakan coba lagi.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-red-900 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 pt-20 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-gray-600 hover:text-red-900 transition mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Keranjang
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Informasi Pengiriman</h1>
          <p className="text-gray-600">Lengkapi data pengiriman Anda</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Informasi Pengiriman</h2>
                
                <div className="space-y-4">
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Nama Lengkap <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none transition"
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Nomor Telepon <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none transition"
                        placeholder="08123456789"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimal 10 digit</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Alamat Lengkap <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-0 pl-3 pointer-events-none">
                        <Home className="w-5 h-5 text-gray-400" />
                      </div>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none transition resize-none"
                        placeholder="Jalan, RT/RW, No. Rumah"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Kota/Kabupaten/Kecamatan <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none transition"
                        placeholder="Contoh: Yogyakarta, Sleman, Depok"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Kode Pos <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        required
                        maxLength={5}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none transition"
                        placeholder="12345"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Harus 5 digit</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Catatan Tambahan (Opsional)
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-0 pl-3 pointer-events-none">
                        <FileText className="w-5 h-5 text-gray-400" />
                      </div>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent outline-none transition resize-none"
                        placeholder="Patokan, instruksi khusus, dll."
                      />
                    </div>
                  </div>

                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full py-4 bg-red-900 text-white font-bold rounded-xl hover:bg-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Bayar Sekarang
                  </>
                )}
              </button>

              <div className="space-y-2 text-sm text-gray-600 text-center">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Pembayaran aman & terpercaya</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>100% Batik Original</span>
                </div>
              </div>

            </form>
          </div>

          {/* ⭐ ORDER SUMMARY - Updated dengan ongkir */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Ringkasan Belanja</h2>
              
              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.length} produk)</span>
                  <span className="font-semibold">Rp {calculateSubtotal().toLocaleString('id-ID')}</span>
                </div>
                
                {/* ⭐ Ongkir 50k */}
                <div className="flex justify-between text-gray-600">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span>Ongkos Kirim</span>
                  </div>
                  <span className="font-semibold text-gray-900">Rp {SHIPPING_COST.toLocaleString('id-ID')}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Biaya Admin</span>
                  <span className="text-gray-900 font-semibold">Rp 0</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-red-900">
                  Rp {calculateTotal().toLocaleString('id-ID')}
                </span>
              </div>

              {/* ⭐ Info Pengiriman */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Truck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-green-900">Ongkir Flat se-Indonesia</p>
                    <p className="text-xs text-green-700 mt-1">Estimasi pengiriman 3-5 hari kerja</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}