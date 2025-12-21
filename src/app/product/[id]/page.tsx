"use client";

import { ProductVariant } from "@/types/database";
import { useState, useEffect } from "react";
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

    // Open cart drawer
    openCart();

    // Reset quantity
    setQuantity(1);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 mb-4"
            style={{ borderColor: "#172e3c" }}
          ></div>
          <p className="text-xl font-light" style={{ color: "#172e3c" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error || "Product not found"}</p>
        <Link
          href="/"
          className="px-6 py-3 text-sm tracking-widest transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "#172e3c",
            color: "#fffff5",
          }}
        >
          BACK TO PRODUCTS
        </Link>
      </div>
    );
  }

  const images = product.product_images || [];
  const selectedImage = images[selectedImageIndex];
  const displayPrice = product.price;
  const inStock =
    product.inventory_current && product.inventory_current.quantity > 0;
  const availableStock = product.inventory_current?.quantity || 0;

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm font-light hover:opacity-70 transition-opacity"
            style={{ color: "#172e3c" }}
          >
            ← Back to Collection
          </Link>
        </div>

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
                  {formatPrice(displayPrice)}
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
                    Product Code:
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
                      Brand:
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
                      Category:
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
                      Size:
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

                <div className="flex justify-between">
                  <span
                    className="font-light"
                    style={{ color: "#172e3c", opacity: 0.7 }}
                  >
                    Availability:
                  </span>
                  <span
                    className="font-light"
                    style={{
                      color: inStock ? "#4ade80" : "#ef4444",
                    }}
                  >
                    {inStock
                      ? `In Stock (${availableStock} available)`
                      : "Out of Stock"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            {inStock && (
              <div className="mb-6">
                <label
                  className="block text-sm font-light mb-2"
                  style={{ color: "#172e3c" }}
                >
                  Quantity
                </label>
                <div
                  className="flex items-center gap-3 border w-fit"
                  style={{ borderColor: "#d6e2e2" }}
                >
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 hover:bg-gray-100 transition-colors"
                    style={{ color: "#172e3c" }}
                  >
                    −
                  </button>
                  <span
                    className="text-base font-light px-4"
                    style={{ color: "#172e3c" }}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(availableStock, quantity + 1))
                    }
                    className="px-4 py-3 hover:bg-gray-100 transition-colors"
                    style={{ color: "#172e3c" }}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="mb-4">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="w-full py-4 text-sm tracking-widest transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "#172e3c",
                  color: "#fffff5",
                }}
              >
                {inStock ? "ADD TO CART" : "OUT OF STOCK"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
