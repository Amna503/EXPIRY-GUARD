import { differenceInCalendarDays, format, isValid, parseISO } from 'date-fns'
import type { Batch, BatchStatus, InventoryRow, Product, ProductStockStatus } from '@/types/inventory'

export const EXPIRING_SOON_DAYS = 7

export function daysLeft(expiryDate: string, today = new Date()): number {
  const parsed = parseISO(expiryDate)
  if (!isValid(parsed)) return Number.NaN
  return differenceInCalendarDays(parsed, today)
}

export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = parseISO(value)
  if (!isValid(parsed)) return false
  // Rejects rollovers such as 2026-02-30.
  return format(parsed, 'yyyy-MM-dd') === value
}

/**
 * Batch status precedence: EXPIRED > OUT_OF_STOCK > EXPIRING_SOON > FRESH.
 * Expired stock keeps the expired label even when depleted, because it still
 * needs disposal attention.
 */
export function getBatchStatus(batch: Pick<Batch, 'expiryDate' | 'availableQuantity'>, today = new Date()): BatchStatus {
  const days = daysLeft(batch.expiryDate, today)
  if (Number.isNaN(days)) return 'EXPIRED'
  if (days < 0) return 'EXPIRED'
  if (batch.availableQuantity <= 0) return 'OUT_OF_STOCK'
  if (days <= EXPIRING_SOON_DAYS) return 'EXPIRING_SOON'
  return 'FRESH'
}

export function getProductStockStatus(availableQuantity: number, minStock: number): ProductStockStatus {
  if (availableQuantity <= 0) return 'OUT_OF_STOCK'
  if (availableQuantity <= minStock) return 'LOW_STOCK'
  return 'IN_STOCK'
}

export const batchStatusMeta: Record<BatchStatus, { label: string; cls: string }> = {
  FRESH: { label: 'Fresh', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' },
  EXPIRING_SOON: { label: 'Expiring soon', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300' },
  EXPIRED: { label: 'Expired', cls: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300' },
  OUT_OF_STOCK: { label: 'Out of stock', cls: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300' },
}

export const stockStatusMeta: Record<ProductStockStatus, { label: string; cls: string }> = {
  IN_STOCK: { label: 'In stock', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' },
  LOW_STOCK: { label: 'Low stock', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300' },
  OUT_OF_STOCK: { label: 'Out of stock', cls: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300' },
}

export function daysText(days: number): string {
  if (Number.isNaN(days)) return '—'
  if (days < 0) return `${-days} day${days === -1 ? '' : 's'} overdue`
  if (days === 0) return 'Today'
  return `${days} day${days === 1 ? '' : 's'} left`
}

/** Formats an ISO date (or date-time) for display. Returns "—" for missing/invalid values. */
export function formatDate(value?: string | null): string {
  if (!value) return '—'
  const parsed = parseISO(value)
  if (!isValid(parsed)) return '—'
  return format(parsed, 'dd MMM yyyy')
}

export function formatMoney(amount: number): string {
  return `PKR ${amount.toLocaleString('en-US')}`
}

export function totalAvailableQuantity(batches: Batch[], productId: string): number {
  return batches
    .filter(b => b.productId === productId)
    .reduce((total, b) => total + b.availableQuantity, 0)
}

export function earliestExpiry(batches: Batch[], productId: string): string | null {
  const dates = batches
    .filter(b => b.productId === productId && b.availableQuantity > 0)
    .map(b => b.expiryDate)
    .sort()
  return dates[0] ?? null
}

export function buildInventoryRows(products: Product[], batches: Batch[], today = new Date()): InventoryRow[] {
  const byId = new Map(products.map(p => [p.id, p]))
  const rows: InventoryRow[] = []
  for (const batch of batches) {
    const product = byId.get(batch.productId)
    if (!product) continue
    const days = daysLeft(batch.expiryDate, today)
    rows.push({ batch, product, days, status: getBatchStatus(batch, today) })
  }
  return rows
}

export function sortBatchesByExpiry(batches: Batch[]): Batch[] {
  return [...batches].sort((a, b) => {
    if (a.expiryDate === b.expiryDate) return a.receivedAt.localeCompare(b.receivedAt)
    return a.expiryDate.localeCompare(b.expiryDate)
  })
}
