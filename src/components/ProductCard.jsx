import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const imageUrl = product.foto?.startsWith('http') 
    ? product.foto 
    : `http://103.175.219.112:3000${product.foto}`;

  return (
    <Link 
      to={`/product/${product.id}`}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={product.nama}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400?text=Batik+Sekarniti';
          }}
        />
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-red-900 transition">
          {product.nama}
        </h3>
        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
          {product.deskripsi || 'Batik tulis berkualitas tinggi'}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xl font-bold text-red-900">
            Rp {Number(product.harga).toLocaleString('id-ID')}
          </p>
          <span className="text-sm text-gray-500">Stok: {product.stok}</span>
        </div>
      </div>
    </Link>
  );
}
