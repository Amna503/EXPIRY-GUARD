import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Boxes,
  CalendarClock,
  Layers,
  PackageOpen,
  Percent,
  Receipt,
  TrendingDown,
  TrendingUp,
  Truck,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { KpiCard } from '@/components/ui/KpiCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { ExpiryDistributionChart } from '@/components/charts/ExpiryDistributionChart'
import { WasteTrendChart } from '@/components/charts/WasteTrendChart'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useBatches, useProducts } from '@/hooks/useInventory'
import { buildBatchRows } from '@/utils/inventoryList'
import { earliestExpiry, formatDate, formatMoney, totalAvailableQuantity } from '@/utils/inventory'

function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading analytics">
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

export default function AnalyticsPage() {
  const productsQuery = useProducts()
  const batchesQuery = useBatches()
  const wasteQuery = useDashboardData().wasteTrend

  const products = productsQuery.data
  const batches = batchesQuery.data
  const wasteTrend = wasteQuery.data

  const loading = productsQuery.isLoading || batchesQuery.isLoading || wasteQuery.isLoading
  const failed = productsQuery.isError || batchesQuery.isError || wasteQuery.isError

  const rows = useMemo(
    () => (products && batches ? buildBatchRows(products, batches) : []),
    [products, batches],
  )

  const stats = useMemo(() => {
    const sellable = rows.filter(r => r.days >= 0)
    const units = sellable.reduce((t, r) => t + r.batch.availableQuantity, 0)
    const value = sellable.reduce((t, r) => t + r.batch.availableQuantity * r.batch.purchasePrice, 0)
    const weightedDays = units
      ? sellable.reduce((t, r) => t + r.days * r.batch.availableQuantity, 0) / units
      : 0
    const atRisk = rows.filter(r => r.days >= 0 && r.days <= 7)
    return {
      units,
      value,
      avgDays: Math.round(weightedDays),
      atRiskUnits: atRisk.reduce((t, r) => t + r.batch.availableQuantity, 0),
      atRiskValue: atRisk.reduce((t, r) => t + r.batch.availableQuantity * r.batch.purchasePrice, 0),
      expiredValue: rows
        .filter(r => r.days < 0)
        .reduce((t, r) => t + r.batch.availableQuantity * r.batch.purchasePrice, 0),
    }
  }, [rows])

  const distribution = useMemo(() => {
    const band = (test: (d: number) => boolean) =>
      rows.filter(r => r.days >= 0 && test(r.days)).reduce((t, r) => t + r.batch.availableQuantity, 0)
    return [
      { band: 'Expired', units: rows.filter(r => r.days < 0).reduce((t, r) => t + r.batch.availableQuantity, 0), color: '#ef4444' },
      { band: '0-7 days', units: band(d => d <= 7), color: '#f59e0b' },
      { band: '8-30 days', units: band(d => d <= 30), color: '#0ea5e9' },
      { band: '30+ days', units: band(() => true), color: '#10b981' },
    ]
  }, [rows])

  const categories = useMemo(() => {
    if (!products || !batches) return []
    const map = new Map<
      string,
      { category: string; products: number; units: number; value: number; earliest: string | null }
    >()
    for (const product of products) {
      const units = totalAvailableQuantity(batches, product.id)
      const value = batches
        .filter(b => b.productId === product.id)
        .reduce((t, b) => t + b.availableQuantity * b.purchasePrice, 0)
      const expiry = earliestExpiry(batches, product.id)
      const entry = map.get(product.category) ?? {
        category: product.category,
        products: 0,
        units: 0,
        value: 0,
        earliest: null,
      }
      entry.products += 1
      entry.units += units
      entry.value += value
      if (expiry && (!entry.earliest || expiry < entry.earliest)) entry.earliest = expiry
      map.set(product.category, entry)
    }
    return [...map.values()].sort((a, b) => b.value - a.value)
  }, [products, batches])

  const suppliers = useMemo(() => {
    if (!batches) return []
    const map = new Map<string, { supplier: string; batches: number; units: number; value: number }>()
    for (const batch of batches) {
      const supplier = batch.supplierName || 'Unknown supplier'
      const entry = map.get(supplier) ?? { supplier, batches: 0, units: 0, value: 0 }
      entry.batches += 1
      entry.units += batch.availableQuantity
      entry.value += batch.availableQuantity * batch.purchasePrice
      map.set(supplier, entry)
    }
    return [...map.values()].sort((a, b) => b.value - a.value).slice(0, 6)
  }, [batches])

  const wasteStats = useMemo(() => {
    const list = wasteTrend ?? []
    const recorded = list.reduce((t, p) => t + p.recorded, 0)
    const prevented = list.reduce((t, p) => t + p.prevented, 0)
    const first = list[0]?.recorded ?? 0
    const last = list[list.length - 1]?.recorded ?? 0
    const change = first ? Math.round(((last - first) / first) * 100) : 0
    return { recorded, prevented, change, weeks: list.length }
  }, [wasteTrend])

  if (loading) return <PageSkeleton />

  if (failed) {
    return (
      <ErrorState
        onRetry={() => {
          void productsQuery.refetch()
          void batchesQuery.refetch()
          void wasteQuery.refetch()
        }}
      />
    )
  }

  if (rows.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-[var(--muted)]">Trends across stock, expiry windows and waste.</p>
        </div>
        <EmptyState
          icon={PackageOpen}
          title="No data to analyse yet"
          message="Receive some stock and the analytics here will fill up with units, value and expiry trends."
          action={<Link to="/receive"><Button>Receive stock</Button></Link>}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-[var(--muted)]">
            How much stock you hold, how soon it expires, and where waste is trending.
          </p>
        </div>
        <Link to="/expiry"><Button variant="secondary">Open expiry monitor</Button></Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Units on hand" value={stats.units.toLocaleString('en-US')} hint="Non-expired stock" icon={Boxes} tone="sky" />
        <KpiCard label="Inventory value" value={formatMoney(stats.value)} hint="Qty × purchase price" icon={Wallet} tone="emerald" />
        <KpiCard label="Avg. days to expiry" value={stats.avgDays} hint="Weighted by units" icon={CalendarClock} tone="purple" />
        <KpiCard label="Waste, last 6 weeks" value={formatMoney(wasteStats.recorded)} hint="Recorded (actual)" icon={Receipt} tone="red" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="At-risk units" value={stats.atRiskUnits.toLocaleString('en-US')} hint="Expiring within 7 days" icon={AlertTriangle} tone="amber" />
        <KpiCard label="At-risk value" value={formatMoney(stats.atRiskValue)} hint="Next 7 days" icon={TrendingDown} tone="amber" />
        <KpiCard label="Expired value" value={formatMoney(stats.expiredValue)} hint="Needs disposal" icon={Percent} tone="red" />
        <KpiCard
          label="Waste trend"
          value={`${wasteStats.change > 0 ? '+' : ''}${wasteStats.change}%`}
          hint="First vs last week"
          icon={wasteStats.change <= 0 ? TrendingUp : TrendingDown}
          tone={wasteStats.change <= 0 ? 'emerald' : 'red'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Stock by expiry window</h2>
          <p className="mb-4 text-sm text-[var(--muted)]">Units sitting in each band today.</p>
          <ExpiryDistributionChart data={distribution} />
        </Card>
        <Card>
          <h2 className="font-semibold">Waste trend</h2>
          <p className="mb-4 text-sm text-[var(--muted)]">
            {wasteStats.weeks} weeks · {formatMoney(wasteStats.prevented)} estimated prevention.
          </p>
          <WasteTrendChart data={wasteTrend ?? []} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-0">
          <div className="p-5 pb-3">
            <h2 className="flex items-center gap-2 font-semibold">
              <Layers size={18} className="text-emerald-600" aria-hidden /> Stock by category
            </h2>
            <p className="text-sm text-[var(--muted)]">Value and coverage per product category.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-y border-[var(--border)] bg-slate-50 text-xs uppercase tracking-wide text-[var(--muted)] dark:bg-white/5">
                <tr>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Products</th>
                  <th className="px-5 py-3 font-semibold">Units</th>
                  <th className="px-5 py-3 font-semibold">Value</th>
                  <th className="px-5 py-3 font-semibold">Earliest expiry</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(row => (
                  <tr key={row.category} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-5 py-3 font-semibold">{row.category}</td>
                    <td className="px-5 py-3">{row.products}</td>
                    <td className="px-5 py-3">{row.units.toLocaleString('en-US')}</td>
                    <td className="px-5 py-3">{formatMoney(row.value)}</td>
                    <td className="px-5 py-3 text-[var(--muted)]">{formatDate(row.earliest)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-0">
          <div className="p-5 pb-3">
            <h2 className="flex items-center gap-2 font-semibold">
              <Truck size={18} className="text-emerald-600" aria-hidden /> Top suppliers by stock value
            </h2>
            <p className="text-sm text-[var(--muted)]">Where your inventory money is tied up.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-y border-[var(--border)] bg-slate-50 text-xs uppercase tracking-wide text-[var(--muted)] dark:bg-white/5">
                <tr>
                  <th className="px-5 py-3 font-semibold">Supplier</th>
                  <th className="px-5 py-3 font-semibold">Batches</th>
                  <th className="px-5 py-3 font-semibold">Units</th>
                  <th className="px-5 py-3 font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map(row => (
                  <tr key={row.supplier} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-5 py-3 font-semibold">{row.supplier}</td>
                    <td className="px-5 py-3">{row.batches}</td>
                    <td className="px-5 py-3">{row.units.toLocaleString('en-US')}</td>
                    <td className="px-5 py-3">{formatMoney(row.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
