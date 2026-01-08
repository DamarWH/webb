import { Sparkles, Target, CheckCircle2 } from 'lucide-react';

export default function Filosofi() {
  const misiList = [
    'Melestarikan batik tulis sebagai warisan budaya Indonesia',
    'Menghasilkan produk batik berkualitas tinggi dan bernilai estetika',
    'Meningkatkan kepercayaan konsumen melalui mutu dan ketepatan layanan',
    'Mengembangkan pemasaran digital dan penjualan online',
    'Mendukung edukasi, riset, dan kolaborasi dengan akademisi dan komunitas'
  ];

  return (
    <div className="bg-white pt-20">
      
      {/* HERO */}
      <section className="py-24 px-6 bg-gradient-to-br from-red-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block px-5 py-2 bg-red-100 text-red-900 text-sm font-semibold rounded-full mb-6">
            Nilai & Filosofi
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Filosofi, Visi & Misi
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Batik bukan sekadar kain bermotif, melainkan warisan budaya bangsa 
            yang sarat makna, cerita, dan filosofi mendalam.
          </p>
        </div>
      </section>

      {/* FILOSOFI BATIK */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-red-900" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900">Filosofi Batik</h2>
          </div>

          <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
            <p>
              Batik bukan sekadar kain bermotif, melainkan warisan budaya bangsa yang 
              telah diakui UNESCO. Menurut UNESCO, batik adalah proses pewarnaan kain 
              menggunakan perintang lilin (malam) melalui tahapan menggambar, membatik, 
              mewarnai, dan merebus kain hingga menghasilkan motif khas yang indah dan 
              penuh makna.
            </p>

            <p>
              Batik Sekarniti menjunjung tinggi nilai keaslian batik tulis. Setiap motif 
              memiliki makna, cerita, dan filosofi yang mencerminkan kearifan lokal 
              Indonesia. Kami percaya bahwa batik bukan hanya produk fashion, tetapi juga 
              medium untuk menyampaikan nilai-nilai budaya, sejarah, dan identitas bangsa.
            </p>

            <p>
              Perbedaan antara batik tulis, batik cap, dan batik printing menjadi perhatian 
              utama dalam menjaga mutu dan kepercayaan konsumen. Batik tulis dikerjakan 
              sepenuhnya dengan tangan menggunakan canting, batik cap menggunakan stempel 
              logam, sedangkan batik printing adalah hasil sablon. Ketiga jenis ini memiliki 
              keunikan dan nilai tersendiri.
            </p>

            <p>
              Keaslian, kualitas, dan kejujuran kepada konsumen merupakan filosofi utama 
              yang selalu dijaga dalam setiap proses produksi. Kami berkomitmen untuk 
              transparan dalam setiap produk yang kami hasilkan, memastikan konsumen 
              mendapatkan batik original sesuai dengan yang dijanjikan.
            </p>
          </div>
        </div>
      </section>

      {/* VISI */}
      <section className="py-24 px-6 bg-gradient-to-br from-red-900 to-red-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Target className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Visi Kami</h2>
          
          <div className="bg-white/10 backdrop-blur-sm p-10 rounded-3xl">
            <p className="text-2xl leading-relaxed font-light">
              Menjadi pelaku UMKM batik yang berdaya saing nasional dan internasional 
              dengan tetap menjaga keaslian, kualitas, dan nilai budaya batik Indonesia.
            </p>
          </div>
        </div>
      </section>

      {/* MISI */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-red-900" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900">Misi Kami</h2>
          </div>

          <div className="space-y-6">
            {misiList.map((misi, index) => (
              <div 
                key={index} 
                className="flex gap-6 items-start bg-gray-50 p-6 rounded-2xl hover:shadow-lg transition group"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-red-900 text-white rounded-full flex items-center justify-center font-bold text-lg group-hover:scale-110 transition">
                  {index + 1}
                </div>
                <p className="text-lg text-gray-700 leading-relaxed pt-1">
                  {misi}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NILAI-NILAI */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nilai-Nilai Kami
            </h2>
            <p className="text-xl text-gray-600">
              Prinsip yang kami pegang teguh dalam setiap langkah
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Keaslian</h3>
              <p className="text-gray-600 leading-relaxed">
                Menjaga keaslian batik tulis dan cap sebagai warisan budaya yang harus dilestarikan
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Kualitas</h3>
              <p className="text-gray-600 leading-relaxed">
                Menghasilkan produk berkualitas tinggi dengan perhatian detail pada setiap prosesnya
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Kepercayaan</h3>
              <p className="text-gray-600 leading-relaxed">
                Membangun kepercayaan konsumen melalui kejujuran dan ketepatan layanan
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

