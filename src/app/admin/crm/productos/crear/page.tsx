"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Brand, ProductType } from "@/types/database";
import { getBrands, getProductTypes, createProduct, uploadProductImage } from "@/lib/api/inventory";
import { toast } from "sonner";

interface ImageFile {
  file: File;
  preview: string;
  altText: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    // Product Group
    groupName: "",
    groupDescription: "",
    brandId: 0,
    productTypeId: 0,

    // Product Variant
    size: "",
    color: "",
    code: "",
    price: "",
    originalPrice: "",
    salePrice: "",
    composition: "",

    // Inventory
    initialQuantity: "0",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [brandsData, typesData] = await Promise.all([
        getBrands(),
        getProductTypes(),
      ]);
      setBrands(brandsData);
      setProductTypes(typesData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar datos");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        newImages.push({
          file,
          preview: URL.createObjectURL(file),
          altText: "",
        });
      }
    }

    setImageFiles((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const updateImageAltText = (index: number, altText: string) => {
    setImageFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index].altText = altText;
      return newFiles;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.groupName.trim()) {
      toast.error("El nombre del producto es requerido");
      return;
    }
    if (!formData.brandId || formData.brandId === 0) {
      toast.error("Debe seleccionar una marca");
      return;
    }
    if (!formData.productTypeId || formData.productTypeId === 0) {
      toast.error("Debe seleccionar un tipo de producto");
      return;
    }
    if (!formData.code.trim()) {
      toast.error("El código es requerido");
      return;
    }
    if (!formData.price.trim() || parseFloat(formData.price) <= 0) {
      toast.error("El precio debe ser mayor a 0");
      return;
    }

    const code = parseInt(formData.code);
    if (isNaN(code)) {
      toast.error("El código debe ser un número válido");
      return;
    }

    try {
      setLoading(true);

      // Create product
      const product = await createProduct({
        groupName: formData.groupName.trim(),
        groupDescription: formData.groupDescription.trim() || undefined,
        brandId: formData.brandId,
        productTypeId: formData.productTypeId,
        size: formData.size.trim() || undefined,
        color: formData.color.trim() || undefined,
        code,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
        composition: formData.composition.trim() || undefined,
        initialQuantity: parseInt(formData.initialQuantity) || 0,
      });

      // Upload images if any
      if (imageFiles.length > 0) {
        toast.info("Subiendo imágenes...");
        for (const imageFile of imageFiles) {
          try {
            await uploadProductImage(
              imageFile.file,
              product.id,
              imageFile.altText || formData.groupName
            );
          } catch (error) {
            console.error("Error uploading image:", error);
            toast.error(`Error al subir una imagen: ${imageFile.file.name}`);
          }
        }
      }

      toast.success("Producto creado exitosamente");
      router.push(`/admin/crm/productos/${product.id}`);
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(error instanceof Error ? error.message : "Error al crear producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/crm/productos"
          className="text-sm font-medium hover:opacity-70 mb-4 inline-block"
          style={{ color: "#172e3c" }}
        >
          ← Volver a productos
        </Link>
        <h1
          className="text-3xl font-light mb-2"
          style={{
            color: "#172e3c",
            fontFamily: "Playfair Display, serif",
          }}
        >
          Crear Producto
        </h1>
        <p className="text-sm" style={{ color: "#172e3c", opacity: 0.7 }}>
          Complete la información del nuevo producto
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Product Group Section */}
          <div
            className="bg-white rounded-lg border p-6"
            style={{ borderColor: "#d6e2e2" }}
          >
            <h2
              className="text-lg font-medium mb-4"
              style={{ color: "#172e3c" }}
            >
              Información del Producto
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#172e3c" }}
                >
                  Nombre del Producto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.groupName}
                  onChange={(e) =>
                    setFormData({ ...formData, groupName: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{ borderColor: "#d6e2e2" }}
                  placeholder="Ej: Anillo de Oro"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#172e3c" }}
                >
                  Descripción
                </label>
                <textarea
                  value={formData.groupDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, groupDescription: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{ borderColor: "#d6e2e2" }}
                  rows={3}
                  placeholder="Descripción del producto"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#172e3c" }}
                  >
                    Marca <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.brandId}
                    onChange={(e) =>
                      setFormData({ ...formData, brandId: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    style={{ borderColor: "#d6e2e2" }}
                    required
                  >
                    <option value={0}>Seleccionar marca</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#172e3c" }}
                  >
                    Tipo de Producto <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.productTypeId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        productTypeId: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    style={{ borderColor: "#d6e2e2" }}
                    required
                  >
                    <option value={0}>Seleccionar tipo</option>
                    {productTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Product Variant Section */}
          <div
            className="bg-white rounded-lg border p-6"
            style={{ borderColor: "#d6e2e2" }}
          >
            <h2
              className="text-lg font-medium mb-4"
              style={{ color: "#172e3c" }}
            >
              Detalles de Variante
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#172e3c" }}
                  >
                    Talla
                  </label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) =>
                      setFormData({ ...formData, size: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    style={{ borderColor: "#d6e2e2" }}
                    placeholder="Ej: M, L, 7, 18cm"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#172e3c" }}
                  >
                    Color
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    style={{ borderColor: "#d6e2e2" }}
                    placeholder="Ej: Dorado, Plateado"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#172e3c" }}
                  >
                    Código <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    style={{ borderColor: "#d6e2e2" }}
                    placeholder="Código único"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#172e3c" }}
                  >
                    Precio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    style={{ borderColor: "#d6e2e2" }}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#172e3c" }}
                  >
                    Precio Original
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, originalPrice: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    style={{ borderColor: "#d6e2e2" }}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#172e3c" }}
                  >
                    Precio de Oferta
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) =>
                      setFormData({ ...formData, salePrice: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    style={{ borderColor: "#d6e2e2" }}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#172e3c" }}
                >
                  Composición
                </label>
                <textarea
                  value={formData.composition}
                  onChange={(e) =>
                    setFormData({ ...formData, composition: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{ borderColor: "#d6e2e2" }}
                  rows={2}
                  placeholder="Ej: Oro 18k, Plata 925"
                />
              </div>
            </div>
          </div>

          {/* Inventory Section */}
          <div
            className="bg-white rounded-lg border p-6"
            style={{ borderColor: "#d6e2e2" }}
          >
            <h2
              className="text-lg font-medium mb-4"
              style={{ color: "#172e3c" }}
            >
              Inventario Inicial
            </h2>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#172e3c" }}
              >
                Cantidad Inicial
              </label>
              <input
                type="number"
                min="0"
                value={formData.initialQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, initialQuantity: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg"
                style={{ borderColor: "#d6e2e2" }}
                placeholder="0"
              />
            </div>
          </div>

          {/* Images Section */}
          <div
            className="bg-white rounded-lg border p-6"
            style={{ borderColor: "#d6e2e2" }}
          >
            <h2
              className="text-lg font-medium mb-4"
              style={{ color: "#172e3c" }}
            >
              Imágenes del Producto
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  className="block w-full px-4 py-8 border-2 border-dashed rounded-lg text-center cursor-pointer hover:opacity-70 transition-opacity"
                  style={{ borderColor: "#d6e2e2" }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <div>
                    <svg
                      className="w-12 h-12 mx-auto mb-4"
                      style={{ color: "#172e3c", opacity: 0.4 }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <p style={{ color: "#172e3c" }}>
                      Haz clic para seleccionar imágenes
                    </p>
                    <p
                      className="text-sm mt-1"
                      style={{ color: "#172e3c", opacity: 0.6 }}
                    >
                      Puedes seleccionar múltiples imágenes
                    </p>
                  </div>
                </label>
              </div>

              {imageFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imageFiles.map((imageFile, index) => (
                    <div
                      key={index}
                      className="relative border rounded-lg p-2"
                      style={{ borderColor: "#d6e2e2" }}
                    >
                      <div className="relative aspect-square mb-2">
                        <Image
                          src={imageFile.preview}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <input
                        type="text"
                        value={imageFile.altText}
                        onChange={(e) =>
                          updateImageAltText(index, e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm border rounded"
                        style={{ borderColor: "#d6e2e2" }}
                        placeholder="Texto alternativo (opcional)"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Link
              href="/admin/crm/productos"
              className="px-6 py-2 border rounded-lg font-medium transition-opacity hover:opacity-70"
              style={{ borderColor: "#172e3c", color: "#172e3c" }}
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg text-white font-medium transition-opacity disabled:opacity-40"
              style={{ backgroundColor: "#172e3c" }}
            >
              {loading ? "Creando..." : "Crear Producto"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
