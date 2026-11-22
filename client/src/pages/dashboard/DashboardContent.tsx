import { Link } from 'react-router-dom'
import { AlertTriangle, Boxes, CheckCircle2, Eye, Sparkles, Trash2, TrendingDown, Wallet, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ExpiryDistributionChart } from '@/components/charts/ExpiryDistributionChart'
import { WasteTrendChart } from '@/components/charts/WasteTrendChart'
import type { Batch } from '@/data/mockData'
import type { Recommendation, WastePoint } from '@/data/mockInsights'
import { daysLeft, getExpiryStatus } from '@/utils/expiry'
import type { ExpiryStatus } from '@/utils/expiry'

type Row = Batch & { days: number; status: ExpiryStatus }
type Props = { batches: Batch[]; wasteTrend: WastePoint[]; recommendations: Recommendation[] }

const units = (list: Row[]) => list.reduce((t, r) => t + r.qty, 0)
const value = (list: Row[]) => list.reduce((t, r) => t + r.qty * r.cost, 0)
const money = (n: number) => 'PKR ' + n.toLocaleString('en-US')

function daysText(days: number) {
  if (days < 0) return `${-days} day${days === -1 ? '' : 's'} overdue`
  if (days === 0) return 'Today'
  return `${days} day${days === 1 ? '' : 's'}`
}

function alertText(r: Row) {
  if (r.days < 0) return `Expired ${-r.days} day${r.days === -1 ? '' : 's'} ago. Remove from sale and record disposal.`
  if (r.days === 0) return 'Expires today. Sell first or take action today.'
  return `Expires in ${r.days} day${r.days === 1 ? '' : 's'}. Sell using FEFO.`
}

