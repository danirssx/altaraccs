"use client";

import { ProductVariant } from "@/types/database";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getProductVariants } from "@/lib/api/inventory";
import Link from "next/link";

export default function ShowroomPage() {
  const [products, setProducts] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getProductVariants();

      // Filter products with valid images and available stock
      const availableProducts = productsData.filter((product) => {
        // Must have product images
        if (!product.product_images || product.product_images.length === 0) {
          return false;
        }

        // Must have valid cloudinary URL
        const primaryImage = product.product_images[0];
        if (!primaryImage.url_cloudinary) {
          return false;
        }

        // Exclude test/invalid URLs
        const url = primaryImage.url_cloudinary.toLowerCase();
        if (
          url.includes("test-cloudinary-url.com") ||
          url.includes("example.com") ||
          url.includes("localhost")
        ) {
          return false;
        }

        // Must have valid cloudinary domain
        if (!url.includes("cloudinary.com")) {
          return false;
        }

        // Must have inventory
        if (!product.inventory_current || product.inventory_current.quantity <= 0) {
          return false;
        }

        return true;
      });

      setProducts(availableProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading products");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#fffff5" }}
      >
        <div className="text-center" style={{ color: "#172e3c" }}>
          <div className="text-xl font-light">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#fffff5" }}
      >
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fffff5" }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: "#d6e2e2" }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center">
            <Image
              src="/logos/Altara.png"
              alt="Altara"
              width={180}
              height={60}
              priority
              className="object-contain"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl font-light mb-4"
            style={{
              color: "#172e3c",
              fontFamily: "Playfair Display, serif",
            }}
          >
            Products
          </h1>
          <p className="text-sm tracking-wider" style={{ color: "#172e3c" }}>
            Showing {products.length} results
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/showroom/${product.id}`}
              className="group"
            >
              <div className="relative aspect-square mb-4 overflow-hidden bg-white">
                {product.product_images &&
                  product.product_images.length > 0 &&
                  product.product_images[0].url_cloudinary && (
                    <Image
                      src={product.product_images[0].url_cloudinary}
                      alt={
                        product.product_images[0].alt_text ||
                        product.product_groups?.name ||
                        "Product"
                      }
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                  )}

                {/* Sale Badge */}
                {/*{product.sale_price && (
                  <div
                    className="absolute top-4 right-4 px-3 py-1 text-xs tracking-wider"
                    style={{
                      backgroundColor: '#dbb58e',
                      color: '#fffff5'
                    }}
                  >
                    SALE
                  </div>
                )}*/}
              </div>

              <div className="text-center">
                <h2
                  className="text-base font-light mb-2 transition-colors"
                  style={{ color: "#172e3c" }}
                >
                  {product.product_groups?.name || `Product ${product.code}`}
                </h2>

                <div className="flex justify-center items-center gap-2">
                  <span className="font-light" style={{ color: "#dbb58e" }}>
                    ${product.sale_price}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg font-light" style={{ color: "#172e3c" }}>
              No products available at the moment.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="border-t mt-20"
        style={{
          borderColor: "#d6e2e2",
          backgroundColor: "#f7f1e3",
        }}
      >
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center">
            <Image
              src="/logos/Altara.png"
              alt="Altara"
              width={150}
              height={50}
              className="object-contain mb-6"
            />
            <p className="text-sm font-light" style={{ color: "#172e3c" }}>
              © {new Date().getFullYear()} Altara. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
