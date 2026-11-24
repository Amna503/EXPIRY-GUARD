import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Search,
  Timer,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { KpiCard } from '@/components/ui/KpiCard'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ExpiryDistributionChart } from '@/components/charts/ExpiryDistributionChart'
import { useBatches, useProducts } from '@/hooks/useInventory'
import type { ExpiryStatus } from '@/utils/expiry'
import { getExpiryStatus } from '@/utils/expiry'
import { buildBatchRows } from '@/utils/inventoryList'
import { daysText, formatDate, formatMoney } from '@/utils/inventory'

type SortKey = 'days_asc' | 'days_desc' | 'qty_desc' | 'value_desc'

const STATUS_OPTIONS: { value: ExpiryStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All expiry states' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'EXPIRES_TODAY', label: 'Expires today' },
  { value: 'EXPIRING_SOON', label: 'Expiring soon (0-7 days)' },
  { value: 'MONITOR', label: 'Monitor (8-30 days)' },
  { value: 'SAFE', label: 'Safe (30+ days)' },
]

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'days_asc', label: 'Days left (soonest first)' },
  { value: 'days_desc', label: 'Days left (latest first)' },
  { value: 'qty_desc', label: 'Most units' },
  { value: 'value_desc', label: 'Highest value at risk' },
]

type Row = {
  id: string
  product: string
  batchNo: string
  branch: string
  unit: string
  qty: number
  value: number
  expiryDate: string
  days: number
  status: ExpiryStatus
}

function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading expiry monitor">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )
}

