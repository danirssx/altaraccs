export interface Brand {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface ProductType {
  id: number
  name: string
}

export interface ProductGroup {
  id: number
  name: string
  description?: string
  brand_id: number
  product_type_id: number
  created_at?: string
  updated_at?: string
  brands?: Brand
  product_types?: ProductType
}

export interface ProductVariant {
  id: number
  product_group_id: number
  size?: string
  color?: string
  code: number
  price: number
  original_price?: number
  sale_price?: number
  composition?: string
  is_featured?: boolean
  created_at?: string
  updated_at?: string
  product_groups?: ProductGroup
  product_images?: ProductImage[]
  inventory_current?: InventoryCurrent
}

export interface ProductImage {
  id: number
  product_id: number
  url: string
  url_cloudinary?: string
  alt_text?: string
  sort_order: number
}

export interface InventoryCurrent {
  product_id: number
  quantity: number
  updated_at: string
}

export interface InventoryMovement {
  id: number
  product_id: number
  movement_type: 'IN' | 'OUT'
  quantity: number
  created_at: string
} 