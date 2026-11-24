import { describe, expect, it } from 'vitest'
import type { Batch, Product } from '@/types/inventory'
import {
  batchStats,
  buildBatchRows,
  buildProductRows,
  filterAndSortBatchRows,
  filterAndSortProducts,
  productStats,
} from './inventoryList'

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    name: 'Fresh Milk 1L',
    sku: 'DAI-MILK-1L',
    barcode: '8964000101011',
    category: 'Dairy',
    manufacturer: 'DairyFresh Ltd',
    description: '',
    unit: 'pcs',
    minStock: 10,
    imageUrl: '',
    createdAt: '2026-01-01T00:00:00',
    ...overrides,
  }
}

function makeBatch(overrides: Partial<Batch> = {}): Batch {
  return {
    id: 'b1',
    productId: 'p1',
    batchNo: 'B-100',
    manufacturingDate: '2026-01-01',
    expiryDate: '2026-12-31',
    purchaseDate: '2026-01-02',
    purchaseQuantity: 20,
    availableQuantity: 12,
    supplierName: 'DairyFresh Ltd',
    supplierContact: 'sales@dairyfresh.example',
    purchasePrice: 220,
    branch: 'Main Branch',
    receivedAt: '2026-01-02T09:00:00',
    ...overrides,
  }
}

describe('buildProductRows', () => {
  it('aggregates stock, batch count and earliest expiry per product', () => {
    const products = [makeProduct()]
    const batches = [
      makeBatch({ id: 'b1', expiryDate: '2026-06-01', availableQuantity: 5 }),
      makeBatch({ id: 'b2', expiryDate: '2026-03-01', availableQuantity: 7 }),
      makeBatch({ id: 'b3', expiryDate: '2026-02-01', availableQuantity: 0 }),
    ]

    const rows = buildProductRows(products, batches)

    expect(rows).toHaveLength(1)
    expect(rows[0].available).toBe(12)
    expect(rows[0].batchCount).toBe(3)
    // Depleted batches never count towards the earliest sellable expiry.
    expect(rows[0].earliestExpiry).toBe('2026-03-01')
    expect(rows[0].stockStatus).toBe('IN_STOCK')
  })

  it('flags low and out-of-stock products', () => {
    const low = buildProductRows([makeProduct({ id: 'p1', minStock: 12 })], [makeBatch({ availableQuantity: 12 })])
    const out = buildProductRows([makeProduct({ id: 'p2', minStock: 5 })], [makeBatch({ productId: 'p2', availableQuantity: 0 })])

    expect(low[0].stockStatus).toBe('LOW_STOCK')
    expect(out[0].stockStatus).toBe('OUT_OF_STOCK')
  })
})

describe('filterAndSortProducts', () => {
  const rows = buildProductRows(
    [
      makeProduct({ id: 'p1', name: 'Fresh Milk 1L', category: 'Dairy', manufacturer: 'DairyFresh', createdAt: '2026-01-01T00:00:00' }),
      makeProduct({ id: 'p2', name: 'Chicken Breast', sku: 'MEA-CHK', barcode: '9999999999999', category: 'Meat', manufacturer: 'Prime Meats', createdAt: '2026-02-01T00:00:00' }),
      makeProduct({ id: 'p3', name: 'Bread Loaf', sku: 'BAK-BRD', category: 'Bakery', manufacturer: 'Sunrise', createdAt: '2026-03-01T00:00:00' }),
    ],
    [
      makeBatch({ productId: 'p1', availableQuantity: 50 }),
      makeBatch({ productId: 'p2', availableQuantity: 0 }),
      makeBatch({ productId: 'p3', availableQuantity: 4 }),
    ],
  )

  const base = { search: '', category: '', stock: 'ALL' as const, sort: 'name_asc' as const }

  it('searches across name, SKU, barcode and manufacturer', () => {
    expect(filterAndSortProducts(rows, { ...base, search: 'chicken' })).toHaveLength(1)
    expect(filterAndSortProducts(rows, { ...base, search: 'MEA-CHK' })).toHaveLength(1)
    expect(filterAndSortProducts(rows, { ...base, search: '9999999999999' })).toHaveLength(1)
    expect(filterAndSortProducts(rows, { ...base, search: 'DairyFresh' })).toHaveLength(1)
    expect(filterAndSortProducts(rows, { ...base, search: 'no-such-product' })).toHaveLength(0)
  })

  it('filters by category and stock status', () => {
    expect(filterAndSortProducts(rows, { ...base, category: 'Dairy' })).toHaveLength(1)
    expect(filterAndSortProducts(rows, { ...base, stock: 'OUT_OF_STOCK' }).map(r => r.product.id)).toEqual(['p2'])
  })

  it('sorts by name, stock and earliest expiry', () => {
    expect(filterAndSortProducts(rows, { ...base, sort: 'name_desc' }).map(r => r.product.name)).toEqual([
      'Fresh Milk 1L',
      'Chicken Breast',
      'Bread Loaf',
    ])
    expect(filterAndSortProducts(rows, { ...base, sort: 'stock_asc' }).map(r => r.product.id)).toEqual([
      'p2',
      'p3',
      'p1',
    ])
    expect(filterAndSortProducts(rows, { ...base, sort: 'newest' }).map(r => r.product.id)).toEqual([
      'p3',
      'p2',
      'p1',
    ])
  })

  it('counts stats from the unfiltered rows', () => {
    const stats = productStats(rows)
    expect(stats.total).toBe(3)
    expect(stats.outOfStock).toBe(1)
    expect(stats.unitsAvailable).toBe(54)
  })
})

