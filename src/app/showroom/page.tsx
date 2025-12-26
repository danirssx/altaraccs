"use client";

import { ProductVariant, ProductType } from "@/types/database";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getProductVariants, getProductTypes } from "@/lib/api/inventory";
import GalleryCard from "@/components/product/GalleryCard";

function ShowroomContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");

  const [products, setProducts] = useState<ProductVariant[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<number | null>(
    typeParam ? parseInt(typeParam) : null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Sync with URL parameter changes
  useEffect(() => {
    setSelectedType(typeParam ? parseInt(typeParam) : null);
    setCurrentPage(1); // Reset to first page when type changes
  }, [typeParam]);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, typesData] = await Promise.all([
        getProductVariants(),
        getProductTypes(),
      ]);

      // Filter products with valid images and stock
      const validProducts = productsData.filter((product) => {
        if (!product.product_images || product.product_images.length === 0)
          return false;
        const primaryImage = product.product_images[0];
        if (!primaryImage?.url_cloudinary?.includes("cloudinary.com"))
          return false;
        if (
          !product.inventory_current ||
          product.inventory_current.quantity <= 0
        )
          return false;
        return true;
      });

      setProducts(validProducts);
      setProductTypes(typesData);
    } catch (error) {
      console.error("Error loading showroom data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedType
    ? products.filter((p) => p.product_groups?.product_type_id === selectedType)
    : products;

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-cream">
      {/* Page Header */}
      <section className="py-16 border-b" style={{ borderColor: "#d6e2e2" }}>
        <div className="container mx-auto px-4 text-center">
          <span
            className="inline-block text-xs tracking-[0.3em] uppercase mb-4 font-light"
            style={{ color: "#dbb58e" }}
          >
            Nuestra Colección
          </span>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl mb-6"
            style={{
              fontFamily: "Playfair Display, serif",
              color: "#172e3c",
              fontWeight: 400,
            }}
          >
            El <span className="italic">Showroom</span>
          </h1>

          <p
            className="text-base font-light max-w-lg mx-auto"
            style={{ color: "#172e3c", opacity: 0.7 }}
          >
            Explora nuestra colección completa de piezas de joyería
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section
        className="py-8 border-b bg-white"
        style={{ borderColor: "#d6e2e2" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-6 py-2 text-sm tracking-[0.1em] uppercase transition-all duration-300 border ${
                selectedType === null
                  ? "bg-[#172e3c] text-[#fffff5] border-[#172e3c]"
                  : "bg-transparent text-[#172e3c] border-[#d6e2e2] hover:border-[#172e3c]"
              }`}
            >
              Todo
            </button>

            {productTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-6 py-2 text-sm tracking-[0.1em] uppercase transition-all duration-300 border ${
                  selectedType === type.id
                    ? "bg-[#172e3c] text-[#fffff5] border-[#172e3c]"
                    : "bg-transparent text-[#172e3c] border-[#d6e2e2] hover:border-[#172e3c]"
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-20">
              <div
                className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
                style={{ borderColor: "#172e3c" }}
              />
              <p
                className="mt-4 text-lg font-light"
                style={{ color: "#172e3c" }}
              >
                Cargando colección...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg font-light" style={{ color: "#172e3c" }}>
                No se encontraron productos en esta categoría.
              </p>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="text-center mb-12">
                <p
                  className="text-sm tracking-wider font-light"
                  style={{ color: "#172e3c", opacity: 0.7 }}
                >
                  Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "pieza" : "piezas"}
                </p>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {currentProducts.map((product) => (
                  <GalleryCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 md:mt-16">
                  {/* Mobile Pagination */}
                  <div className="flex md:hidden justify-center items-center gap-2">
                    {/* Previous Button - Mobile */}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 border transition-all duration-300 ${
                        currentPage === 1
                          ? "opacity-40 cursor-not-allowed border-[#d6e2e2] text-[#172e3c]"
                          : "border-[#172e3c] text-[#172e3c] hover:bg-[#172e3c] hover:text-[#fffff5]"
                      }`}
                    >
                      ←
                    </button>

                    {/* Current Page Indicator - Mobile */}
                    <div className="px-4 py-2 text-[#172e3c] text-sm">
                      Página {currentPage} de {totalPages}
                    </div>

                    {/* Next Button - Mobile */}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 border transition-all duration-300 ${
                        currentPage === totalPages
                          ? "opacity-40 cursor-not-allowed border-[#d6e2e2] text-[#172e3c]"
                          : "border-[#172e3c] text-[#172e3c] hover:bg-[#172e3c] hover:text-[#fffff5]"
                      }`}
                    >
                      →
                    </button>
                  </div>

                  {/* Desktop Pagination */}
                  <div className="hidden md:flex justify-center items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 border transition-all duration-300 ${
                        currentPage === 1
                          ? "opacity-40 cursor-not-allowed border-[#d6e2e2] text-[#172e3c]"
                          : "border-[#172e3c] text-[#172e3c] hover:bg-[#172e3c] hover:text-[#fffff5]"
                      }`}
                    >
                      ← Anterior
                    </button>

                    {/* Page Numbers */}
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                        // Show first page, last page, current page, and pages around current
                        const showPage =
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                        const showEllipsis =
                          (pageNum === currentPage - 2 && currentPage > 3) ||
                          (pageNum === currentPage + 2 && currentPage < totalPages - 2);

                        if (showEllipsis) {
                          return (
                            <span
                              key={pageNum}
                              className="px-2 py-2 text-[#172e3c]"
                            >
                              ...
                            </span>
                          );
                        }

                        if (!showPage) return null;

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`min-w-[40px] px-3 py-2 border transition-all duration-300 ${
                              currentPage === pageNum
                                ? "bg-[#172e3c] text-[#fffff5] border-[#172e3c]"
                                : "bg-transparent text-[#172e3c] border-[#d6e2e2] hover:border-[#172e3c]"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 border transition-all duration-300 ${
                        currentPage === totalPages
                          ? "opacity-40 cursor-not-allowed border-[#d6e2e2] text-[#172e3c]"
                          : "border-[#172e3c] text-[#172e3c] hover:bg-[#172e3c] hover:text-[#fffff5]"
                      }`}
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function ShowroomLoading() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <div
          className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: "#172e3c" }}
        />
        <p className="mt-4 text-lg font-light" style={{ color: "#172e3c" }}>
          Cargando showroom...
        </p>
      </div>
    </div>
  );
}

export default function ShowroomPage() {
  return (
    <Suspense fallback={<ShowroomLoading />}>
      <ShowroomContent />
    </Suspense>
  );
}
