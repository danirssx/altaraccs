"use client";

import { ProductVariant } from "@/types/database";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getProductVariant } from "@/lib/api/inventory";
import Link from "next/link";
import { use } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/utils/currency";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { currency, exchangeRate } = useCurrency();
  const [product, setProduct] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    loadProduct();
  }, [resolvedParams.id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await getProductVariant(resolvedParams.id);

      if (!productData) {
        setError("Product not found");
        return;
      }

      setProduct(productData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading product");
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
          <div className="text-xl font-light">Cargando...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#fffff5" }}
      >
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Producto no encontrado"}</p>
          <Link
            href="/showroom"
            className="px-6 py-2 transition-colors"
            style={{
              backgroundColor: "#172e3c",
              color: "#fffff5",
            }}
          >
            Volver a Productos
          </Link>
        </div>
      </div>
    );
  }

  const images = product.product_images || [];
  const selectedImage = images[selectedImageIndex];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fffff5" }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: "#d6e2e2" }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link href="/showroom">
              <button
                className="text-sm tracking-wider"
                style={{ color: "#172e3c" }}
              >
                ← BACK
              </button>
            </Link>
            <Image
              src="/logos/Altara.png"
              alt="Altara"
              width={150}
              height={50}
              priority
              className="object-contain"
            />
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Left Column - Images */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-square mb-4 bg-white overflow-hidden">
              {selectedImage && selectedImage.url_cloudinary && (
                <Image
                  src={selectedImage.url_cloudinary || ""}
                  alt={
                    selectedImage.alt_text ||
                    product.product_groups?.name ||
                    "Product"
                  }
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images
                  .filter((img) => img.url_cloudinary)
                  .map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square bg-white overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? "border-[#dbb58e]"
                          : "border-transparent hover:border-[#d6e2e2]"
                      }`}
                    >
                      <Image
                        src={image.url_cloudinary || ""}
                        alt={image.alt_text || `Product image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div>
            <h1
              className="text-3xl md:text-4xl font-light mb-4"
              style={{
                color: "#172e3c",
                fontFamily: "Playfair Display, serif",
              }}
            >
              {product.product_groups?.name || `Product ${product.code}`}
            </h1>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <span
                  className="text-2xl font-light"
                  style={{ color: "#dbb58e" }}
                >
                  {formatCurrency(product.price, currency, exchangeRate)}
                </span>
              </div>
            </div>

            {/* Description */}
            {product.product_groups?.description && (
              <div className="mb-8">
                <p
                  className="text-base leading-relaxed font-light"
                  style={{ color: "#172e3c" }}
                >
                  {product.product_groups.description}
                </p>
              </div>
            )}

            {/* Product Details */}
            <div
              className="border-t border-b py-6 mb-8"
              style={{ borderColor: "#d6e2e2" }}
            >
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span
                    className="font-light"
                    style={{ color: "#172e3c", opacity: 0.7 }}
                  >
                    Código de Producto:
                  </span>
                  <span className="font-light" style={{ color: "#172e3c" }}>
                    {product.code}
                  </span>
                </div>

                {product.product_groups?.brands && (
                  <div className="flex justify-between">
                    <span
                      className="font-light"
                      style={{ color: "#172e3c", opacity: 0.7 }}
                    >
                      Marca:
                    </span>
                    <span className="font-light" style={{ color: "#172e3c" }}>
                      {product.product_groups.brands.name}
                    </span>
                  </div>
                )}

                {product.product_groups?.product_types && (
                  <div className="flex justify-between">
                    <span
                      className="font-light"
                      style={{ color: "#172e3c", opacity: 0.7 }}
                    >
                      Categoría:
                    </span>
                    <span className="font-light" style={{ color: "#172e3c" }}>
                      {product.product_groups.product_types.name}
                    </span>
                  </div>
                )}

                {product.size && (
                  <div className="flex justify-between">
                    <span
                      className="font-light"
                      style={{ color: "#172e3c", opacity: 0.7 }}
                    >
                      Tamaño:
                    </span>
                    <span className="font-light" style={{ color: "#172e3c" }}>
                      {product.size}
                    </span>
                  </div>
                )}

                {product.color && (
                  <div className="flex justify-between">
                    <span
                      className="font-light"
                      style={{ color: "#172e3c", opacity: 0.7 }}
                    >
                      Color:
                    </span>
                    <span className="font-light" style={{ color: "#172e3c" }}>
                      {product.color}
                    </span>
                  </div>
                )}

                {product.inventory_current && (
                  <div className="flex justify-between">
                    <span
                      className="font-light"
                      style={{ color: "#172e3c", opacity: 0.7 }}
                    >
                      Disponibilidad:
                    </span>
                    <span
                      className="font-light"
                      style={{
                        color:
                          product.inventory_current.quantity > 0
                            ? "#4ade80"
                            : "#ef4444",
                      }}
                    >
                      {product.inventory_current.quantity > 0
                        ? "En Stock"
                        : "Agotado"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Button */}
            <div className="mb-8">
              <button
                className="w-full py-4 text-sm tracking-widest transition-all hover:opacity-90"
                style={{
                  backgroundColor: "#172e3c",
                  color: "#fffff5",
                }}
              >
                CONTACTAR POR WHATSAPP
              </button>
            </div>
          </div>
        </div>
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
              © {new Date().getFullYear()} Altara. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
