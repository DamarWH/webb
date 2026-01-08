import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CreditCard, CheckCircle, XCircle, Loader, RefreshCw } from 'lucide-react';
import api from '../services/api';
import {jwtDecode} from 'jwt-decode';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [orderDbId, setOrderDbId] = useState(null);
  const [transactionToken, setTransactionToken] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [orderCreated, setOrderCreated] = useState(false);
  const pollingIntervalRef = useRef(null);

  const { totalAmount, cartItems, shippingInfo } = location.state || {};

  const MIDTRANS_URL = 'https://midtrans-backend-production-62fb.up.railway.app';

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    initializePayment();

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // ⭐ FUNGSI BARU: Get user ID dari token
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const decoded = jwtDecode(token);
      return decoded.id || decoded.email || decoded.sub;
    } catch (err) {
      console.error('❌ Failed to decode token:', err);
      return null;
    }
  };

  const initializePayment = async () => {
    try {
      console.log('💳 Initializing payment...');
      
      // Step 1: Create order in database first
      const { newOrderId, newDbId } = await createOrder();
      
      // Step 2: Create Midtrans transaction with the orderId
      await createMidtransTransaction(newOrderId);
      
    } catch (err) {
      console.error('❌ Payment initialization failed:', err);
      setError(err.message || 'Gagal memulai pembayaran');
      setLoading(false);
    }
  };

  const createOrder = async () => {
    try {
      console.log('📝 Creating order in database...');

      // ⭐ PERBAIKAN: Gunakan user ID dari token
      const userId = getUserIdFromToken();
      const token = localStorage.getItem('token');

      if (!userId || !token) {
        throw new Error('User tidak terautentikasi');
      }

      const orderData = {
        user_id: userId,
        name: shippingInfo.name,
        email: shippingInfo.email || 'customer@example.com',
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        city: shippingInfo.city,
        postal_code: shippingInfo.postalCode,
        notes: shippingInfo.notes || '',
        total_items: cartItems.length,
        total_price: totalAmount,
        status: 'pending',
        items: cartItems.map(item => ({
          productId: item.product_id,
          name: item.nama,
          size: item.size || '',
          quantity: parseInt(item.quantity),
          price: parseInt(item.harga),
        })),
      };

      console.log('📤 Order data:', orderData);

      const response = await api.post('/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const newOrderId = response.data.order_id || response.data.orderId;
      const newDbId = response.data.dbId || response.data.id;

      if (!newOrderId || !newDbId) {
        throw new Error('Order ID tidak diterima dari server');
      }

      setOrderId(newOrderId);
      setOrderDbId(newDbId);
      setOrderCreated(true);

      console.log('✅ Order created:', newOrderId, 'DB ID:', newDbId);
      
      return { newOrderId, newDbId };
    } catch (err) {
      console.error('❌ Failed to create order:', err);
      throw new Error(err.response?.data?.error || 'Gagal membuat order');
    }
  };

  const createMidtransTransaction = async (orderIdToUse) => {
    try {
      console.log('💰 Creating Midtrans transaction...');
      console.log('💰 Using Order ID:', orderIdToUse);

      if (!orderIdToUse) {
        throw new Error('Order ID tidak tersedia');
      }

      const response = await fetch(`${MIDTRANS_URL}/create-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderIdToUse,
          gross_amount: totalAmount,
          customer: {
            name: shippingInfo.name,
            email: shippingInfo.email || 'customer@example.com',
            phone: shippingInfo.phone || '081234567890',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal membuat transaksi Midtrans');
      }

      const data = await response.json();
      const url = data.redirect_url;
      const token = data.token;

      if (!url || !token) {
        throw new Error('Data transaksi tidak lengkap dari Midtrans');
      }

      setPaymentUrl(url);
      setTransactionToken(token);
      
      // ⭐ PERBAIKAN: Set loading false SEBELUM buka window
      setLoading(false);

      console.log('✅ Transaction created');
      console.log('🔗 Payment URL:', url);

      // Open payment in new window after a short delay
      setTimeout(() => {
        window.open(url, '_blank', 'width=800,height=600');
        console.log('🪟 Payment window opened');
      }, 500);

      // Start polling after 5 seconds
      setTimeout(() => {
        startPollingPaymentStatus();
      }, 5000);

    } catch (err) {
      console.error('❌ Failed to create Midtrans transaction:', err);
      throw err;
    }
  };

  const startPollingPaymentStatus = () => {
    console.log('🔄 Starting payment status polling...');

    pollingIntervalRef.current = setInterval(() => {
      if (!processing) {
        console.log('🔄 Polling iteration...');
        verifyPaymentStatus();
      }
    }, 5000); // Poll every 5 seconds
  };

  const verifyPaymentStatus = async () => {
    if (!orderId || processing) {
      console.log('⚠️ Skip verification - orderId:', orderId, 'processing:', processing);
      return;
    }

    setProcessing(true);

    try {
      console.log('🔍 Verifying payment status for order:', orderId);

      const response = await fetch(`${MIDTRANS_URL}/check-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
        }),
      });

      console.log('📥 Check status response:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('⏳ Transaction not found yet, will retry...');
          setProcessing(false);
          return;
        }
        throw new Error('Gagal memeriksa status pembayaran');
      }

      const data = await response.json();
      const transactionStatus = data.transaction_status;
      const paymentType = data.payment_type || 'unknown';

      console.log('📊 Transaction status:', transactionStatus);
      console.log('📊 Payment type:', paymentType);

      switch (transactionStatus) {
        case 'capture':
        case 'settlement':
          console.log('✅ Payment successful!');
          setPaymentStatus('success');
          
          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }

          // Update order status
          await updateOrderStatus('paid', paymentType);

          // Reduce stock
          await reduceProductStock();

          // Clear cart
          await clearCart();

          // Show success message and redirect
          setTimeout(() => {
            handlePaymentSuccess();
          }, 2000);
          break;

        case 'pending':
          console.log('⏳ Payment still pending...');
          setPaymentStatus('pending');
          await updateOrderStatus('pending', paymentType);
          setProcessing(false);
          break;

        case 'deny':
        case 'expire':
        case 'cancel':
          console.log('❌ Payment failed:', transactionStatus);
          setPaymentStatus('failed');
          
          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }

          await updateOrderStatus('failed', paymentType);
          setError('Pembayaran gagal atau dibatalkan');
          setProcessing(false);
          break;

        default:
          console.log('⚠️ Unknown status:', transactionStatus);
          setProcessing(false);
      }

    } catch (err) {
      console.error('❌ Error verifying payment:', err);
      setProcessing(false);
    }
  };

  const updateOrderStatus = async (status, paymentMethod = null) => {
    try {
      console.log('📝 Updating order status to:', status);

      const token = localStorage.getItem('token');

      await api.put(`/orders/${orderDbId}`, {
        status: status,
        payment_method: paymentMethod,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('✅ Order status updated');
    } catch (err) {
      console.error('⚠️ Failed to update order status:', err);
    }
  };

  const reduceProductStock = async () => {
    try {
      console.log('📦 Reducing product stock...');

      const token = localStorage.getItem('token');

      const items = cartItems.map(item => ({
        productId: item.product_id.toString(),
        size: item.size || '',
        quantity: parseInt(item.quantity),
      }));

      await api.post('/inventory/reduce-stock', {
        items: items,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('✅ Stock reduced successfully');
    } catch (err) {
      console.error('⚠️ Failed to reduce stock:', err);
    }
  };

  const clearCart = async () => {
    try {
      console.log('🧹 Clearing cart...');

      const token = localStorage.getItem('token');
      const userId = getUserIdFromToken(); // ⭐ Gunakan fungsi baru

      await api.delete('/cart/clear', {
        params: { user_id: userId },
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('✅ Cart cleared');
    } catch (err) {
      console.error('⚠️ Failed to clear cart:', err);
    }
  };

  const handlePaymentSuccess = () => {
    navigate('/payment-success', {
      state: {
        orderId: orderId,
        customerName: shippingInfo.name,
        totalAmount: totalAmount,
      },
    });
  };

  const handleBackButton = async () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    const confirmCancel = window.confirm('Batalkan pembayaran? Order akan dihapus.');
    
    if (confirmCancel) {
      if (orderCreated && orderDbId) {
        try {
          const token = localStorage.getItem('token');
          await api.delete(`/orders/${orderDbId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          console.log('🗑️ Order deleted');
        } catch (err) {
          console.error('❌ Failed to delete order:', err);
        }
      }

      navigate('/checkout', {
        state: { cartItems },
      });
    }
  };

  const handleManualCheck = () => {
    console.log('🔄 Manual check triggered');
    setProcessing(false);
    verifyPaymentStatus();
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setProcessing(false);
    setPaymentStatus('pending');
    setOrderCreated(false);
    setOrderId(null);
    setOrderDbId(null);
    initializePayment();
  };

  const handleReopenPayment = () => {
    if (paymentUrl) {
      window.open(paymentUrl, '_blank', 'width=800,height=600');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-red-900 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-lg font-semibold mb-2">Memproses pembayaran...</p>
          <p className="text-gray-500 text-sm">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (error && !paymentUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-gray-50 px-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <XCircle className="w-20 h-20 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={handleBackButton}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </button>
            <button
              onClick={handleRetry}
              className="flex-1 px-6 py-3 bg-red-900 text-white font-bold rounded-xl hover:bg-red-800 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 pt-20 min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-6 py-12">
        
        <button
          onClick={handleBackButton}
          className="flex items-center gap-2 text-gray-600 hover:text-red-900 transition mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Kembali
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          
          {/* Status Icon */}
          <div className="text-center mb-6">
            {paymentStatus === 'success' ? (
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            ) : paymentStatus === 'failed' ? (
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-16 h-16 text-red-600" />
              </div>
            ) : (
              <div className="w-24 h-24 bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-16 h-16 text-white" />
              </div>
            )}
          </div>

          {/* Status Text */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {paymentStatus === 'success' ? 'Pembayaran Berhasil!' : 
               paymentStatus === 'failed' ? 'Pembayaran Gagal' :
               'Halaman Pembayaran Dibuka'}
            </h1>
            <p className="text-gray-600 text-lg">
              {paymentStatus === 'success' ? 'Transaksi Anda telah berhasil diproses' :
               paymentStatus === 'failed' ? 'Pembayaran gagal atau dibatalkan' :
               'Silakan selesaikan pembayaran di tab/window yang baru dibuka'}
            </p>
          </div>

          {/* Order Info */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">Order ID</span>
              <span className="font-bold text-gray-900">{orderId || '-'}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">Total Items</span>
              <span className="font-bold text-gray-900">{cartItems?.length || 0} produk</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-lg font-bold text-gray-900">Total Pembayaran</span>
              <span className="text-2xl font-bold text-red-900">
                Rp {totalAmount?.toLocaleString('id-ID') || 0}
              </span>
            </div>
          </div>

          {/* Status Messages */}
          {paymentStatus === 'pending' && !error && (
            <>
              <div className="flex items-center justify-center gap-3 mb-6">
                <Loader className="w-6 h-6 text-red-900 animate-spin" />
                <p className="text-gray-600 font-medium">
                  {processing ? 'Memproses pembayaran...' : 'Menunggu konfirmasi pembayaran...'}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-blue-900 font-semibold mb-2">
                      Status pembayaran akan otomatis diperbarui setiap 5 detik
                    </p>
                    <p className="text-sm text-blue-800">
                      Jika pembayaran sudah berhasil di Midtrans tapi status tidak berubah, 
                      klik tombol "Cek Status Pembayaran" di bawah.
                    </p>
                  </div>
                </div>
              </div>

              {/* ⭐ TOMBOL BUKA ULANG PAYMENT */}
              {paymentUrl && (
                <button
                  onClick={handleReopenPayment}
                  className="w-full py-3 mb-3 border-2 border-red-900 text-red-900 font-bold rounded-xl hover:bg-red-50 transition flex items-center justify-center gap-3"
                >
                  <CreditCard className="w-5 h-5" />
                  Buka Halaman Pembayaran Lagi
                </button>
              )}

              <button
                onClick={handleManualCheck}
                disabled={processing}
                className="w-full py-4 bg-red-900 text-white font-bold rounded-xl hover:bg-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl mb-4"
              >
                <RefreshCw className={`w-5 h-5 ${processing ? 'animate-spin' : ''}`} />
                Cek Status Pembayaran
              </button>
            </>
          )}

          {paymentStatus === 'success' && (
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-red-900 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-gray-600">Mengalihkan ke halaman sukses...</p>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="flex gap-3">
              <button
                onClick={handleBackButton}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Kembali
              </button>
              <button
                onClick={handleRetry}
                className="flex-1 px-6 py-3 bg-red-900 text-white font-bold rounded-xl hover:bg-red-800 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Coba Lagi
              </button>
            </div>
          )}

          {/* Cancel Button for Pending */}
          {paymentStatus === 'pending' && (
            <button
              onClick={handleBackButton}
              className="w-full py-3 text-gray-600 hover:text-red-900 transition text-center font-semibold"
            >
              Batalkan Pembayaran
            </button>
          )}

        </div>
      </div>
    </div>
  );
}