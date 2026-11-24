import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, isAfter, subDays } from 'date-fns'
import { Boxes, CalendarClock, PackageCheck, PackagePlus, Truck, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { KpiCard } from '@/components/ui/KpiCard'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/toast'
import { batchSchema } from '@/schemas/inventorySchemas'
import type { BatchFormValues } from '@/schemas/inventorySchemas'
import { useBatches, useBatchMutations, useProducts } from '@/hooks/useInventory'
import { formatDate } from '@/utils/inventory'

const today = () => format(new Date(), 'yyyy-MM-dd')

function defaultValues(branch = 'Main Branch'): BatchFormValues {
  return {
    productId: '',
    batchNo: '',
    manufacturingDate: '',
    expiryDate: '',
    purchaseDate: today(),
    purchaseQuantity: 0,
    availableQuantity: 0,
    supplierName: '',
    supplierContact: '',
    purchasePrice: 0,
    branch,
  }
}

function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading receive stock">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  )
}

export default function ReceivePage() {
  const productsQuery = useProducts()
  const batchesQuery = useBatches()
  const { create } = useBatchMutations()
  const toast = useToast()

  const products = productsQuery.data
  const batches = batchesQuery.data
  const loading = productsQuery.isLoading || batchesQuery.isLoading
  const failed = productsQuery.isError || batchesQuery.isError

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<BatchFormValues>({ resolver: zodResolver(batchSchema), defaultValues: defaultValues() })

  const purchaseQuantity = watch('purchaseQuantity')

  useEffect(() => {
    if (dirtyFields.availableQuantity) return
    const next = Number.isFinite(purchaseQuantity) ? purchaseQuantity : 0
    setValue('availableQuantity', next)
  }, [purchaseQuantity, dirtyFields.availableQuantity, setValue])

  const stats = useMemo(() => {
    const list = batches ?? []
    const now = new Date()
    const todayStr = format(now, 'yyyy-MM-dd')
    const weekAgo = subDays(now, 7)
    const receivedToday = list.filter(b => b.receivedAt.slice(0, 10) === todayStr)
    const recent = list.filter(b => isAfter(new Date(b.receivedAt), weekAgo))
    return {
      receivedToday: receivedToday.length,
      unitsReceivedToday: receivedToday.reduce((t, b) => t + b.purchaseQuantity, 0),
      unitsLast7Days: recent.reduce((t, b) => t + b.purchaseQuantity, 0),
      suppliers: new Set(list.map(b => b.supplierName).filter(Boolean)).size,
      total: list.length,
    }
  }, [batches])

  const recentReceipts = useMemo(
    () => [...(batches ?? [])].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)).slice(0, 8),
    [batches],
  )

  const productById = (id: string) => products?.find(p => p.id === id) ?? null

  if (loading) return <PageSkeleton />

  if (failed) {
    return <ErrorState onRetry={() => { void productsQuery.refetch(); void batchesQuery.refetch() }} />
  }

  const submit = async (values: BatchFormValues) => {
    try {
      await create.mutateAsync(values)
      toast.push('success', `Received ${values.purchaseQuantity} units of stock`)
      reset(defaultValues(values.branch))
    } catch (err) {
      setError('root', { message: err instanceof Error ? err.message : 'Something went wrong' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Receive Stock</h1>
          <p className="text-sm text-[var(--muted)]">
            Record incoming deliveries. Every receipt becomes a batch with its own expiry date, so FEFO picking works from day one.
          </p>
        </div>
        <Link to="/batches">
          <Button variant="secondary">View all batches</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Received today" value={stats.receivedToday} hint={`${stats.unitsReceivedToday.toLocaleString('en-US')} units`} icon={PackageCheck} tone="emerald" />
        <KpiCard label="Units, last 7 days" value={stats.unitsLast7Days.toLocaleString('en-US')} hint="All suppliers combined" icon={Boxes} tone="sky" />
        <KpiCard label="Suppliers" value={stats.suppliers} hint="On recorded receipts" icon={Truck} tone="purple" />
        <KpiCard label="Batches recorded" value={stats.total} hint="Lots on hand" icon={CalendarClock} tone="amber" />
      </div>

      {products && products.length === 0 ? (
        <EmptyState
          icon={PackagePlus}
          title="Add a product before receiving stock"
          message="Receipts are recorded against a product. Create your first product, then come back to receive the delivery."
          action={<Link to="/products"><Button>Add product</Button></Link>}
        />
      ) : (
        <Card>
          <div className="mb-5">
            <h2 className="text-lg font-semibold">New delivery</h2>
            <p className="text-sm text-[var(--muted)]">
              Fill in the delivery note from your supplier. Available stock mirrors the purchase quantity until you change it.
            </p>
          </div>

          <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Product"
                error={errors.productId?.message}
                options={[
                  { value: '', label: 'Select a product' },
                  ...(products ?? []).map(product => ({
                    value: product.id,
                    label: `${product.name} (${product.sku})`,
                  })),
                ]}
                {...register('productId')}
              />
              <Input
                label="Batch number"
                placeholder="B-1042"
                autoComplete="off"
                error={errors.batchNo?.message}
                {...register('batchNo')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Manufacturing date"
                type="date"
                error={errors.manufacturingDate?.message}
                {...register('manufacturingDate')}
              />
              <Input label="Expiry date" type="date" error={errors.expiryDate?.message} {...register('expiryDate')} />
              <Input label="Purchase date" type="date" error={errors.purchaseDate?.message} {...register('purchaseDate')} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Quantity received"
                type="number"
                min={0}
                step={1}
                error={errors.purchaseQuantity?.message}
                {...register('purchaseQuantity', { valueAsNumber: true })}
              />
              <Input
                label="Available stock"
                type="number"
                min={0}
                step={1}
                error={errors.availableQuantity?.message}
                {...register('availableQuantity', { valueAsNumber: true })}
              />
              <Input
                label="Purchase price (per unit)"
                type="number"
                min={0}
                step="0.01"
                error={errors.purchasePrice?.message}
                {...register('purchasePrice', { valueAsNumber: true })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Supplier"
                placeholder="DairyFresh Ltd"
                autoComplete="off"
                error={errors.supplierName?.message}
                {...register('supplierName')}
              />
              <Input
                label="Supplier contact"
                placeholder="sales@dairyfresh.example"
                autoComplete="off"
                error={errors.supplierContact?.message}
                {...register('supplierContact')}
              />
            </div>

            <Input
              label="Branch"
              placeholder="Main Branch"
              autoComplete="off"
              error={errors.branch?.message}
              {...register('branch')}
            />

            {errors.root?.message && (
              <p role="alert" className="text-sm text-red-600">{errors.root.message}</p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
              <p className="text-xs text-[var(--muted)]">
                Saved batches appear on the Batches page and feed the Expiry Monitor straight away.
              </p>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => reset(defaultValues())} disabled={isSubmitting}>
                  Clear
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving…' : 'Receive stock'}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-0 lg:col-span-2">
          <div className="p-5 pb-3">
            <h2 className="font-semibold">Recent receipts</h2>
            <p className="text-sm text-[var(--muted)]">The latest deliveries recorded across the store.</p>
          </div>
          {recentReceipts.length === 0 ? (
            <p className="border-t border-[var(--border)] px-5 py-8 text-center text-sm text-[var(--muted)]">
              No receipts yet. Your first delivery will show up here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-y border-[var(--border)] bg-slate-50 text-xs uppercase tracking-wide text-[var(--muted)] dark:bg-white/5">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Product</th>
                    <th className="px-5 py-3 font-semibold">Batch</th>
                    <th className="px-5 py-3 font-semibold">Quantity</th>
                    <th className="px-5 py-3 font-semibold">Supplier</th>
                    <th className="px-5 py-3 font-semibold">Received</th>
                    <th className="px-5 py-3 font-semibold">Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReceipts.map(batch => {
                    const product = productById(batch.productId)
                    return (
                      <tr key={batch.id} className="border-b border-[var(--border)] last:border-0">
                        <td className="px-5 py-3 font-semibold">{product?.name ?? '—'}</td>
                        <td className="px-5 py-3 text-[var(--muted)]">{batch.batchNo}</td>
                        <td className="px-5 py-3">
                          {batch.purchaseQuantity.toLocaleString('en-US')}
                          <span className="text-[var(--muted)]"> {product?.unit ?? 'units'}</span>
                        </td>
                        <td className="px-5 py-3 text-[var(--muted)]">{batch.supplierName || '—'}</td>
                        <td className="px-5 py-3 text-[var(--muted)]">{formatDate(batch.receivedAt)}</td>
                        <td className="px-5 py-3 text-[var(--muted)]">{formatDate(batch.expiryDate)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold">Receiving checklist</h2>
          <p className="mb-4 text-sm text-[var(--muted)]">A quick pass before the goods go on the shelf.</p>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <Users size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden />
              <span>Match the delivery note: quantity, batch number and supplier invoice.</span>
            </li>
            <li className="flex gap-3">
              <CalendarClock size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden />
              <span>Check the expiry date on the cartons. Anything within 7 days should be flagged for review.</span>
            </li>
            <li className="flex gap-3">
              <PackageCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden />
              <span>Record damaged or short-shipped units in available stock, not the purchase quantity.</span>
            </li>
            <li className="flex gap-3">
              <Boxes size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden />
              <span>Older stock is always picked first (FEFO) — receiving a newer batch never overrides it.</span>
            </li>
          </ul>
          <div className="mt-5 rounded-xl border border-[var(--border)] bg-slate-50 p-4 text-xs text-[var(--muted)] dark:bg-white/5">
            Tip: scan the barcode on the Scanner page to pre-fill a product while receiving.
          </div>
        </Card>
      </div>
    </div>
  )
}
