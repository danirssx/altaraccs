import Image from "next/image";
import Link from "next/link";
import { ProductVariant } from "@/types/database";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/utils/currency";

interface ProductCardProps {
  product: ProductVariant;
  showAddToCart?: boolean;
}

export default function ProductCard({
  product,
  showAddToCart = false,
}: ProductCardProps) {
  const { currency, exchangeRate } = useCurrency();
  const primaryImage =
    product.product_images && product.product_images.length > 0
      ? product.product_images[0]
      : null;

  const displayPrice = product.price;

  return (
    <Link href={`/product/${product.id}`} className="group block">
      {/* Image Container */}
      <div className="relative aspect-square mb-4 overflow-hidden bg-white">
        {primaryImage && primaryImage.url_cloudinary && (
          <Image
            src={primaryImage.url_cloudinary || ""}
            alt={
              primaryImage.alt_text || product.product_groups?.name || "Product"
            }
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        )}

        {/* Add to Cart Overlay (optional) */}
        {showAddToCart && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              className="px-6 py-3 text-sm tracking-widest transition-all"
              style={{
                backgroundColor: "#172e3c",
                color: "#fffff5",
              }}
              onClick={(e) => {
                e.preventDefault();
                // TODO: Add to cart functionality
                console.log("Add to cart:", product.id);
              }}
            >
              AGREGAR AL CARRITO
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="text-center">
        <h2
          className="text-base font-light mb-2 transition-colors group-hover:opacity-70"
          style={{ color: "#172e3c" }}
        >
          {product.product_groups?.name || `Product ${product.code}`}
        </h2>

        <div className="flex justify-center items-center gap-2">
          <span className="font-light" style={{ color: "#dbb58e" }}>
            {formatCurrency(displayPrice, currency, exchangeRate)}
          </span>
        </div>
      </div>
    </Link>
  );
}
