import type { Batch } from '@/types/inventory'
import { daysLeft, sortBatchesByExpiry } from './inventory'

export type FefoExclusionReason = 'EXPIRED' | 'DEPLETED'

export type FefoExclusion = {
  batch: Batch
  reason: FefoExclusionReason
}

export type FefoRecommendation = {
  productId: string
  /** Earliest-expiring eligible batch, or null when nothing can be picked. */
  recommended: Batch | null
  /** All eligible batches sorted by earliest expiry (recommended is first). */
  eligible: Batch[]
  /** Batches excluded from FEFO with the reason they were skipped. */
  excluded: FefoExclusion[]
}

/**
 * FEFO — First Expired, First Out.
 * Eligible batches belong to the product, still have stock, and have not
 * expired. They are sorted by earliest expiry date.
 */
export function recommendFefo(batches: Batch[], productId: string, today = new Date()): FefoRecommendation {
  const productBatches = batches.filter(b => b.productId === productId)

  const excluded: FefoExclusion[] = []
  const eligible: Batch[] = []

  for (const batch of productBatches) {
    const days = daysLeft(batch.expiryDate, today)
    if (Number.isNaN(days) || days < 0) {
      excluded.push({ batch, reason: 'EXPIRED' })
    } else if (batch.availableQuantity <= 0) {
      excluded.push({ batch, reason: 'DEPLETED' })
    } else {
      eligible.push(batch)
    }
  }

  const sorted = sortBatchesByExpiry(eligible)
  return {
    productId,
    recommended: sorted[0] ?? null,
    eligible: sorted,
    excluded: excluded.sort((a, b) => a.batch.expiryDate.localeCompare(b.batch.expiryDate)),
  }
}