describe('filterAndSortBatchRows', () => {
  const today = new Date('2026-03-15T12:00:00')
  const products = [
    makeProduct({ id: 'p1', name: 'Fresh Milk 1L' }),
    makeProduct({ id: 'p2', name: 'Chicken Breast', category: 'Meat' }),
  ]
  const rows = buildBatchRows(
    products,
    [
      makeBatch({ id: 'b1', productId: 'p1', batchNo: 'B-100', expiryDate: '2026-03-10', availableQuantity: 8, supplierName: 'DairyFresh' }),
      makeBatch({ id: 'b2', productId: 'p1', batchNo: 'B-101', expiryDate: '2026-03-17', availableQuantity: 0, supplierName: 'DairyFresh' }),
      makeBatch({ id: 'b3', productId: 'p2', batchNo: 'B-102', expiryDate: '2026-09-01', availableQuantity: 30, supplierName: 'Prime Meats', receivedAt: '2026-03-01T00:00:00' }),
    ],
    today,
  )

  const base = { search: '', status: 'ALL' as const, productId: '', sort: 'expiry_asc' as const }

  it('derives batch status from expiry and stock', () => {
    expect(rows.map(r => r.status)).toEqual(['EXPIRED', 'OUT_OF_STOCK', 'FRESH'])
  })

  it('filters by status, product and free-text search', () => {
    expect(filterAndSortBatchRows(rows, { ...base, status: 'EXPIRED' })).toHaveLength(1)
    expect(filterAndSortBatchRows(rows, { ...base, productId: 'p2' })).toHaveLength(1)
    expect(filterAndSortBatchRows(rows, { ...base, search: 'prime meats' })).toHaveLength(1)
    expect(filterAndSortBatchRows(rows, { ...base, search: 'B-101' })).toHaveLength(1)
  })

  it('sorts by expiry, received date and quantity', () => {
    expect(filterAndSortBatchRows(rows, { ...base, sort: 'expiry_asc' }).map(r => r.batch.id)).toEqual([
      'b1',
      'b2',
      'b3',
    ])
    expect(filterAndSortBatchRows(rows, { ...base, sort: 'expiry_desc' }).map(r => r.batch.id)).toEqual([
      'b3',
      'b2',
      'b1',
    ])
    expect(filterAndSortBatchRows(rows, { ...base, sort: 'qty_desc' }).map(r => r.batch.id)).toEqual([
      'b3',
      'b1',
      'b2',
    ])
  })

  it('counts stats across statuses', () => {
    const stats = batchStats(rows)
    expect(stats.total).toBe(3)
    expect(stats.expired).toBe(1)
    expect(stats.outOfStock).toBe(1)
    expect(stats.unitsAvailable).toBe(38)
  })
})
