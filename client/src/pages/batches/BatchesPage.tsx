import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Boxes,
  CalendarClock,
  Eye,
  Minus,
  PackagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { KpiCard } from '@/components/ui/KpiCard'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/toast'
import { BatchStatusBadge } from '@/components/inventory/BatchStatusBadge'
import { BatchDetailsModal } from './BatchDetailsModal'
import { BatchFormModal } from './BatchFormModal'
import { DeductStockModal } from './DeductStockModal'
import { useBatches, useBatchMutations, useProducts } from '@/hooks/useInventory'
import type { Batch, BatchInput, BatchStatus } from '@/types/inventory'
import { daysText, formatDate } from '@/utils/inventory'
import { batchStats, buildBatchRows, filterAndSortBatchRows } from '@/utils/inventoryList'
import type { BatchSortKey } from '@/utils/inventoryList'

const SORT_OPTIONS: { value: BatchSortKey; label: string }[] = [
  { value: 'expiry_asc', label: 'Expiry (soonest first)' },
  { value: 'expiry_desc', label: 'Expiry (latest first)' },
  { value: 'received_desc', label: 'Recently received' },
  { value: 'qty_desc', label: 'Most stock' },
]

const STATUS_OPTIONS: { value: BatchStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'FRESH', label: 'Fresh' },
  { value: 'EXPIRING_SOON', label: 'Expiring soon' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'OUT_OF_STOCK', label: 'Out of stock' },
]

function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading batches">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )
}

