"use client";

import { useState, useEffect } from "react";
import { ProductVariant } from "@/types/database";
import Image from "next/image";
import { getProductVariant } from "@/lib/api/inventory";
import Link from "next/link";
import { use } from "react";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import { formatPrice } from "@/utils/formatters";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { addItem, openCart } = useCartStore();

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

  const handleAddToCart = () => {
    if (!product) return;

    const primaryImage =
      product.product_images && product.product_images.length > 0
        ? product.product_images[0].url_cloudinary || ""
        : "";

    const price = product.price;

    addItem({
      productId: product.id,
      productName: product.product_groups?.name || `Product ${product.code}`,
      productCode: product.code,
      price: price,
      quantity: quantity,
      imageUrl: primaryImage,
      size: product.size || undefined,
      color: product.color || undefined,
    });

    toast.success("Added to cart!", {
      description: `${quantity} ${quantity === 1 ? "item" : "items"} added to your cart`,
    });

    openCart();
    setQuantity(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 mb-4"
            style={{ borderColor: "#172e3c" }}
          />
          <p className="text-xl font-light" style={{ color: "#172e3c" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
        <p className="text-red-600 mb-6 text-lg">{error || "Product not found"}</p>
        <Link
          href="/showroom"
          className="px-8 py-4 text-sm tracking-[0.2em] uppercase transition-all hover:opacity-90"
          style={{
            backgroundColor: "#172e3c",
            color: "#fffff5",
          }}
        >
          Back to Showroom
        </Link>
      </div>
    );
  }

  const images = product.product_images || [];
  const selectedImage = images[selectedImageIndex];
  const inStock = product.inventory_current && product.inventory_current.quantity > 0;
  const availableStock = product.inventory_current?.quantity || 0;
  const name = product.product_groups?.name || `Product ${product.code}`;
  const brand = product.product_groups?.brands?.name;
  const category = product.product_groups?.product_types?.name;

  return (
    <div className="min-h-screen bg-cream">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-6">
        <nav className="flex items-center gap-2 text-sm font-light" style={{ color: "#172e3c" }}>
          <Link href="/" className="hover:opacity-70 transition-opacity">
            Home
          </Link>
          <span style={{ opacity: 0.5 }}>/</span>
          <Link href="/showroom" className="hover:opacity-70 transition-opacity">
            Showroom
          </Link>
          {category && (
            <>
              <span style={{ opacity: 0.5 }}>/</span>
              <span style={{ opacity: 0.7 }}>{category}</span>
            </>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 max-w-7xl mx-auto">

          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[4/5] bg-white overflow-hidden shadow-lg">
              {selectedImage && selectedImage.url_cloudinary && (
                <Image
                  src={selectedImage.url_cloudinary}
                  alt={selectedImage.alt_text || name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {images
                  .filter((img) => img.url_cloudinary)
                  .map((image, index) => (
                    <button
                      key={image.id ?? `thumb-${index}`}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square bg-white overflow-hidden transition-all duration-300 ${selectedImageIndex === index
                        ? "ring-2 ring-[#dbb58e] shadow-md"
                        : "opacity-70 hover:opacity-100"
                        }`}
                    >
                      <Image
                        src={image.url_cloudinary || ""}
                        alt={image.alt_text || `View ${index + 1}`}
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
          <div className="lg:py-8">
            {/* Category & Brand */}
            <div className="mb-4">
              {category && (
                <span
                  className="text-xs tracking-[0.3em] uppercase font-light"
                  style={{ color: "#dbb58e" }}
                >
                  {category}
                </span>
              )}
            </div>

            {/* Product Name */}
            <h1
              className="text-3xl md:text-4xl lg:text-5xl mb-4 leading-tight"
              style={{
                color: "#172e3c",
                fontFamily: "Playfair Display, serif",
                fontWeight: 400,
              }}
            >
              {name}
            </h1>

            {/* Brand */}
            {brand && (
              <p
                className="text-sm font-light mb-6"
                style={{ color: "#172e3c", opacity: 0.7 }}
              >
                by {brand}
              </p>
            )}

            {/* Price */}
            <div className="mb-8">
              <span
                className="text-2xl md:text-3xl font-light"
                style={{ color: "#dbb58e" }}
              >
                {formatPrice(product.price)}
              </span>
            </div>

            {/* Description */}
            {product.product_groups?.description && (
              <div className="mb-8">
                <p
                  className="text-base leading-relaxed font-light"
                  style={{ color: "#172e3c", opacity: 0.8 }}
                >
                  {product.product_groups.description}
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="border-t mb-8" style={{ borderColor: "#d6e2e2" }} />

            {/* Product Details */}
            <div className="space-y-4 mb-8">
              <h3
                className="text-xs tracking-[0.2em] uppercase font-medium mb-4"
                style={{ color: "#172e3c" }}
              >
                Details
              </h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-light" style={{ color: "#172e3c", opacity: 0.6 }}>
                    Product Code
                  </span>
                  <p className="font-light mt-1" style={{ color: "#172e3c" }}>
                    {product.code}
                  </p>
                </div>

                {product.size && (
                  <div>
                    <span className="font-light" style={{ color: "#172e3c", opacity: 0.6 }}>
                      Size
                    </span>
                    <p className="font-light mt-1" style={{ color: "#172e3c" }}>
                      {product.size}
                    </p>
                  </div>
                )}

                {product.color && (
                  <div>
                    <span className="font-light" style={{ color: "#172e3c", opacity: 0.6 }}>
                      Color
                    </span>
                    <p className="font-light mt-1" style={{ color: "#172e3c" }}>
                      {product.color}
                    </p>
                  </div>
                )}

                {product.composition && (
                  <div className="col-span-2">
                    <span className="font-light" style={{ color: "#172e3c", opacity: 0.6 }}>
                      Composition
                    </span>
                    <p className="font-light mt-1" style={{ color: "#172e3c" }}>
                      {product.composition}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Availability */}
            <div className="mb-8">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <span
                  className="text-sm font-light"
                  style={{ color: inStock ? "#22c55e" : "#ef4444" }}
                >
                  {inStock ? `In Stock (${availableStock} available)` : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            {inStock && (
              <div className="mb-6">
                <label
                  className="block text-xs tracking-[0.15em] uppercase font-light mb-3"
                  style={{ color: "#172e3c" }}
                >
                  Quantity
                </label>
                <div
                  className="inline-flex items-center border"
                  style={{ borderColor: "#d6e2e2" }}
                >
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-5 py-3 hover:bg-gray-50 transition-colors text-lg"
                    style={{ color: "#172e3c" }}
                  >
                    −
                  </button>
                  <span
                    className="px-6 py-3 text-base font-light border-x"
                    style={{ color: "#172e3c", borderColor: "#d6e2e2" }}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                    className="px-5 py-3 hover:bg-gray-50 transition-colors text-lg"
                    style={{ color: "#172e3c" }}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="w-full py-5 text-sm tracking-[0.2em] uppercase transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "#172e3c",
                color: "#fffff5",
              }}
            >
              {inStock ? "Add to Cart" : "Out of Stock"}
            </button>

            {/* Additional Info */}
            <div className="mt-8 pt-8 border-t" style={{ borderColor: "#d6e2e2" }}>
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <svg
                    className="w-6 h-6 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: "#dbb58e" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-xs font-light" style={{ color: "#172e3c", opacity: 0.7 }}>
                    Free Shipping
                  </p>
                </div>
                <div>
                  <svg
                    className="w-6 h-6 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: "#dbb58e" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="text-xs font-light" style={{ color: "#172e3c", opacity: 0.7 }}>
                    Secure Payment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
