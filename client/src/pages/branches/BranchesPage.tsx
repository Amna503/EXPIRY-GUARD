import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Building2,
  GitBranch,
  MapPin,
  PackageOpen,
  Plus,
  Store,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { KpiCard } from '@/components/ui/KpiCard'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/toast'
import { useBatches, useProducts } from '@/hooks/useInventory'
import { buildBatchRows } from '@/utils/inventoryList'
import { formatMoney } from '@/utils/inventory'

type BranchMeta = { name: string; location: string; manager: string }

const SEED_BRANCHES: BranchMeta[] = [
  { name: 'Main Branch', location: 'Shahrah-e-Faisal, Karachi', manager: 'Ayesha Khan' },
  { name: 'North Outlet', location: 'GT Road, Lahore', manager: 'Bilal Ahmed' },
  { name: 'Riverside Store', location: 'Jinnah Avenue, Islamabad', manager: 'Hina Raza' },
  { name: 'Airport Kiosk', location: 'Terminal 2, Karachi', manager: 'Usman Tariq' },
]

type BranchRow = BranchMeta & {
  products: number
  batches: number
  units: number
  value: number
  expiring: number
  expired: number
  status: 'HEALTHY' | 'ATTENTION' | 'CRITICAL' | 'EMPTY'
}

