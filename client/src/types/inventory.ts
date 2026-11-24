export type Product = {
  id: string
  name: string
  sku: string
  barcode: string
  category: string
  manufacturer?: string
  description: string
  unit: string
  minStock: number
  imageUrl: string
  createdAt: string
}

export type Batch = {
  id: string
  productId: string
  batchNo: string
  manufacturingDate: string
  expiryDate: string
  purchaseDate?: string
  purchaseQuantity: number
  availableQuantity: number
  supplierName: string
  supplierContact: string
  purchasePrice: number
  branch: string
  receivedAt: string
}

export type ProductInput = Omit<Product, 'id' | 'createdAt'>

export type BatchInput = Omit<Batch, 'id' | 'receivedAt'>

export type ProductStockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'

export type BatchStatus = 'FRESH' | 'EXPIRING_SOON' | 'EXPIRED' | 'OUT_OF_STOCK'

export type InventoryRow = {
  batch: Batch
  product: Product
  days: number
  status: BatchStatus
}
