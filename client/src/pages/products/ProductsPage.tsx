import { useMemo, useState } from 'react'
import { AlertTriangle, Eye, Package, PackagePlus, PackageX, Pencil, Plus, Search, Trash2, Boxes } from 'lucide-react'
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
import { StockStatusBadge } from '@/components/inventory/StockStatusBadge'
import { ProductDetailsModal } from './ProductDetailsModal'
import { ProductFormModal } from './ProductFormModal'
import { useBatches, useProductMutations, useProducts } from '@/hooks/useInventory'
import type { Product, ProductInput, ProductStockStatus } from '@/types/inventory'
import { formatDate } from '@/utils/inventory'
import {
  buildProductRows,
  filterAndSortProducts,
  productStats,
} from '@/utils/inventoryList'
import type { ProductSortKey } from '@/utils/inventoryList'

const SORT_OPTIONS: { value: ProductSortKey; label: string }[] = [
  { value: 'name_asc', label: 'Name (A–Z)' },
  { value: 'name_desc', label: 'Name (Z–A)' },
  { value: 'stock_asc', label: 'Stock (low to high)' },
  { value: 'expiry_asc', label: 'Earliest expiry' },
  { value: 'newest', label: 'Recently added' },
]

const STOCK_OPTIONS: { value: ProductStockStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All stock levels' },
  { value: 'IN_STOCK', label: 'In stock' },
  { value: 'LOW_STOCK', label: 'Low stock' },
  { value: 'OUT_OF_STOCK', label: 'Out of stock' },
]

function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading products">
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