const statusMeta: Record<BranchRow['status'], { label: string; cls: string }> = {
  HEALTHY: { label: 'Healthy', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' },
  ATTENTION: { label: 'Needs attention', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300' },
  CRITICAL: { label: 'Critical', cls: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300' },
  EMPTY: { label: 'No stock', cls: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300' },
}

function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading branches">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )
}

export default function BranchesPage() {
  const productsQuery = useProducts()
  const batchesQuery = useBatches()
  const toast = useToast()

  const [branches, setBranches] = useState<BranchMeta[]>(SEED_BRANCHES)
  const [addOpen, setAddOpen] = useState(false)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [manager, setManager] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const loading = productsQuery.isLoading || batchesQuery.isLoading
  const failed = productsQuery.isError || batchesQuery.isError

  const rows = useMemo<BranchRow[]>(() => {
    const inventoryRows = productsQuery.data && batchesQuery.data
      ? buildBatchRows(productsQuery.data, batchesQuery.data)
      : []

    return branches.map(meta => {
      const mine = inventoryRows.filter(r => r.batch.branch === meta.name)
      const products = new Set(mine.map(r => r.product.id)).size
      const units = mine.reduce((t, r) => t + r.batch.availableQuantity, 0)
      const value = mine.reduce((t, r) => t + r.batch.availableQuantity * r.batch.purchasePrice, 0)
      const expired = mine.filter(r => r.days < 0).length
      const expiring = mine.filter(r => r.days >= 0 && r.days <= 7).length
      const status: BranchRow['status'] =
        mine.length === 0
          ? 'EMPTY'
          : expired > 0
            ? 'CRITICAL'
            : expiring > 0
              ? 'ATTENTION'
              : 'HEALTHY'
      return { ...meta, products, batches: mine.length, units, value, expiring, expired, status }
    })
  }, [branches, productsQuery.data, batchesQuery.data])

  const stats = useMemo(
    () => ({
      branches: rows.length,
      units: rows.reduce((t, r) => t + r.units, 0),
      value: rows.reduce((t, r) => t + r.value, 0),
      attention: rows.filter(r => r.status === 'CRITICAL' || r.status === 'ATTENTION').length,
    }),
    [rows],
  )

  if (loading) return <PageSkeleton />

  if (failed) {
    return <ErrorState onRetry={() => { void productsQuery.refetch(); void batchesQuery.refetch() }} />
  }

  const submitAdd = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setFormError('Branch name must be at least 2 characters')
      return
    }
    if (branches.some(b => b.name.toLowerCase() === trimmed.toLowerCase())) {
      setFormError('A branch with this name already exists')
      return
    }
    setBranches(prev => [
      ...prev,
      { name: trimmed, location: location.trim() || 'Location not set', manager: manager.trim() || 'Unassigned' },
    ])
    setName('')
    setLocation('')
    setManager('')
    setFormError(null)
    setAddOpen(false)
    toast.push('success', `${trimmed} added`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Branches</h1>
          <p className="text-sm text-[var(--muted)]">
            Stock, expiry risk and ownership for every location you operate.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus size={16} aria-hidden /> Add branch
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Branches" value={stats.branches} hint="Active locations" icon={GitBranch} tone="sky" />
        <KpiCard label="Units on hand" value={stats.units.toLocaleString('en-US')} hint="Across all branches" icon={Store} tone="emerald" />
        <KpiCard label="Stock value" value={formatMoney(stats.value)} hint="Qty × purchase price" icon={Wallet} tone="purple" />
        <KpiCard label="Need attention" value={stats.attention} hint="Expired or expiring stock" icon={AlertTriangle} tone="amber" />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No branches yet"
          message="Add your first location to start splitting stock and expiry risk by branch."
          action={<Button onClick={() => setAddOpen(true)}>Add branch</Button>}
        />
      ) : (
        <Card className="p-0">
          <div className="p-5 pb-3">
            <h2 className="font-semibold">All branches</h2>
            <p className="text-sm text-[var(--muted)]">
              Click through to Batches to manage the stock sitting at a location.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] text-left text-sm">
              <thead className="border-y border-[var(--border)] bg-slate-50 text-xs uppercase tracking-wide text-[var(--muted)] dark:bg-white/5">
                <tr>
                  <th className="px-5 py-3 font-semibold">Branch</th>
                  <th className="px-5 py-3 font-semibold">Manager</th>
                  <th className="px-5 py-3 font-semibold">Products</th>
                  <th className="px-5 py-3 font-semibold">Units</th>
                  <th className="px-5 py-3 font-semibold">Value</th>
                  <th className="px-5 py-3 font-semibold">Expiring / expired</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-5 py-3">
                      <p className="flex items-center gap-2 font-semibold">
                        <Building2 size={15} className="text-[var(--muted)]" aria-hidden />
                        {row.name}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-[var(--muted)]">
                        <MapPin size={12} aria-hidden /> {row.location}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-[var(--muted)]">{row.manager}</td>
                    <td className="px-5 py-3">{row.products}</td>
                    <td className="px-5 py-3">{row.units.toLocaleString('en-US')}</td>
                    <td className="px-5 py-3">{formatMoney(row.value)}</td>
                    <td className="px-5 py-3">
                      <span className="text-amber-600">{row.expiring}</span>
                      <span className="text-[var(--muted)]"> / </span>
                      <span className="text-red-600">{row.expired}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusMeta[row.status].cls}`}>
                        {row.status === 'CRITICAL' && <XCircle size={12} aria-hidden />}
                        {row.status === 'ATTENTION' && <AlertTriangle size={12} aria-hidden />}
                        {statusMeta[row.status].label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to="/batches"
                        className="font-semibold text-emerald-600 hover:underline"
                      >
                        View stock
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-[var(--border)] px-5 py-3 text-xs text-[var(--muted)]">
            Showing {rows.length} of {rows.length} branches
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="flex items-center gap-2 font-semibold">
            <Users size={18} className="text-emerald-600" aria-hidden /> Branch responsibilities
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Each branch has a manager who approves discounts, disposal and transfers for their stock.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
            <li>· Managers see only their own branch by default.</li>
            <li>· Head office can compare branches on the Analytics page.</li>
            <li>· Transfers between branches keep the original expiry date.</li>
          </ul>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 font-semibold">
            <PackageOpen size={18} className="text-emerald-600" aria-hidden /> Stock without a branch
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Every batch must carry a branch name. When receiving stock, pick the location the goods arrive at.
          </p>
          <Link to="/receive" className="mt-4 inline-block font-semibold text-emerald-600 hover:underline">
            Receive stock →
          </Link>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 font-semibold">
            <AlertTriangle size={18} className="text-amber-600" aria-hidden /> Attention rules
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
            <li><strong className="text-red-600">Critical:</strong> at least one expired batch on site.</li>
            <li><strong className="text-amber-600">Needs attention:</strong> stock expiring within 7 days.</li>
            <li><strong className="text-emerald-600">Healthy:</strong> stock on hand, nothing urgent.</li>
            <li><strong>No stock:</strong> branch added but nothing received yet.</li>
          </ul>
        </Card>
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add branch"
        description="New locations show up in the branch list and on the receive stock form."
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" form="branch-form">Add branch</Button>
          </>
        }
      >
        <form id="branch-form" onSubmit={submitAdd} className="space-y-4">
          <Input
            label="Branch name"
            name="branch-name"
            placeholder="West End Store"
            value={name}
            onChange={event => setName(event.target.value)}
            error={formError ?? undefined}
            autoComplete="off"
          />
          <Input
            label="Location"
            name="branch-location"
            placeholder="Street, city"
            value={location}
            onChange={event => setLocation(event.target.value)}
            autoComplete="off"
          />
          <Input
            label="Manager"
            name="branch-manager"
            placeholder="Full name"
            value={manager}
            onChange={event => setManager(event.target.value)}
            autoComplete="off"
          />
        </form>
      </Modal>
    </div>
  )
}
