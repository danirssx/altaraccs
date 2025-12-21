'use client';

import { ProductVariant } from "@/types/database";
import { useState, useEffect } from "react";
import { getProductVariants } from "@/lib/api/inventory";
import ProductGrid from "@/components/product/ProductGrid";

export default function HomePage() {
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="py-12">
      {/* Title */}
      <div className="text-center mb-12">
        <h1
          className="text-4xl md:text-5xl font-light mb-4"
          style={{
            color: "#172e3c",
            fontFamily: "Playfair Display, serif",
          }}
        >
          Our Collection
        </h1>
        <p className="text-sm tracking-wider font-light" style={{ color: "#172e3c", opacity: 0.8 }}>
          Discover our exquisite jewelry pieces
        </p>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-4">
        <ProductGrid products={products} loading={loading} />
      </div>
    </div>
  );
}
