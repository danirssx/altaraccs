"use client";

import { ProductVariant } from "@/types/database";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFeaturedProducts } from "@/lib/api/inventory";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/utils/currency";

export default function FeaturedProducts() {
  const { currency, exchangeRate } = useCurrency();
  const [products, setProducts] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      const data = await getFeaturedProducts();
      setProducts(data.slice(0, 8)); // Limit to 8 featured products
    } catch (error) {
      console.error("Error loading featured products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div
              className="inline-block animate-spin rounded-full h-10 w-10 border-b-2"
              style={{ borderColor: "#172e3c" }}
            />
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span
            className="inline-block text-xs tracking-[0.3em] uppercase mb-4 font-light"
            style={{ color: "#dbb58e" }}
          >
            Selección Curada
          </span>

          <h2
            className="text-3xl md:text-4xl lg:text-5xl mb-4"
            style={{
              fontFamily: "Playfair Display, serif",
              color: "#172e3c",
              fontWeight: 400,
            }}
          >
            <span className="italic">Piezas</span> Destacadas
          </h2>

          <p
            className="text-base font-light max-w-lg mx-auto"
            style={{ color: "#172e3c", opacity: 0.7 }}
          >
            Tesoros seleccionados de nuestra colección exclusiva
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {products.map((product) => {
            const primaryImage = product.product_images?.[0]?.url_cloudinary;
            const name =
              product.product_groups?.name || `Product ${product.code}`;

            return (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group block"
              >
                {/* Image Container */}
                <div className="relative aspect-square mb-4 overflow-hidden bg-cream">
                  {primaryImage && (
                    <Image
                      src={primaryImage}
                      alt={name}
                      fill
                      className="object-cover transition-all duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />

                  {/* Quick View Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span
                      className="px-6 py-3 text-xs tracking-[0.15em] uppercase bg-white/90 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0 translate-y-4"
                      style={{ color: "#172e3c" }}
                    >
                      Ver Detalles
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="text-center">
                  <h3
                    className="text-sm font-light mb-2 transition-colors duration-300 group-hover:opacity-70"
                    style={{ color: "#172e3c" }}
                  >
                    {name}
                  </h3>

                  <span
                    className="text-sm font-light"
                    style={{ color: "#dbb58e" }}
                  >
                    {formatCurrency(product.price, currency, exchangeRate)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/showroom"
            className="inline-block px-12 py-4 text-sm tracking-[0.2em] uppercase border transition-all duration-300 hover:bg-[#4a80a1] hover:text-[#fffff5] hover:border-[#172e3c]"
            style={{
              borderColor: "#172e3c",
              color: "#172e3c",
            }}
          >
            Ver Todas las Piezas
          </Link>
        </div>
      </div>
    </section>
  );
}
