"use client";

import { ProductVariant, Brand, ProductType } from "@/types/database";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { useState, useEffect, use, useCallback } from "react";
import {
  getProductVariant,
  getBrands,
  getProductTypes,
  updateProduct,
  uploadProductImage,
} from "@/lib/api/inventory";

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: productId } = use(params);
  const [product, setProduct] = useState<ProductVariant | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [productData, brandsData, typesData] = await Promise.all([
        getProductVariant(productId),
        getBrands(),
        getProductTypes(),
      ]);

      if (!productData) {
        notFound();
      }

      setProduct(productData);
      setBrands(brandsData);
      setProductTypes(typesData);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEditClick = () => {
    setShowEditForm(true);
  };

  const handleFormClose = () => {
    setShowEditForm(false);
    loadData();
  };

  const handleImageUploadClick = () => {
    setShowImageUpload(true);
  };

  const handleImageUploadClose = () => {
    setShowImageUpload(false);
    loadData();
  };

  const handleBarcodeSearch = () => {
    if (product?.code) {
      const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(product.code.toString())}`;
      window.open(searchUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const sortedImages =
    product.product_images?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const productGroup = product.product_groups;

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6">
        <Link href="/inventario" className="text-blue-600 hover:text-blue-800">
          ← Volver al inventario
        </Link>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          {sortedImages.length > 0 && sortedImages[0].url_cloudinary ? (
            <div className="space-y-4">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={sortedImages[0].url_cloudinary}
                  alt={sortedImages[0].alt_text || `Producto ${product.code}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>

              {sortedImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {sortedImages.slice(1).filter(img => img.url_cloudinary).map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded overflow-hidden bg-gray-100"
                    >
                      <Image
                        src={image.url_cloudinary!}
                        alt={
                          image.alt_text ||
                          `Producto ${product.code} - imagen ${index + 2}`
                        }
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 12.5vw"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Sin imagen disponible</span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-800">
              {productGroup?.name || `Producto ${product.code}`}
            </h1>
            <div className="space-y-2">
              <p className="text-gray-600">Código: {product.code}</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de barras (buscar imágenes)
                </label>
                <input
                  type="text"
                  value={product.code}
                  readOnly
                  onClick={handleBarcodeSearch}
                  className="w-full max-w-xs p-2 border border-gray-300 rounded bg-green-50 hover:bg-green-100 cursor-pointer transition-colors text-gray-800"
                  title="Click para buscar imágenes de este código"
                />
              </div>
            </div>
            {product.size && (
              <p className="text-gray-600">Tamaño: {product.size}</p>
            )}
            {product.color && (
              <p className="text-gray-600">Color: {product.color}</p>
            )}
          </div>

          {product.price && product.original_price !== product.price && (
            <p className="text-2xl text-green-600 mt-1">
              Nuestro Precio: ${product.price}
            </p>
          )}

          <div>
            {product.sale_price ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold text-red-600">
                  Precio Original: ${product.sale_price}
                </span>
                <span className="text-xl line-through text-gray-500">
                  ${product.original_price}
                </span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                  En oferta
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-800">
                Precio Original: ${product.original_price}
              </span>
            )}
          </div>

          <div className="space-y-4">
            {productGroup?.brands && (
              <div>
                <h3 className="font-semibold text-gray-800">Marca</h3>
                <p className="text-gray-700">{productGroup.brands.name}</p>
              </div>
            )}

            {productGroup?.product_types && (
              <div>
                <h3 className="font-semibold text-gray-800">
                  Tipo de producto
                </h3>
                <p className="text-gray-700">
                  {productGroup.product_types.name}
                </p>
              </div>
            )}

            {product.composition && (
              <div>
                <h3 className="font-semibold text-gray-800">Composición</h3>
                <p className="text-gray-700">{product.composition}</p>
              </div>
            )}

            {product.inventory_current && (
              <div>
                <h3 className="font-semibold text-gray-800">Disponibilidad</h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded font-medium ${product.inventory_current.quantity > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                      }`}
                  >
                    {product.inventory_current.quantity > 0
                      ? `${product.inventory_current.quantity} en stock`
                      : "Sin stock"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Última actualización:{" "}
                  {new Date(
                    product.inventory_current.updated_at,
                  ).toLocaleDateString("es-ES")}
                </p>
              </div>
            )}
          </div>

          {productGroup?.description && (
            <div>
              <h3 className="font-semibold mb-2 text-gray-800">Descripción</h3>
              <p className="text-gray-700 leading-relaxed">
                {productGroup.description}
              </p>
            </div>
          )}

          <div className="text-sm text-gray-500 border-t pt-4 space-y-1">
            {product.created_at && (
              <p>
                Creado:{" "}
                {new Date(product.created_at).toLocaleDateString("es-ES")}
              </p>
            )}
            {product.updated_at && (
              <p>
                Actualizado:{" "}
                {new Date(product.updated_at).toLocaleDateString("es-ES")}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleEditClick}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Editar producto
            </button>
            <button
              onClick={handleImageUploadClick}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Guardar imagen
            </button>
            <Link
              href="/inventario"
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
            >
              Volver al inventario
            </Link>
          </div>
        </div>
      </div>

      {showEditForm && (
        <ProductForm
          product={product}
          brands={brands}
          productTypes={productTypes}
          onClose={handleFormClose}
        />
      )}

      {showImageUpload && (
        <ImageUploadForm product={product} onClose={handleImageUploadClose} />
      )}
    </div>
  );
}

function ProductForm({
  product,
  brands,
  productTypes,
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
        <h2 className="text-xl font-bold mb-4">
          {product ? "Editar Producto" : "Agregar Producto"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!product && (
            <>
              <input
                type="text"
                placeholder="Nombre del grupo de producto"
                value={formData.groupName}
                onChange={(e) =>
                  setFormData({ ...formData, groupName: e.target.value })
                }
                required
                className="w-full p-2 border rounded"
              />

              <textarea
                placeholder="Descripción del grupo"
                value={formData.groupDescription}
                onChange={(e) =>
                  setFormData({ ...formData, groupDescription: e.target.value })
                }
                className="w-full p-2 border rounded"
              />

              <select
                value={formData.brandId}
                onChange={(e) =>
                  setFormData({ ...formData, brandId: Number(e.target.value) })
                }
                required
                className="w-full p-2 border rounded"
              >
                <option value={0}>Seleccionar marca</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>

              <select
                value={formData.productTypeId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    productTypeId: Number(e.target.value),
                  })
                }
                required
                className="w-full p-2 border rounded"
              >
                <option value={0}>Seleccionar tipo</option>
                {productTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </>
          )}

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
              {product ? "Actualizar" : "Crear"}
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

function ImageUploadForm({
  product,
  onClose,
}: {
  product: ProductVariant | null;
  onClose: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !product) {
      alert("Por favor selecciona una imagen");
      return;
    }

    try {
      setUploading(true);
      await uploadProductImage(selectedFile, product.id, altText);
      alert("Imagen subida exitosamente");
      onClose();
    } catch (error) {
      alert(
        "Error subiendo la imagen: " +
        (error instanceof Error ? error.message : "Error desconocido"),
      );
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Subir imagen para {product?.code}
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar imagen
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              required
              className="w-full p-2 border rounded text-gray-800"
            />
          </div>

          {previewUrl && (
            <div className="relative aspect-square w-full bg-gray-100 rounded overflow-hidden">
              <Image
                src={previewUrl}
                alt="Vista previa"
                fill
                className="object-cover"
                sizes="(max-width: 400px) 100vw, 400px"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto alternativo (opcional)
            </label>
            <input
              type="text"
              placeholder="Descripción de la imagen"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full p-2 border rounded text-gray-800"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? "Subiendo..." : "Subir imagen"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
