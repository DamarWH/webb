import { Calendar, Award, TrendingUp, Users } from 'lucide-react';

export default function Sejarah() {
  const timeline = [
    {
      year: '2008',
      title: 'Awal Mula',
      description: 'Batik Sekarniti mulai berkembang sebagai usaha keluarga yang dikelola oleh istri pendiri, berfokus pada penyediaan bahan batik tulis.'
    },
    {
      year: '2009',
      title: 'Pembinaan Pemerintah',
      description: 'Mendapatkan pembinaan dari pemerintah bersama 26 pelaku UKM lainnya. Mulai memahami klasifikasi UMKM dan memperkuat posisi sebagai usaha mikro.'
    },
    {
      year: '2010',
      title: 'Pameran Manggar Fair',
      description: 'Tonggak penting ketika Batik Sekarniti dipercaya untuk mewakili daerah dalam pameran Manggar Fair di Kulon Progo.'
    },
    {
      year: '2011',
      title: 'Transformasi Bisnis',
      description: 'Berkembang dari penjualan bahan batik menjadi produk jadi bernilai ekonomis seperti pakaian batik. Fokus tidak hanya pada produksi, tetapi juga nilai estetika dan kualitas.'
    },
    {
      year: '2012-Sekarang',
      title: 'Pengembangan & Kolaborasi',
      description: 'Mendapatkan berbagai pembinaan dari Dinas Koperasi DIY, universitas seperti UGM dan UMG, hingga kerja sama dengan institusi luar negeri.'
    }
  ];

  return (
    <div className="bg-white pt-20">
      
      {/* HERO */}
      <section className="py-24 px-6 bg-gradient-to-br from-red-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block px-5 py-2 bg-red-100 text-red-900 text-sm font-semibold rounded-full mb-6">
            Perjalanan Kami
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Sejarah Batik Sekarniti
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Dari usaha keluarga kecil pada tahun 2008 hingga menjadi UMKM batik 
            yang berorientasi pada kualitas, edukasi, dan keberlanjutan budaya Indonesia.
          </p>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12">
            {timeline.map((item, index) => (
              <div key={index} className="flex gap-8 group">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-red-900 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                    {item.year.substring(0, 2)}
                  </div>
                  {index !== timeline.length - 1 && (
                    <div className="w-1 h-full bg-red-200 mt-4"></div>
                  )}
                </div>
                
                <div className="flex-1 pb-12">
                  <div className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition">
                    <div className="text-red-900 font-bold text-lg mb-2">{item.year}</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Pencapaian Kami</h2>
            <p className="text-xl text-gray-600">
              Dedikasi dan kerja keras menghasilkan pengakuan
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl text-center shadow-sm hover:shadow-lg transition">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-red-900" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">17+</div>
              <div className="text-gray-600">Tahun Berpengalaman</div>
            </div>

            <div className="bg-white p-8 rounded-2xl text-center shadow-sm hover:shadow-lg transition">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-red-900" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">10+</div>
              <div className="text-gray-600">Penghargaan Diterima</div>
            </div>

            <div className="bg-white p-8 rounded-2xl text-center shadow-sm hover:shadow-lg transition">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-red-900" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">1000+</div>
              <div className="text-gray-600">Pelanggan Setia</div>
            </div>

            <div className="bg-white p-8 rounded-2xl text-center shadow-sm hover:shadow-lg transition">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-red-900" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">100%</div>
              <div className="text-gray-600">Batik Original</div>
            </div>
          </div>
        </div>
      </section>

      {/* DETAIL CONTENT */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto space-y-8 text-lg text-gray-700 leading-relaxed">
          <p>
            Batik Sekarniti mulai berkembang pada tahun 2008. Pada awalnya, usaha ini 
            dikelola oleh istri pendiri dan berfokus pada penyediaan bahan batik tulis. 
            Dengan dedikasi tinggi dan komitmen terhadap kualitas, usaha kecil ini perlahan 
            mulai dikenal di komunitas lokal.
          </p>

          <p>
            Pada tahun 2009, Batik Sekarniti mendapatkan pembinaan dari pemerintah bersama 
            26 pelaku UKM lainnya. Dari sinilah usaha ini mulai memahami klasifikasi UMKM 
            dan memperkuat posisinya sebagai usaha mikro yang berpotensi. Pembinaan ini 
            membuka wawasan baru tentang pengelolaan bisnis, pemasaran, dan standar kualitas 
            produk.
          </p>

          <p>
            Tahun 2010 menjadi tonggak penting ketika Batik Sekarniti dipercaya untuk 
            mewakili daerah dalam pameran Manggar Fair di Kulon Progo. Kepercayaan ini 
            menjadi validasi atas kualitas dan dedikasi yang telah ditunjukkan selama ini. 
            Pameran tersebut membuka peluang networking dan memperluas jangkauan pasar.
          </p>

          <p>
            Pada tahun 2011, usaha ini berkembang dari penjualan bahan batik menjadi produk 
            jadi bernilai ekonomis seperti pakaian batik. Sejak saat itu, fokus usaha tidak 
            hanya pada produksi, tetapi juga pada nilai estetika dan kualitas. Setiap produk 
            dirancang dengan mempertimbangkan filosofi motif, kenyamanan, dan daya tahan.
          </p>

          <p>
            Seiring berjalannya waktu, Batik Sekarniti mendapatkan berbagai pembinaan dari 
            Dinas Koperasi DIY, universitas seperti UGM dan UMG, hingga kerja sama dengan 
            institusi luar negeri. Hal ini memperkuat Batik Sekarniti sebagai UMKM batik 
            yang berorientasi pada kualitas, edukasi, dan keberlanjutan.
          </p>

          <p>
            Hingga saat ini, Batik Sekarniti terus berkomitmen untuk melestarikan batik 
            tulis sebagai warisan budaya Indonesia, menghasilkan produk berkualitas tinggi, 
            dan mengembangkan pemasaran digital untuk menjangkau pasar yang lebih luas, 
            baik nasional maupun internasional.
          </p>
        </div>
      </section>
    </div>
  );
}