import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* ABOUT */}
          <div>
            <h3 className="text-white text-xl font-bold mb-4">Batik Sekarniti</h3>
            <p className="text-sm leading-relaxed">
              UMKM batik tulis dan cap yang berorientasi pada kualitas, 
              keaslian, dan keberlanjutan budaya Indonesia.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="text-white font-semibold mb-4">Menu</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-sm hover:text-white transition">Home</Link>
              <Link to="/sejarah" className="block text-sm hover:text-white transition">Sejarah</Link>
              <Link to="/filosofi" className="block text-sm hover:text-white transition">Filosofi & Visi</Link>
              <Link to="/shop" className="block text-sm hover:text-white transition">Shop</Link>
            </div>
          </div>

          {/* CONTACT */}
          <div>
            <h4 className="text-white font-semibold mb-4">Kontak</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">Temanggal, Wijimulyo, Nangggulan, Kulon Progo, DIY, Indonesia</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">+62 812-3456-7890</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">info@batiksekarniti.com</p>
              </div>
            </div>
          </div>

          {/* SOCIAL */}
          <div>
            <h4 className="text-white font-semibold mb-4">Ikuti Kami</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-900 transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-900 transition">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
          <p>&copy; 2025 Batik Sekarniti. Warisan Budaya Indonesia.</p>
        </div>
      </div>
    </footer>
  );
}