export default function ProductsPage() {
  const productsQuery = useProducts()
  const batchesQuery = useBatches()
  const { create, update, remove } = useProductMutations()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [stock, setStock] = useState<ProductStockStatus | 'ALL'>('ALL')
  const [sort, setSort] = useState<ProductSortKey>('name_asc')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [details, setDetails] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  const products = productsQuery.data
  const batches = batchesQuery.data
  const loading = productsQuery.isLoading || batchesQuery.isLoading
  const failed = productsQuery.isError || batchesQuery.isError

  const rows = useMemo(
    () => (products && batches ? buildProductRows(products, batches) : []),
    [products, batches],
  )

  const categories = useMemo(
    () => [...new Set((products ?? []).map(p => p.category))].sort((a, b) => a.localeCompare(b)),
    [products],
  )

  const visible = useMemo(
    () => filterAndSortProducts(rows, { search, category, stock, sort }),
    [rows, search, category, stock, sort],
  )

  const stats = productStats(rows)

  if (loading) return <PageSkeleton />

  if (failed) {
    return <ErrorState onRetry={() => { void productsQuery.refetch(); void batchesQuery.refetch() }} />
  }

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (product: Product) => {
    setDetails(null)
    setEditing(product)
    setFormOpen(true)
  }

  const submitForm = async (input: ProductInput) => {
    if (editing) {
      await update.mutateAsync({ id: editing.id, input })
      toast.push('success', 'Product updated')
    } else {
      await create.mutateAsync(input)
      toast.push('success', 'Product added')
    }
    setFormOpen(false)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    await remove.mutateAsync(deleteTarget.id)
    toast.push('success', 'Product deleted')
  }

  const clearFilters = () => {
    setSearch('')
    setCategory('')
    setStock('ALL')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-[var(--muted)]">
            Product master data: names, SKUs, barcodes, categories and stock thresholds.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} aria-hidden /> Add product
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Products" value={stats.total} hint={`${categories.length} categories`} icon={Package} tone="sky" />
        <KpiCard
          label="Units available"
          value={stats.unitsAvailable.toLocaleString('en-US')}
          hint="Across all batches"
          icon={Boxes}
          tone="emerald"
        />
        <KpiCard label="Low stock" value={stats.lowStock} hint="At or below minimum" icon={AlertTriangle} tone="amber" />
        <KpiCard label="Out of stock" value={stats.outOfStock} hint="No sellable units" icon={PackageX} tone="red" />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={PackagePlus}
          title="No products yet"
          message="Add your first product to start recording batches, expiry dates and stock."
          action={<Button onClick={openCreate}>Add product</Button>}
        />
      ) : (
        <Card className="p-0">
          <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
            <Input
              label="Search"
              name="search"
              placeholder="Name, SKU, barcode…"
              value={search}
              onChange={event => setSearch(event.target.value)}
              right={<Search size={16} className="text-[var(--muted)]" aria-hidden />}
            />
            <Select
              label="Category"
              name="category"
              value={category}
              onChange={event => setCategory(event.target.value)}
              options={[
                { value: '', label: 'All categories' },
                ...categories.map(value => ({ value, label: value })),
              ]}
            />
            <Select
              label="Stock status"
              name="stock"
              value={stock}
              onChange={event => setStock(event.target.value as ProductStockStatus | 'ALL')}
              options={STOCK_OPTIONS}
            />
            <Select
              label="Sort by"
              name="sort"
              value={sort}
              onChange={event => setSort(event.target.value as ProductSortKey)}
              options={SORT_OPTIONS}
            />
          </div>

          {visible.length === 0 ? (
            <div className="border-t border-[var(--border)] p-8 text-center">
              <p className="text-sm font-medium">No products match your filters.</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Try a different search or clear the filters.</p>
              <Button variant="secondary" className="mt-4" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead className="border-y border-[var(--border)] bg-slate-50 text-xs uppercase tracking-wide text-[var(--muted)] dark:bg-white/5">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Product</th>
                    <th className="px-5 py-3 font-semibold">Category</th>
                    <th className="px-5 py-3 font-semibold">Manufacturer</th>
                    <th className="px-5 py-3 font-semibold">Barcode</th>
                    <th className="px-5 py-3 font-semibold">Stock</th>
                    <th className="px-5 py-3 font-semibold">Earliest expiry</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(({ product, available, stockStatus, earliestExpiry }) => (
                    <tr key={product.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt=""
                              className="h-9 w-9 shrink-0 rounded-lg border border-[var(--border)] object-cover"
                              onError={event => {
                                event.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-white/5">
                              <Package size={16} aria-hidden />
                            </span>
                          )}
                          <div className="min-w-0">
                            <button
                              type="button"
                              className="block truncate font-semibold hover:text-emerald-600 hover:underline"
                              onClick={() => setDetails(product)}
                            >
                              {product.name}
                            </button>
                            <span className="text-xs text-[var(--muted)]">{product.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">{product.category}</td>
                      <td className="px-5 py-3 text-[var(--muted)]">{product.manufacturer || '—'}</td>
                      <td className="px-5 py-3 font-mono text-xs text-[var(--muted)]">{product.barcode || '—'}</td>
                      <td className="px-5 py-3">
                        <div className="space-y-1">
                          <span className="font-medium">
                            {available.toLocaleString('en-US')} {product.unit}
                          </span>
                          <StockStatusBadge status={stockStatus} />
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[var(--muted)]">{formatDate(earliestExpiry)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            aria-label={`View ${product.name}`}
                            className="rounded-lg p-2 text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/5"
                            onClick={() => setDetails(product)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Edit ${product.name}`}
                            className="rounded-lg p-2 text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/5"
                            onClick={() => openEdit(product)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${product.name}`}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                            onClick={() => setDeleteTarget(product)}
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
            Showing {visible.length} of {rows.length} products
            {search || category || stock !== 'ALL' ? ' · filters applied' : ''}
          </div>
        </Card>
      )}

      <ProductFormModal
        open={formOpen}
        product={editing}
        categories={categories}
        onClose={() => setFormOpen(false)}
        onSubmit={submitForm}
      />

      <ProductDetailsModal
        product={details}
        batches={batches ?? []}
        onClose={() => setDetails(null)}
        onEdit={openEdit}
        onDelete={product => {
          setDetails(null)
          setDeleteTarget(product)
        }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete product?"
        message={
          deleteTarget
            ? `"${deleteTarget.name}" and all of its batches will be removed. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
