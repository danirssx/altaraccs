"use client";

import { ProductVariant, Brand, ProductType } from "@/types/database";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  getProductVariants,
  getBrands,
  getProductTypes,
  updateProduct,
} from "@/lib/api/inventory";

export default function InventarioPage() {
  const [products, setProducts] = useState<ProductVariant[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductVariant[]>(
    [],
  );
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductVariant | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [imageFilter, setImageFilter] = useState<
    "all" | "with-images" | "without-images"
  >("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, brandsData, typesData] = await Promise.all([
        getProductVariants(),
        getBrands(),
        getProductTypes(),
      ]);

      // Sort products: ones with images first
      const sortedProducts = productsData.sort((a, b) => {
        const aHasImages = a.product_images && a.product_images.length > 0;
        const bHasImages = b.product_images && b.product_images.length > 0;

        if (aHasImages && !bHasImages) return -1;
        if (!aHasImages && bHasImages) return 1;
        return 0;
      });

      setProducts(sortedProducts);
      setBrands(brandsData);
      setProductTypes(typesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  // Filter and search products
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((product) => {
        const productName = product.product_groups?.name?.toLowerCase() || "";
        const productCode = product.code.toString();
        const productId = product.id.toString();

        return (
          productName.includes(searchLower) ||
          productCode.includes(searchLower) ||
          productId.includes(searchLower)
        );
      });
    }

    // Apply image filter
    if (imageFilter === "with-images") {
      filtered = filtered.filter(
        (product) =>
          product.product_images && product.product_images.length > 0,
      );
    } else if (imageFilter === "without-images") {
      filtered = filtered.filter(
        (product) =>
          !product.product_images || product.product_images.length === 0,
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, imageFilter]);

  const handleEditProduct = (product: ProductVariant) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
    loadData();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 text-gray-800">
            <input
              type="text"
              placeholder="Buscar por ID, código o nombre del producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Image Filter */}
          <div className="sm:w-48 text-gray-800">
            <select
              value={imageFilter}
              onChange={(e) =>
                setImageFilter(
                  e.target.value as "all" | "with-images" | "without-images",
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            >
              <option value="all">Todos</option>
              <option value="with-images">Con imágenes</option>
              <option value="without-images">Sin imágenes</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            Mostrando {filteredProducts.length} de {products.length} productos
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-blue-600 hover:text-blue-800"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          brands={brands}
          productTypes={productTypes}
          onClose={handleFormClose}
        />
      )}

      <div className="max-h-screen overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() =>
                (window.location.href = `/inventario/${product.id}`)
              }
            >
              <div className="mb-4 relative h-48 rounded overflow-hidden bg-gray-100">
                {product.product_images &&
                  product.product_images.length > 0 &&
                  product.product_images[0].url_cloudinary ? (
                  <Image
                    src={product.product_images[0].url_cloudinary}
                    alt={
                      product.product_images[0].alt_text ||
                      `Producto ${product.code}`
                    }
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50 border-2 border-dashed border-gray-200">
                    <svg
                      className="w-12 h-12 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-xs text-center">Sin imagen</span>
                  </div>
                )}
              </div>

              <h2 className="text-xl font-semibold mb-2 text-gray-800">
                {product.product_groups?.name || `Producto ${product.code}`}
              </h2>

              <p className="text-sm text-gray-600 mb-2">Id: {product.id}</p>

              <p className="text-sm text-gray-600 mb-2">
                Código: {product.code}
              </p>

              {product.size && (
                <p className="text-sm text-gray-600 mb-1">
                  Tamaño: {product.size}
                </p>
              )}
              {product.color && (
                <p className="text-sm text-gray-600 mb-1">
                  Color: {product.color}
                </p>
              )}

              <div className="flex justify-between text-sm text-gray-500 mb-2">
                {product.product_groups?.brands && (
                  <span>Marca: {product.product_groups.brands.name}</span>
                )}
                {product.product_groups?.product_types && (
                  <span>Tipo: {product.product_groups.product_types.name}</span>
                )}
              </div>

              <div className="flex justify-between text-lg text-green-700 mb-2">
                <span>Nuestro precio: {product.price}</span>
              </div>

              <div className="mb-2">
                {product.sale_price ? (
                  <div className="flex items-center gap-2 text-md">
                    <span className=" font-bold text-red-600">
                      Precio orig: ${product.sale_price} -
                    </span>
                    <span className=" line-through text-gray-500">
                      ${product.original_price}
                    </span>
                  </div>
                ) : (
                  <span className="text-md font-bold text-gray-800">
                    Precio original: ${product.original_price}
                  </span>
                )}
              </div>

              {product.inventory_current && (
                <div className="text-sm mb-4">
                  <span
                    className={`px-2 py-1 rounded ${product.inventory_current.quantity > 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                      }`}
                  >
                    Stock: {product.inventory_current.quantity}
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditProduct(product);
                  }}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                >
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && products.length > 0 && (
          <div className="text-center py-12 col-span-full">
            <p className="text-gray-500">
              {searchTerm
                ? `No se encontraron productos que coincidan con "${searchTerm}"`
                : "No hay productos que coincidan con los filtros seleccionados."}
            </p>
            {(searchTerm || imageFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setImageFilter("all");
                }}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Mostrar todos los productos
              </button>
            )}
          </div>
        )}

        {products.length === 0 && !loading && (
          <div className="text-center py-12 col-span-full">
            <p className="text-gray-500">No hay productos en el inventario.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductForm({
  product,
  brands: _brands,
  productTypes: _productTypes,
  onClose,
}: {
  product: ProductVariant | null;
  brands: Brand[];
  productTypes: ProductType[];
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    product_group_id: product?.product_group_id || 0,
    size: product?.size || "",
    color: product?.color || "",
    code: product?.code || 0,
    price: product?.price || 0,
    original_price: product?.original_price || 0,
    sale_price: product?.sale_price || 0,
    composition: product?.composition || "",
    groupName: product?.product_groups?.name || "",
    groupDescription: product?.product_groups?.description || "",
    brandId: product?.product_groups?.brand_id || 0,
    productTypeId: product?.product_groups?.product_type_id || 0,
    quantity: product?.inventory_current?.quantity || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (product) {
        await updateProductData();
        onClose();
      } else {
        alert("Error: No se puede crear productos, solo editar.");
      }
    } catch (err) {
      alert(
        "Error: " + (err instanceof Error ? err.message : "Error desconocido"),
      );
    }
  };

  const updateProductData = async () => {
    if (!product) return;

    await updateProduct({
      product_id: product.id,
      size: formData.size || undefined,
      color: formData.color || undefined,
      code: formData.code,
      price: formData.price,
      original_price: formData.original_price || undefined,
      sale_price: formData.sale_price || undefined,
      composition: formData.composition || undefined,
      quantity: formData.quantity,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 text-gray-800">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Editar Producto</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Tamaño"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            className="w-full p-2 border rounded"
          />

          <input
            type="text"
            placeholder="Color"
            value={formData.color}
            onChange={(e) =>
              setFormData({ ...formData, color: e.target.value })
            }
            className="w-full p-2 border rounded"
          />

          <input
            type="number"
            placeholder="Código"
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: Number(e.target.value) })
            }
            required
            className="w-full p-2 border rounded"
          />

          <input
            type="number"
            step="0.01"
            placeholder="Precio"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: Number(e.target.value) })
            }
            required
            className="w-full p-2 border rounded"
          />

          <input
            type="number"
            step="0.01"
            placeholder="Precio original"
            value={formData.original_price}
            onChange={(e) =>
              setFormData({
                ...formData,
                original_price: Number(e.target.value),
              })
            }
            className="w-full p-2 border rounded"
          />

          <input
            type="number"
            step="0.01"
            placeholder="Precio de oferta"
            value={formData.sale_price}
            onChange={(e) =>
              setFormData({ ...formData, sale_price: Number(e.target.value) })
            }
            className="w-full p-2 border rounded"
          />

          <input
            type="text"
            placeholder="Composición"
            value={formData.composition}
            onChange={(e) =>
              setFormData({ ...formData, composition: e.target.value })
            }
            className="w-full p-2 border rounded"
          />

          <input
            type="number"
            placeholder="Cantidad en inventario"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: Number(e.target.value) })
            }
            className="w-full p-2 border rounded"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Actualizar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
