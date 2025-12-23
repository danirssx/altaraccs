import { ProductVariant } from '@/types/database';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: ProductVariant[];
  loading?: boolean;
  showAddToCart?: boolean;
}

export default function ProductGrid({ products, loading = false, showAddToCart = false }: ProductGridProps) {
  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#172e3c' }}></div>
        <p className="mt-4 text-lg font-light" style={{ color: '#172e3c' }}>
          Cargando productos...
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg font-light" style={{ color: '#172e3c' }}>
          No hay productos disponibles en este momento.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Product Count */}
      <div className="text-center mb-8">
        <p className="text-sm tracking-wider font-light" style={{ color: '#172e3c' }}>
          Mostrando {products.length} {products.length === 1 ? 'resultado' : 'resultados'}
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showAddToCart={showAddToCart}
          />
        ))}
      </div>
    </>
  );
}