export default function DashboardContent({ batches, wasteTrend, recommendations }: Props) {
  const rows: Row[] = batches.map(b => {
    const days = daysLeft(b.expiry)
    return { ...b, days, status: getExpiryStatus(days) }
  })

  const expired = rows.filter(r => r.days < 0)
  const urgent = rows.filter(r => r.days >= 0 && r.days <= 7)
  const monitor = rows.filter(r => r.days >= 8 && r.days <= 30)
  const safe = rows.filter(r => r.days > 30)
  const sellable = rows.filter(r => r.days >= 0)

  const recordedWaste = wasteTrend.reduce((t, p) => t + p.recorded, 0)
  const potentialSurplus = recommendations.reduce((t, r) => t + r.surplus, 0)

  const distribution = [
    { band: 'Expired', units: units(expired), color: '#ef4444' },
    { band: '0-7 days', units: units(urgent), color: '#f59e0b' },
    { band: '8-30 days', units: units(monitor), color: '#0ea5e9' },
    { band: '30+ days', units: units(safe), color: '#10b981' },
  ]

  const topRisk = [...rows].sort((a, b) => a.days - b.days).slice(0, 6)
  const recentAlerts = [...rows].filter(r => r.days <= 7).sort((a, b) => a.days - b.days).slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Good morning!</h1>
        <p className="text-sm text-[var(--muted)]">
          {expired.length + urgent.length} batches need attention. Stock at risk in the next 7 days: {money(value(urgent))}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Expired" value={expired.length} hint={`${money(value(expired))} to remove`} icon={XCircle} tone="red" />
        <KpiCard label="Expiring" value={urgent.length} hint="0-7 days left" icon={AlertTriangle} tone="amber" />
        <KpiCard label="Monitor" value={monitor.length} hint="8-30 days left" icon={Eye} tone="sky" />
        <KpiCard label="Safe" value={safe.length} hint="More than 30 days" icon={CheckCircle2} tone="emerald" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total stock units" value={units(sellable).toLocaleString('en-US')} hint="Active, non-expired (demo)" icon={Boxes} tone="sky" />
        <KpiCard label="Inventory value" value={money(value(sellable))} hint="Remaining qty x cost" icon={Wallet} tone="emerald" />
        <KpiCard label="Recorded waste" value={money(recordedWaste)} hint="Actual, last 6 weeks" icon={Trash2} tone="red" />
        <KpiCard label="Potential surplus" value={`${potentialSurplus} units`} hint="Estimate, not guaranteed" icon={TrendingDown} tone="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Stock units by expiry window</h2>
          <p className="mb-4 text-sm text-[var(--muted)]">How much stock sits in each expiry band.</p>
          <ExpiryDistributionChart data={distribution} />
        </Card>
        <Card>
          <h2 className="font-semibold">Waste trend</h2>
          <p className="mb-4 text-sm text-[var(--muted)]">Actual waste is recorded. Prevention is an estimate.</p>
          <WasteTrendChart data={wasteTrend} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-0">
          <div className="p-5 pb-3">
            <h2 className="font-semibold">Recent alerts</h2>
            <p className="text-sm text-[var(--muted)]">Batches that need action now.</p>
          </div>
          <ul>
            {recentAlerts.map(r => (
              <li key={r.id} className="flex items-start justify-between gap-3 border-t border-[var(--border)] px-5 py-3">
                <div>
                  <p className="text-sm font-semibold">{r.product} <span className="font-normal text-[var(--muted)]">({r.batchNo})</span></p>
                  <p className="text-sm text-[var(--muted)]">{alertText(r)}</p>
                </div>
                <div className="shrink-0"><StatusBadge status={r.status} /></div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-0">
          <div className="p-5 pb-3">
            <h2 className="flex items-center gap-2 font-semibold">
              <Sparkles size={18} className="text-emerald-600" aria-hidden /> AI recommendations
            </h2>
            <p className="text-sm text-[var(--muted)]">Estimates only. A person approves every discount or transfer.</p>
          </div>
          <ul>
            {recommendations.map(rec => {
              const b = rows.find(r => r.id === rec.batchId)
              if (!b) return null
              return (
                <li key={rec.id} className="space-y-1 border-t border-[var(--border)] px-5 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold">{b.product} <span className="font-normal text-[var(--muted)]">({b.batchNo})</span></p>
                    <span className="shrink-0 rounded-full border border-[var(--border)] px-2 py-0.5 text-xs font-semibold">
                      Reliability: {rec.reliability}
                    </span>
                  </div>
                  <p className="text-sm">
                    {b.qty} in stock, about {rec.forecastDemand} expected to sell in {b.days} day{b.days === 1 ? '' : 's'}.
                    Potential surplus: <strong>{rec.surplus} units</strong>.
                  </p>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Suggested: {rec.action}</p>
                  <p className="text-xs text-[var(--muted)]">Why: {rec.explanation} Method: {rec.method}.</p>
                </li>
              )
            })}
          </ul>
          <div className="border-t border-[var(--border)] px-5 py-3 text-sm">
            <Link to="/insights" className="font-semibold text-emerald-600 hover:underline">See all insights</Link>
          </div>
        </Card>
      </div>

      <Card className="p-0">
        <div className="p-5 pb-3">
          <h2 className="font-semibold">Top-risk batches</h2>
          <p className="text-sm text-[var(--muted)]">Closest to expiry first. Use or move these first (FEFO).</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-y border-[var(--border)] bg-slate-50 text-xs uppercase tracking-wide text-[var(--muted)] dark:bg-white/5">
              <tr>
                <th className="px-5 py-3 font-semibold">Product</th>
                <th className="px-5 py-3 font-semibold">Batch</th>
                <th className="px-5 py-3 font-semibold">Quantity</th>
                <th className="px-5 py-3 font-semibold">Expiry date</th>
                <th className="px-5 py-3 font-semibold">Days left</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {topRisk.map(r => (
                <tr key={r.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-5 py-3 font-semibold">{r.product}</td>
                  <td className="px-5 py-3 text-[var(--muted)]">{r.batchNo}</td>
                  <td className="px-5 py-3">{r.qty} {r.unit}</td>
                  <td className="px-5 py-3">{r.expiry}</td>
                  <td className="px-5 py-3">{daysText(r.days)}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
