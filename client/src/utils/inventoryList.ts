import type { Batch, BatchStatus, InventoryRow, Product, ProductStockStatus } from '@/types/inventory'
import {
  buildInventoryRows,
  earliestExpiry,
  getProductStockStatus,
  totalAvailableQuantity,
} from './inventory'

// Pure list helpers shared by the Products and Batches pages so filtering,
// sorting and stats stay identical everywhere and remain easy to unit test.

export type ProductRow = {
  product: Product
  available: number
  batchCount: number
  earliestExpiry: string | null
  stockStatus: ProductStockStatus
}

export type ProductSortKey = 'name_asc' | 'name_desc' | 'stock_asc' | 'expiry_asc' | 'newest'

export type ProductListOptions = {
  search: string
  category: string
  stock: ProductStockStatus | 'ALL'
  sort: ProductSortKey
}

export type ProductStats = {
  total: number
  lowStock: number
  outOfStock: number
  unitsAvailable: number
}

export function buildProductRows(products: Product[], batches: Batch[]): ProductRow[] {
  return products.map(product => {
    const available = totalAvailableQuantity(batches, product.id)
    return {
      product,
      available,
      batchCount: batches.filter(b => b.productId === product.id).length,
      earliestExpiry: earliestExpiry(batches, product.id),
      stockStatus: getProductStockStatus(available, product.minStock),
    }
  })
}

export function productStats(rows: ProductRow[]): ProductStats {
  return {
    total: rows.length,
    lowStock: rows.filter(r => r.stockStatus === 'LOW_STOCK').length,
    outOfStock: rows.filter(r => r.stockStatus === 'OUT_OF_STOCK').length,
    unitsAvailable: rows.reduce((total, r) => total + r.available, 0),
  }
}

export function filterAndSortProducts(rows: ProductRow[], options: ProductListOptions): ProductRow[] {
  const query = options.search.trim().toLowerCase()

  const filtered = rows.filter(row => {
    if (options.category && row.product.category !== options.category) return false
    if (options.stock !== 'ALL' && row.stockStatus !== options.stock) return false
    if (!query) return true
    const haystack = [
      row.product.name,
      row.product.sku,
      row.product.barcode,
      row.product.category,
      row.product.manufacturer ?? '',
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(query)
  })

  const byName = (a: ProductRow, b: ProductRow) => a.product.name.localeCompare(b.product.name)

  switch (options.sort) {
    case 'name_desc':
      return filtered.sort((a, b) => byName(b, a))
    case 'stock_asc':
      return filtered.sort((a, b) => a.available - b.available || byName(a, b))
    case 'expiry_asc':
      return filtered.sort((a, b) => {
        if (a.earliestExpiry === b.earliestExpiry) return byName(a, b)
        if (a.earliestExpiry === null) return 1
        if (b.earliestExpiry === null) return -1
        return a.earliestExpiry.localeCompare(b.earliestExpiry)
      })
    case 'newest':
      return filtered.sort((a, b) => b.product.createdAt.localeCompare(a.product.createdAt))
    case 'name_asc':
    default:
      return filtered.sort(byName)
  }
}

export type BatchSortKey = 'expiry_asc' | 'expiry_desc' | 'received_desc' | 'qty_desc'

export type BatchListOptions = {
  search: string
  status: BatchStatus | 'ALL'
  productId: string
  sort: BatchSortKey
}

export type BatchStats = {
  total: number
  expiringSoon: number
  expired: number
  outOfStock: number
  unitsAvailable: number
}

export function buildBatchRows(products: Product[], batches: Batch[], today = new Date()): InventoryRow[] {
  return buildInventoryRows(products, batches, today)
}

export function batchStats(rows: InventoryRow[]): BatchStats {
  return {
    total: rows.length,
    expiringSoon: rows.filter(r => r.status === 'EXPIRING_SOON').length,
    expired: rows.filter(r => r.status === 'EXPIRED').length,
    outOfStock: rows.filter(r => r.status === 'OUT_OF_STOCK').length,
    unitsAvailable: rows.reduce((total, r) => total + r.batch.availableQuantity, 0),
  }
}

export function filterAndSortBatchRows(rows: InventoryRow[], options: BatchListOptions): InventoryRow[] {
  const query = options.search.trim().toLowerCase()

  const filtered = rows.filter(row => {
    if (options.status !== 'ALL' && row.status !== options.status) return false
    if (options.productId && row.product.id !== options.productId) return false
    if (!query) return true
    const haystack = [row.batch.batchNo, row.product.name, row.batch.supplierName]
      .join(' ')
      .toLowerCase()
    return haystack.includes(query)
  })

  const byExpiry = (a: InventoryRow, b: InventoryRow) => a.batch.expiryDate.localeCompare(b.batch.expiryDate)

  switch (options.sort) {
    case 'expiry_desc':
      return filtered.sort((a, b) => byExpiry(b, a))
    case 'received_desc':
      return filtered.sort((a, b) => b.batch.receivedAt.localeCompare(a.batch.receivedAt))
    case 'qty_desc':
      return filtered.sort(
        (a, b) => b.batch.availableQuantity - a.batch.availableQuantity || byExpiry(a, b),
      )
    case 'expiry_asc':
    default:
      return filtered.sort((a, b) => byExpiry(a, b) || a.batch.receivedAt.localeCompare(b.batch.receivedAt))
  }
}