export default function BatchesPage() {
  const productsQuery = useProducts()
  const batchesQuery = useBatches()
  const { create, update, remove, deduct } = useBatchMutations()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<BatchStatus | 'ALL'>('ALL')
  const [productId, setProductId] = useState('')
  const [sort, setSort] = useState<BatchSortKey>('expiry_asc')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Batch | null>(null)
  const [details, setDetails] = useState<Batch | null>(null)
  const [deductTarget, setDeductTarget] = useState<Batch | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Batch | null>(null)

  const products = productsQuery.data
  const batches = batchesQuery.data
  const loading = productsQuery.isLoading || batchesQuery.isLoading
  const failed = productsQuery.isError || batchesQuery.isError

  const rows = useMemo(
    () => (products && batches ? buildBatchRows(products, batches) : []),
    [products, batches],
  )

  const visible = useMemo(
    () => filterAndSortBatchRows(rows, { search, status, productId, sort }),
    [rows, search, status, productId, sort],
  )

  const stats = batchStats(rows)
  const hasFilters = search !== '' || status !== 'ALL' || productId !== ''

  if (loading) return <PageSkeleton />

  if (failed) {
    return <ErrorState onRetry={() => { void productsQuery.refetch(); void batchesQuery.refetch() }} />
  }

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (batch: Batch) => {
    setDetails(null)
    setEditing(batch)
    setFormOpen(true)
  }

  const submitForm = async (input: BatchInput) => {
    if (editing) {
      await update.mutateAsync({ id: editing.id, input })
      toast.push('success', 'Batch updated')
    } else {
      await create.mutateAsync(input)
      toast.push('success', 'Batch added')
    }
    setFormOpen(false)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    await remove.mutateAsync(deleteTarget.id)
    toast.push('success', 'Batch deleted')
  }

  const confirmDeduct = async (quantity: number) => {
    if (!deductTarget) return
    await deduct.mutateAsync({ batchId: deductTarget.id, quantity })
    toast.push('success', `Deducted ${quantity} units`)
    setDeductTarget(null)
  }

  const clearFilters = () => {
    setSearch('')
    setStatus('ALL')
    setProductId('')
  }

  const productById = (id: string) => products?.find(p => p.id === id) ?? null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Batches</h1>
          <p className="text-sm text-[var(--muted)]">
            Batch-level stock with manufacturing, purchase and expiry dates per product.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!products?.length} title={!products?.length ? 'Add a product first' : undefined}>
          <Plus size={16} aria-hidden /> Add batch
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Batches" value={stats.total} hint="Recorded stock lots" icon={Boxes} tone="sky" />
        <KpiCard label="Expiring soon" value={stats.expiringSoon} hint="7 days or less" icon={AlertTriangle} tone="amber" />
        <KpiCard label="Expired" value={stats.expired} hint="Needs disposal" icon={XCircle} tone="red" />
        <KpiCard
          label="Units available"
          value={stats.unitsAvailable.toLocaleString('en-US')}
          hint={`${stats.outOfStock} batch${stats.outOfStock === 1 ? '' : 'es'} depleted`}
          icon={CalendarClock}
          tone="emerald"
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={PackagePlus}
          title="No batches yet"
          message={
            products?.length
              ? 'Record your first batch to start tracking expiry dates and stock.'
              : 'Add a product first, then record batches for it.'
          }
          action={
            products?.length ? (
              <Button onClick={openCreate}>Add batch</Button>
            ) : (
              <Link to="/products">
                <Button>Go to products</Button>
              </Link>
            )
          }
        />
      ) : (
        <Card className="p-0">
          <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
            <Input
              label="Search"
              name="search"
              placeholder="Batch no, product, supplier…"
              value={search}
              onChange={event => setSearch(event.target.value)}
              right={<Search size={16} className="text-[var(--muted)]" aria-hidden />}
            />
            <Select
              label="Status"
              name="status"
              value={status}
              onChange={event => setStatus(event.target.value as BatchStatus | 'ALL')}
              options={STATUS_OPTIONS}
            />
            <Select
              label="Product"
              name="product"
              value={productId}
              onChange={event => setProductId(event.target.value)}
              options={[
                { value: '', label: 'All products' },
                ...(products ?? []).map(product => ({ value: product.id, label: product.name })),
              ]}
            />
            <Select
              label="Sort by"
              name="sort"
              value={sort}
              onChange={event => setSort(event.target.value as BatchSortKey)}
              options={SORT_OPTIONS}
            />
          </div>

          {visible.length === 0 ? (
            <div className="border-t border-[var(--border)] p-8 text-center">
              <p className="text-sm font-medium">No batches match your filters.</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Try a different search or clear the filters.</p>
              <Button variant="secondary" className="mt-4" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="border-y border-[var(--border)] bg-slate-50 text-xs uppercase tracking-wide text-[var(--muted)] dark:bg-white/5">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Product / batch</th>
                    <th className="px-5 py-3 font-semibold">Expiry</th>
                    <th className="px-5 py-3 font-semibold">Stock</th>
                    <th className="px-5 py-3 font-semibold">Supplier</th>
                    <th className="px-5 py-3 font-semibold">Received</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(({ batch, product, days, status: rowStatus }) => (
                    <tr key={batch.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          className="block text-left font-semibold hover:text-emerald-600 hover:underline"
                          onClick={() => setDetails(batch)}
                        >
                          {product.name}
                        </button>
                        <span className="text-xs text-[var(--muted)]">
                          {batch.batchNo} · {product.sku}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <p>{formatDate(batch.expiryDate)}</p>
                        <p className="text-xs text-[var(--muted)]">{daysText(days)}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-medium">
                          {batch.availableQuantity.toLocaleString('en-US')}
                        </span>
                        <span className="text-[var(--muted)]">
                          {' / '}{batch.purchaseQuantity.toLocaleString('en-US')} {product.unit}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[var(--muted)]">{batch.supplierName}</td>
                      <td className="px-5 py-3 text-[var(--muted)]">{formatDate(batch.receivedAt)}</td>
                      <td className="px-5 py-3">
                        <BatchStatusBadge status={rowStatus} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            aria-label={`View batch ${batch.batchNo}`}
                            className="rounded-lg p-2 text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/5"
                            onClick={() => setDetails(batch)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Deduct stock from batch ${batch.batchNo}`}
                            className="rounded-lg p-2 text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/5"
                            disabled={batch.availableQuantity <= 0}
                            onClick={() => setDeductTarget(batch)}
                          >
                            <Minus size={16} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Edit batch ${batch.batchNo}`}
                            className="rounded-lg p-2 text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/5"
                            onClick={() => openEdit(batch)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete batch ${batch.batchNo}`}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                            onClick={() => setDeleteTarget(batch)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-[var(--border)] px-5 py-3 text-xs text-[var(--muted)]">
            Showing {visible.length} of {rows.length} batches
            {hasFilters ? ' · filters applied' : ''}
          </div>
        </Card>
      )}

      <BatchFormModal
        open={formOpen}
        batch={editing}
        products={products ?? []}
        onClose={() => setFormOpen(false)}
        onSubmit={submitForm}
      />

      <BatchDetailsModal
        batch={details}
        product={details ? productById(details.productId) : null}
        batches={batches ?? []}
        onClose={() => setDetails(null)}
        onEdit={openEdit}
        onDeduct={batch => {
          setDetails(null)
          setDeductTarget(batch)
        }}
        onDelete={batch => {
          setDetails(null)
          setDeleteTarget(batch)
        }}
      />

      <DeductStockModal
        batch={deductTarget}
        onClose={() => setDeductTarget(null)}
        onConfirm={confirmDeduct}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete batch?"
        message={
          deleteTarget
            ? `Batch ${deleteTarget.batchNo} will be removed and its stock will no longer be counted. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
