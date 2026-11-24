import { Calendar, Minus, Pencil, Trash2, Truck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { QrCodeImage } from '@/components/inventory/QrCodeImage'
import { BatchStatusBadge } from '@/components/inventory/BatchStatusBadge'
import type { Batch, Product } from '@/types/inventory'
import { encodeQrPayload } from '@/utils/qrPayload'
import { recommendFefo } from '@/utils/fefo'
import { daysLeft, daysText, formatDate, getBatchStatus } from '@/utils/inventory'

type Props = {
  batch: Batch | null
  product: Product | null
  batches: Batch[]
  onClose: () => void
  onEdit?: (batch: Batch) => void
  onDeduct?: (batch: Batch) => void
  onDelete?: (batch: Batch) => void
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  )
}

function fefoNote(batch: Batch, batches: Batch[]): string {
  const fefo = recommendFefo(batches, batch.productId)
  const excluded = fefo.excluded.find(entry => entry.batch.id === batch.id)
  if (excluded?.reason === 'EXPIRED') return 'Excluded from FEFO picks because it is expired. Record disposal.'
  if (excluded?.reason === 'DEPLETED') return 'Excluded from FEFO picks because it has no stock left.'
  const index = fefo.eligible.findIndex(entry => entry.id === batch.id)
  if (index === 0) return 'This is the FEFO pick for this product — sell or use it first.'
  if (index > 0) {
    return `Eligible for FEFO (position ${index + 1} of ${fefo.eligible.length}). Pick ${
      fefo.recommended?.batchNo ?? 'another batch'
    } first.`
  }
  return 'No eligible batches for this product.'
}

export function BatchDetailsModal({ batch, product, batches, onClose, onEdit, onDeduct, onDelete }: Props) {
  if (!batch) return null

  const status = getBatchStatus(batch)
  const days = daysLeft(batch.expiryDate)
  const filled = batch.purchaseQuantity > 0
    ? Math.min(100, Math.round((batch.availableQuantity / batch.purchaseQuantity) * 100))
    : 0

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={`Batch ${batch.batchNo}`}
      description={product ? `${product.name} · ${product.sku}` : 'Product removed from catalogue'}
      footer={
        onEdit || onDeduct || onDelete ? (
          <>
            {onDelete && (
              <Button variant="secondary" onClick={() => onDelete(batch)}>
                <Trash2 size={16} aria-hidden /> Delete
              </Button>
            )}
            {onDeduct && (
              <Button variant="secondary" onClick={() => onDeduct(batch)} disabled={batch.availableQuantity <= 0}>
                <Minus size={16} aria-hidden /> Deduct stock
              </Button>
            )}
            {onEdit && (
              <Button onClick={() => onEdit(batch)}>
                <Pencil size={16} aria-hidden /> Edit
              </Button>
            )}
          </>
        ) : undefined
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <BatchStatusBadge status={status} />
          <span className="text-sm text-[var(--muted)]">
            {daysText(days)} · expires {formatDate(batch.expiryDate)}
          </span>
        </div>

        <div className="rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold">
              {batch.availableQuantity.toLocaleString('en-US')} available
            </span>
            <span className="text-[var(--muted)]">
              of {batch.purchaseQuantity.toLocaleString('en-US')} purchased
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <div
              className={`h-full rounded-full ${status === 'EXPIRED' ? 'bg-red-500' : 'bg-emerald-500'}`}
              style={{ width: `${filled}%` }}
              role="progressbar"
              aria-valuenow={batch.availableQuantity}
              aria-valuemin={0}
              aria-valuemax={batch.purchaseQuantity}
              aria-label="Available stock"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-4">
          <dl className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2">
            <Field label="Manufacturing date" value={formatDate(batch.manufacturingDate)} />
            <Field label="Expiry date" value={formatDate(batch.expiryDate)} />
            <Field label="Purchase date" value={formatDate(batch.purchaseDate)} />
            <Field label="Received" value={formatDate(batch.receivedAt)} />
            <Field label="Purchase price" value={`PKR ${batch.purchasePrice.toLocaleString('en-US')} / unit`} />
            <Field label="Branch" value={batch.branch} />
          </dl>
          <div className="hidden shrink-0 sm:block">
            <QrCodeImage
              value={encodeQrPayload({ type: 'batch', id: batch.id })}
              size={112}
              caption="Scan to open this batch"
            />
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/5">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Truck size={15} aria-hidden /> Supplier
          </h3>
          <p className="mt-1 text-sm">{batch.supplierName}</p>
          {batch.supplierContact && (
            <p className="text-sm text-[var(--muted)]">{batch.supplierContact}</p>
          )}
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            <Calendar size={15} aria-hidden /> FEFO position
          </h3>
          <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">{fefoNote(batch, batches)}</p>
        </div>

        <div className="sm:hidden">
          <QrCodeImage
            value={encodeQrPayload({ type: 'batch', id: batch.id })}
            size={112}
            caption="Scan to open this batch"
          />
        </div>
      </div>
    </Modal>
  )
}
