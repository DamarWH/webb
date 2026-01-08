import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Target, TrendingUp } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import logo from "../assets/batiksekarniti.png";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products')
      .then((res) => {
        setProducts(res.data.slice(0, 6)); // Ambil 6 produk pertama
      })
      .catch((err) => {
        console.error('Gagal ambil produk:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white">
      
      {/* HERO SECTION */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20 bg-gradient-to-b from-red-50 to-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8">
            <div className="inline-block px-4 py-2 bg-red-100 text-red-900 text-sm font-semibold rounded-full">
              Warisan Budaya Indonesia
            </div>
            
            <img
                src={logo}
                alt="Batik Sekarniti"
                className="h-24 md:h-32 lg:h-36 w-auto mb-6"
            />

            
            <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
              Batik tulis dan cap berbasis kearifan lokal dengan dedikasi 
              terhadap mutu, keaslian, dan keberlanjutan budaya Indonesia.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="group px-8 py-4 bg-red-900 text-white font-semibold rounded-xl hover:bg-red-800 transition flex items-center gap-2"
              >
                Belanja Sekarang
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                to="/sejarah"
                className="px-8 py-4 border-2 border-gray-900 text-gray-900 font-semibold rounded-xl hover:bg-gray-900 hover:text-white transition"
              >
                Tentang Kami
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="w-full aspect-square bg-gradient-to-br from-red-200 to-red-100 rounded-3xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src="src/assets/IMG_1547.jpeg" 
                alt="Batik Sekarniti"
                className="w-4/5 h-4/5 object-contain drop-shadow-2xl"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* SEJARAH CUPLIKAN */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-red-900" />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Sejarah Kami</h2>
          </div>
          
          <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
            <p>
              Batik Sekarniti mulai berkembang pada tahun 2008 sebagai usaha keluarga 
              yang berfokus pada penyediaan bahan batik tulis. Dengan pembinaan dari 
              pemerintah bersama 26 pelaku UKM lainnya pada 2009, kami mulai memahami 
              klasifikasi UMKM dan memperkuat posisi sebagai usaha mikro.
            </p>
            
            <p>
              Tahun 2010 menjadi tonggak penting ketika kami dipercaya mewakili daerah 
              dalam pameran Manggar Fair di Kulon Progo. Sejak 2011, kami berkembang 
              dari penjualan bahan batik menjadi produk jadi bernilai ekonomis seperti 
              pakaian batik dengan fokus pada nilai estetika dan kualitas.
            </p>
          </div>

          <Link
            to="/sejarah"
            className="inline-flex items-center gap-2 mt-8 text-red-900 font-semibold hover:gap-4 transition-all"
          >
            Baca Selengkapnya
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FILOSOFI & VISI CUPLIKAN */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Filosofi & Visi Kami
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Batik bukan sekadar kain bermotif, melainkan warisan budaya bangsa 
              yang sarat makna dan filosofi.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-red-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Filosofi</h3>
              <p className="text-gray-600 leading-relaxed">
                Setiap motif memiliki makna, cerita, dan filosofi yang mencerminkan 
                kearifan lokal Indonesia.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-red-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Visi</h3>
              <p className="text-gray-600 leading-relaxed">
                Menjadi pelaku UMKM batik berdaya saing nasional dan internasional 
                dengan menjaga keaslian budaya.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-red-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Misi</h3>
              <p className="text-gray-600 leading-relaxed">
                Melestarikan batik tulis, menghasilkan produk berkualitas, dan 
                mengembangkan pemasaran digital.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/filosofi"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition"
            >
              Lihat Filosofi & Visi Lengkap
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* PRODUK PREVIEW */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Koleksi Batik Kami
            </h2>
            <p className="text-xl text-gray-600">
              Batik tulis dan cap langsung dari pengrajin berpengalaman
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-red-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Memuat produk...</p>
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-600">Produk belum tersedia</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-red-900 text-white font-semibold rounded-xl hover:bg-red-800 transition"
            >
              Lihat Semua Produk
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-6 bg-gradient-to-br from-red-900 to-red-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Temukan Batik Impian Anda
          </h2>
          <p className="text-xl text-red-100 mb-10 leading-relaxed">
            Koleksi batik tulis dan cap dengan kualitas terjamin, 
            langsung dari pengrajin berpengalaman.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-red-900 font-bold text-lg rounded-xl hover:bg-red-50 transition shadow-xl"
          >
            Mulai Belanja
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}