export default function ExpiryMonitorPage() {
  const productsQuery = useProducts()
  const batchesQuery = useBatches()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ExpiryStatus | 'ALL'>('ALL')
  const [sort, setSort] = useState<SortKey>('days_asc')

  const products = productsQuery.data
  const batches = batchesQuery.data
  const loading = productsQuery.isLoading || batchesQuery.isLoading
  const failed = productsQuery.isError || batchesQuery.isError

  const rows = useMemo<Row[]>(() => {
    if (!products || !batches) return []
    return buildBatchRows(products, batches).map(({ batch, product, days }) => ({
      id: batch.id,
      product: product.name,
      batchNo: batch.batchNo,
      branch: batch.branch,
      unit: product.unit,
      qty: batch.availableQuantity,
      value: batch.availableQuantity * batch.purchasePrice,
      expiryDate: batch.expiryDate,
      days,
      status: getExpiryStatus(days),
    }))
  }, [products, batches])

  const counts = useMemo(() => {
    const byStatus = (s: ExpiryStatus) => rows.filter(r => r.status === s)
    const expired = byStatus('EXPIRED')
    const today = byStatus('EXPIRES_TODAY')
    const soon = byStatus('EXPIRING_SOON')
    const monitor = byStatus('MONITOR')
    return {
      expired,
      today,
      soon,
      monitor,
      atRiskValue: [...expired, ...today, ...soon].reduce((t, r) => t + r.value, 0),
    }
  }, [rows])

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = rows.filter(row => {
      if (status !== 'ALL' && row.status !== status) return false
      if (!query) return true
      return [row.product, row.batchNo, row.branch].join(' ').toLowerCase().includes(query)
    })
    const byDays = (a: Row, b: Row) => a.days - b.days
    switch (sort) {
      case 'days_desc':
        return filtered.sort((a, b) => b.days - a.days)
      case 'qty_desc':
        return filtered.sort((a, b) => b.qty - a.qty)
      case 'value_desc':
        return filtered.sort((a, b) => b.value - a.value)
      case 'days_asc':
      default:
        return filtered.sort(byDays)
    }
  }, [rows, search, status, sort])

  const distribution = useMemo(
    () => [
      { band: 'Expired', units: counts.expired.reduce((t, r) => t + r.qty, 0), color: '#ef4444' },
      { band: 'Today', units: counts.today.reduce((t, r) => t + r.qty, 0), color: '#f97316' },
      { band: '0-7 days', units: counts.soon.reduce((t, r) => t + r.qty, 0), color: '#f59e0b' },
      { band: '8-30 days', units: counts.monitor.reduce((t, r) => t + r.qty, 0), color: '#0ea5e9' },
      { band: '30+ days', units: rows.filter(r => r.status === 'SAFE').reduce((t, r) => t + r.qty, 0), color: '#10b981' },
    ],
    [counts, rows],
  )

  const hasFilters = search !== '' || status !== 'ALL'

  if (loading) return <PageSkeleton />

  if (failed) {
    return <ErrorState onRetry={() => { void productsQuery.refetch(); void batchesQuery.refetch() }} />
  }

  if (rows.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Expiry Monitor</h1>
          <p className="text-sm text-[var(--muted)]">Track every batch against its expiry date in one place.</p>
        </div>
        <EmptyState
          icon={Timer}
          title="Nothing to monitor yet"
          message="Once you receive stock, every batch appears here with its days left and action status."
          action={<Link to="/receive"><Button>Receive stock</Button></Link>}
        />
      </div>
    )
  }

  const clearFilters = () => {
    setSearch('')
    setStatus('ALL')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Expiry Monitor</h1>
          <p className="text-sm text-[var(--muted)]">
            Every batch ranked by how long it has left. {counts.expired.length + counts.today.length + counts.soon.length} batches need action.
          </p>
        </div>
        <Link to="/batches">
          <Button variant="secondary">Manage batches</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Expired" value={counts.expired.length} hint="Remove from sale" icon={XCircle} tone="red" />
        <KpiCard label="Expires today" value={counts.today.length} hint="Sell or act now" icon={Clock} tone="amber" />
        <KpiCard label="Expiring soon" value={counts.soon.length} hint="0-7 days left" icon={AlertTriangle} tone="amber" />
        <KpiCard
          label="Value at risk"
          value={formatMoney(counts.atRiskValue)}
          hint="Expired + next 7 days"
          icon={Timer}
          tone="purple"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="font-semibold">Units by expiry window</h2>
          <p className="mb-4 text-sm text-[var(--muted)]">Where the stock sits today, in units.</p>
          <ExpiryDistributionChart data={distribution} />
        </Card>
        <Card>
          <h2 className="font-semibold">Action guide</h2>
          <p className="mb-4 text-sm text-[var(--muted)]">What to do for each band.</p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <XCircle size={16} className="mt-0.5 shrink-0 text-red-600" aria-hidden />
              <span><strong>Expired:</strong> pull from the shelf and record the disposal.</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 shrink-0 text-orange-600" aria-hidden />
              <span><strong>Expires today:</strong> sell first or discount before close.</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" aria-hidden />
              <span><strong>0-7 days:</strong> move to the front and prioritise in FEFO picking.</span>
            </li>
            <li className="flex items-start gap-2">
              <Eye size={16} className="mt-0.5 shrink-0 text-sky-600" aria-hidden />
              <span><strong>8-30 days:</strong> monitor demand and plan transfers.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden />
              <span><strong>30+ days:</strong> safe — keep rotating normally.</span>
            </li>
          </ul>
        </Card>
      </div>

      <Card className="p-0">
        <div className="grid gap-3 p-5 sm:grid-cols-3">
          <Input
            label="Search"
            name="expiry-search"
            placeholder="Product, batch, branch…"
            value={search}
            onChange={event => setSearch(event.target.value)}
            right={<Search size={16} className="text-[var(--muted)]" aria-hidden />}
          />
          <Select
            label="Expiry state"
            name="expiry-status"
            value={status}
            onChange={event => setStatus(event.target.value as ExpiryStatus | 'ALL')}
            options={STATUS_OPTIONS}
          />
          <Select
            label="Sort by"
            name="expiry-sort"
            value={sort}
            onChange={event => setSort(event.target.value as SortKey)}
            options={SORT_OPTIONS}
          />
        </div>

        {visible.length === 0 ? (
          <div className="border-t border-[var(--border)] p-8 text-center">
            <p className="text-sm font-medium">No batches match your filters.</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Try a different search or clear the filters.</p>
            <Button variant="secondary" className="mt-4" onClick={clearFilters}>Clear filters</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-y border-[var(--border)] bg-slate-50 text-xs uppercase tracking-wide text-[var(--muted)] dark:bg-white/5">
                <tr>
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-5 py-3 font-semibold">Batch</th>
                  <th className="px-5 py-3 font-semibold">Branch</th>
                  <th className="px-5 py-3 font-semibold">Units</th>
                  <th className="px-5 py-3 font-semibold">Value</th>
                  <th className="px-5 py-3 font-semibold">Expiry</th>
                  <th className="px-5 py-3 font-semibold">Days left</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(row => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-5 py-3 font-semibold">{row.product}</td>
                    <td className="px-5 py-3 text-[var(--muted)]">{row.batchNo}</td>
                    <td className="px-5 py-3 text-[var(--muted)]">{row.branch}</td>
                    <td className="px-5 py-3">
                      {row.qty.toLocaleString('en-US')} <span className="text-[var(--muted)]">{row.unit}</span>
                    </td>
                    <td className="px-5 py-3 text-[var(--muted)]">{formatMoney(row.value)}</td>
                    <td className="px-5 py-3 text-[var(--muted)]">{formatDate(row.expiryDate)}</td>
                    <td className="px-5 py-3 font-medium">{daysText(row.days)}</td>
                    <td className="px-5 py-3"><StatusBadge status={row.status} /></td>
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
    </div>
  )
}
