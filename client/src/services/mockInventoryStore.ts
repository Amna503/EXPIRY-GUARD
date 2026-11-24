import { seedBatches, seedProducts } from '@/data/mockInventory'
import type { Batch, BatchInput, Product, ProductInput } from '@/types/inventory'

// In-memory demo store. Used ONLY when VITE_USE_MOCK=true (the default).
// Kept separate from production API logic so it can be deleted without
// touching services/inventoryApi.ts. State resets on page reload.

let products: Product[] = seedProducts.map(p => ({ ...p }))
let batches: Batch[] = seedBatches.map(b => ({ ...b }))
let seq = 100

const nextId = (prefix: string) => `${prefix}${++seq}`

function delay(ms = 500) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const mockInventoryStore = {
  reset() {
    products = seedProducts.map(p => ({ ...p }))
    batches = seedBatches.map(b => ({ ...b }))
    seq = 100
  },

  async listProducts(): Promise<Product[]> {
    await delay()
    return products.map(p => ({ ...p }))
  },

  async getProduct(id: string): Promise<Product | undefined> {
    await delay(300)
    const found = products.find(p => p.id === id)
    return found ? { ...found } : undefined
  },

  async findProductByBarcode(barcode: string): Promise<Product | undefined> {
    await delay(300)
    const code = barcode.trim()
    const found = products.find(p => p.barcode === code)
    return found ? { ...found } : undefined
  },

  async createProduct(input: ProductInput): Promise<Product> {
    await delay()
    const product: Product = { ...input, id: nextId('p'), createdAt: new Date().toISOString() }
    products = [...products, product]
    return { ...product }
  },

  async updateProduct(id: string, input: ProductInput): Promise<Product> {
    await delay()
    const index = products.findIndex(p => p.id === id)
    if (index < 0) throw new Error('Product not found')
    const updated: Product = { ...products[index], ...input }
    products = products.map(p => (p.id === id ? updated : p))
    return { ...updated }
  },

  async deleteProduct(id: string): Promise<{ id: string }> {
    await delay()
    products = products.filter(p => p.id !== id)
    batches = batches.filter(b => b.productId !== id)
    return { id }
  },

  async listBatches(): Promise<Batch[]> {
    await delay()
    return batches.map(b => ({ ...b }))
  },

  async getBatch(id: string): Promise<Batch | undefined> {
    await delay(300)
    const found = batches.find(b => b.id === id)
    return found ? { ...found } : undefined
  },

  async createBatch(input: BatchInput): Promise<Batch> {
    await delay()
    const batch: Batch = { ...input, id: nextId('b'), receivedAt: new Date().toISOString() }
    batches = [...batches, batch]
    return { ...batch }
  },

  async updateBatch(id: string, input: BatchInput): Promise<Batch> {
    await delay()
    const index = batches.findIndex(b => b.id === id)
    if (index < 0) throw new Error('Batch not found')
    const updated: Batch = { ...batches[index], ...input }
    batches = batches.map(b => (b.id === id ? updated : b))
    return { ...updated }
  },

  async deleteBatch(id: string): Promise<{ id: string }> {
    await delay()
    batches = batches.filter(b => b.id !== id)
    return { id }
  },

  async deductStock(batchId: string, quantity: number): Promise<Batch> {
    await delay()
    const batch = batches.find(b => b.id === batchId)
    if (!batch) throw new Error('Batch not found')
    if (quantity <= 0) throw new Error('Quantity must be greater than zero')
    if (batch.availableQuantity < quantity) throw new Error('Not enough stock in this batch')
    const updated: Batch = { ...batch, availableQuantity: batch.availableQuantity - quantity }
    batches = batches.map(b => (b.id === batchId ? updated : b))
    return { ...updated }
  },
}
