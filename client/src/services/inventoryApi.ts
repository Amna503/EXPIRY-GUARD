import { mockInventoryStore } from './mockInventoryStore'
import { http, USE_MOCK } from './http'
import type { Batch, BatchInput, Product, ProductInput } from '@/types/inventory'

/**
 * Inventory API abstraction.
 *
 * MISSING BACKEND DEPENDENCY (owned by Member 3 — not present in this repo yet).
 * The endpoints below are the contract this module expects. Until they exist,
 * VITE_USE_MOCK=true (default) serves the in-memory demo store instead.
 *
 *   GET    /products                  -> Product[]
 *   GET    /products/:id              -> Product
 *   GET    /products/lookup?barcode=  -> Product | null     (barcode scan)
 *   POST   /products                  -> Product
 *   PUT    /products/:id              -> Product
 *   DELETE /products/:id              -> { id }
 *   GET    /batches                   -> Batch[]
 *   GET    /batches/:id               -> Batch
 *   POST   /batches                   -> Batch
 *   PUT    /batches/:id               -> Batch
 *   DELETE /batches/:id               -> { id }
 *   POST   /batches/:id/deduct        -> Batch              (FEFO stock deduction;
 *                                                           server must re-validate
 *                                                           expiry and availability)
 *
 * Also missing: product image upload. The UI accepts an image URL only.
 * Response envelope matches services/http.ts: { success, data } | { success:false, error }.
 * Auth: cookie session (credentials: 'include'); business scope resolved server-side.
 */

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))
const flag = (name: string) => new URLSearchParams(window.location.search).has(name)

async function simulate<T>(data: T): Promise<T> {
  await delay()
  if (flag('fail')) throw new Error('Demo failure')
  return flag('empty') && Array.isArray(data) ? ([] as T) : data
}

function json(method: string, body?: unknown): RequestInit {
  return { method, body: body === undefined ? undefined : JSON.stringify(body) }
}

export const inventoryApi = {
  // --- Products -----------------------------------------------------------

  async fetchProducts(): Promise<Product[]> {
    if (USE_MOCK) return simulate(await mockInventoryStore.listProducts())
    return http<Product[]>('/products')
  },

  async fetchProduct(id: string): Promise<Product> {
    if (USE_MOCK) {
      await delay(300)
      const product = await mockInventoryStore.getProduct(id)
      if (!product) throw new Error('Product not found')
      return product
    }
    return http<Product>(`/products/${id}`)
  },

  async lookupProductByBarcode(barcode: string): Promise<Product | null> {
    if (USE_MOCK) {
      return (await mockInventoryStore.findProductByBarcode(barcode)) ?? null
    }
    return http<Product | null>(`/products/lookup?barcode=${encodeURIComponent(barcode)}`)
  },

  async createProduct(input: ProductInput): Promise<Product> {
    if (USE_MOCK) return mockInventoryStore.createProduct(input)
    return http<Product>('/products', { ...json('POST', input) })
  },

  async updateProduct(id: string, input: ProductInput): Promise<Product> {
    if (USE_MOCK) return mockInventoryStore.updateProduct(id, input)
    return http<Product>(`/products/${id}`, { ...json('PUT', input) })
  },

  async deleteProduct(id: string): Promise<{ id: string }> {
    if (USE_MOCK) return mockInventoryStore.deleteProduct(id)
    return http<{ id: string }>(`/products/${id}`, { method: 'DELETE' })
  },

  // --- Batches ------------------------------------------------------------

  async fetchBatches(): Promise<Batch[]> {
    if (USE_MOCK) return simulate(await mockInventoryStore.listBatches())
    return http<Batch[]>('/batches')
  },

  async fetchBatch(id: string): Promise<Batch> {
    if (USE_MOCK) {
      await delay(300)
      const batch = await mockInventoryStore.getBatch(id)
      if (!batch) throw new Error('Batch not found')
      return batch
    }
    return http<Batch>(`/batches/${id}`)
  },

  async createBatch(input: BatchInput): Promise<Batch> {
    if (USE_MOCK) return mockInventoryStore.createBatch(input)
    return http<Batch>('/batches', { ...json('POST', input) })
  },

  async updateBatch(id: string, input: BatchInput): Promise<Batch> {
    if (USE_MOCK) return mockInventoryStore.updateBatch(id, input)
    return http<Batch>(`/batches/${id}`, { ...json('PUT', input) })
  },

  async deleteBatch(id: string): Promise<{ id: string }> {
    if (USE_MOCK) return mockInventoryStore.deleteBatch(id)
    return http<{ id: string }>(`/batches/${id}`, { method: 'DELETE' })
  },

  /**
   * FEFO stock deduction. Returns the updated batch ONLY after the backend
   * confirms the mutation. Callers must not update local stock optimistically.
   */
  async deductStock(batchId: string, quantity: number): Promise<Batch> {
    if (USE_MOCK) return mockInventoryStore.deductStock(batchId, quantity)
    return http<Batch>(`/batches/${batchId}/deduct`, { ...json('POST', { quantity }) })
  },
}
