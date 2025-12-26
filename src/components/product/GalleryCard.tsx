import Image from 'next/image';
import Link from 'next/link';
import { ProductVariant } from '@/types/database';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/utils/currency';

interface GalleryCardProps {
    product: ProductVariant;
}

export default function GalleryCard({ product }: GalleryCardProps) {
    const { currency, exchangeRate } = useCurrency();
    const primaryImage = product.product_images?.[0]?.url_cloudinary;
    const name = product.product_groups?.name || `Product ${product.code}`;
    const brand = product.product_groups?.brands?.name;
    const category = product.product_groups?.product_types?.name;
    const inStock = product.inventory_current && product.inventory_current.quantity > 0;

    return (
        <Link
            href={`/product/${product.id}`}
            className="group block bg-white overflow-hidden transition-all duration-300 hover:shadow-xl"
        >
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden">
                {primaryImage && (
                    <Image
                        src={primaryImage}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                )}

                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Product Details Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <div className="space-y-2">
                        {category && (
                            <span
                                className="inline-block text-xs tracking-[0.15em] uppercase"
                                style={{ color: '#dbb58e' }}
                            >
                                {category}
                            </span>
                        )}

                        <h3
                            className="text-lg font-light text-white leading-tight"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            {name}
                        </h3>

                        {brand && (
                            <p className="text-xs text-white/70 font-light">
                                by {brand}
                            </p>
                        )}

                        <div className="flex items-center justify-between pt-2">
                            <span
                                className="text-sm font-light"
                                style={{ color: '#dbb58e' }}
                            >
                                {formatCurrency(product.price, currency, exchangeRate)}
                            </span>

                            <span
                                className="text-xs tracking-[0.1em] uppercase px-3 py-1 bg-white/20 backdrop-blur-sm text-white"
                            >
                                Ver
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stock Badge */}
                {!inStock && (
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 text-xs tracking-wider uppercase bg-black/70 text-white">
                            Agotado
                        </span>
                    </div>
                )}
            </div>

            {/* Basic Info (visible when not hovering) */}
            <div className="p-4 text-center transition-opacity duration-300 group-hover:opacity-0">
                <h3
                    className="text-sm font-light mb-1 truncate"
                    style={{ color: '#172e3c' }}
                >
                    {name}
                </h3>

                <span
                    className="text-sm font-light"
                    style={{ color: '#dbb58e' }}
                >
                    {formatCurrency(product.price, currency, exchangeRate)}
                </span>
            </div>
        </Link>
    );
}
