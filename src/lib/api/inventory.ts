import { ProductVariant, Brand, ProductType } from '@/types/database';

export async function getProductVariants(): Promise<ProductVariant[]> {
  const response = await fetch('/api/inventory');
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Error fetching products');
  }

  return result.data || [];
}

export async function getProductVariant(id: string): Promise<ProductVariant | null> {
  const response = await fetch(`/api/inventory/${id}`);
  const result = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(result.error || 'Error fetching product');
  }

  return result.data;
}

export async function getBrands(): Promise<Brand[]> {
  const response = await fetch('/api/brands');
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Error fetching brands');
  }

  return result.data || [];
}

export async function getProductTypes(): Promise<ProductType[]> {
  const response = await fetch('/api/product-types');
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Error fetching product types');
  }

  return result.data || [];
}

export async function getFeaturedProducts(): Promise<ProductVariant[]> {
  const response = await fetch('/api/inventory/featured');
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Error fetching featured products');
  }

  return result.data || [];
}

export async function updateProduct(productData: {
  product_id: number;
  size?: string;
  color?: string;
  code: number;
  price: number;
  original_price?: number;
  sale_price?: number;
  composition?: string;
  quantity: number;
}): Promise<void> {
  const response = await fetch('/api/inventory/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Error updating product');
  }
}

export async function uploadProductImage(
  file: File,
  productId: number,
  altText?: string
): Promise<{
  id: number;
  url: string;
  url_cloudinary: string;
  alt_text: string;
  sort_order: number;
  cloudinary: {
    public_id: string;
    secure_url: string;
  };
}> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('productId', productId.toString());
  if (altText) {
    formData.append('altText', altText);
  }

  const response = await fetch('/api/product-images', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Error uploading image');
  }

  return result.data;
}