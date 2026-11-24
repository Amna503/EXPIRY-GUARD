import { Calendar, Package, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { QrCodeImage } from '@/components/inventory/QrCodeImage'
import { BatchStatusBadge } from '@/components/inventory/BatchStatusBadge'
import { StockStatusBadge } from '@/components/inventory/StockStatusBadge'
import type { Batch, Product } from '@/types/inventory'
import { encodeQrPayload } from '@/utils/qrPayload'
import {
  daysLeft,
  daysText,
  earliestExpiry,
  formatDate,
  getBatchStatus,
  getProductStockStatus,
  sortBatchesByExpiry,
  totalAvailableQuantity,
} from '@/utils/inventory'

type Props = {
  product: Product | null
  batches: Batch[]
  onClose: () => void
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  )
}

export function ProductDetailsModal({ product, batches, onClose, onEdit, onDelete }: Props) {
  if (!product) return null

  const productBatches = sortBatchesByExpiry(batches.filter(b => b.productId === product.id))
  const available = totalAvailableQuantity(batches, product.id)
  const stockStatus = getProductStockStatus(available, product.minStock)
  const expiry = earliestExpiry(batches, product.id)

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={product.name}
      description={`${product.sku} · ${product.category}`}
      footer={
        onEdit || onDelete ? (
          <>
            {onDelete && (
              <Button variant="secondary" onClick={() => onDelete(product)}>
                <Trash2 size={16} aria-hidden /> Delete
              </Button>
            )}
            {onEdit && (
              <Button onClick={() => onEdit(product)}>
                <Pencil size={16} aria-hidden /> Edit
              </Button>
            )}
          </>
        ) : undefined
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-start gap-4">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt=""
              className="h-20 w-20 rounded-xl border border-[var(--border)] object-cover"
              onError={event => {
                event.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-white/5">
              <Package size={32} aria-hidden />
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <StockStatusBadge status={stockStatus} />
              <span className="text-sm text-[var(--muted)]">
                {available.toLocaleString('en-US')} {product.unit} available
              </span>
            </div>
            <p className="text-sm text-[var(--muted)]">
              Minimum stock: {product.minStock} {product.unit} · {productBatches.length} batch
              {productBatches.length === 1 ? '' : 'es'} recorded
            </p>
            <p className="text-sm text-[var(--muted)]">
              Earliest expiry: {expiry ? formatDate(expiry) : '—'}
            </p>
          </div>
          <div className="hidden shrink-0 sm:block">
            <QrCodeImage
              value={encodeQrPayload({ type: 'product', id: product.id })}
              size={112}
              caption="Scan to look up product"
            />
          </div>
        </div>

        {product.description && (
          <p className="rounded-xl bg-slate-50 p-3 text-sm text-[var(--muted)] dark:bg-white/5">
            {product.description}
          </p>
        )}

        <dl className="grid gap-4 sm:grid-cols-3">
          <Field label="Category" value={product.category} />
          <Field label="Manufacturer" value={product.manufacturer || '—'} />
          <Field label="Unit" value={product.unit} />
          <Field label="Barcode" value={product.barcode || '—'} />
          <Field label="SKU" value={product.sku} />
          <Field label="Created" value={formatDate(product.createdAt)} />
        </dl>

        <div className="sm:hidden">
          <QrCodeImage
            value={encodeQrPayload({ type: 'product', id: product.id })}
            size={112}
            caption="Scan to look up product"
          />
        </div>

        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Calendar size={15} aria-hidden /> Batches (earliest expiry first)
          </h3>
          {productBatches.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
              No batches recorded yet. Receive stock to add expiry dates for this product.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
              {productBatches.map(batch => {
                const days = daysLeft(batch.expiryDate)
                return (
                  <li key={batch.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
                    <div>
                      <p className="font-semibold">{batch.batchNo}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {formatDate(batch.expiryDate)} · {daysText(days)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--muted)]">
                        {batch.availableQuantity.toLocaleString('en-US')} /{' '}
                        {batch.purchaseQuantity.toLocaleString('en-US')}
                      </span>
                      <BatchStatusBadge status={getBatchStatus(batch)} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  )
}
