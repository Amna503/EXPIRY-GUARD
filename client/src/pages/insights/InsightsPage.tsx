import { useMemo, useState } from 'react'
import {
  BadgeCheck,
  BrainCircuit,
  CheckCircle2,
  Info,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { KpiCard } from '@/components/ui/KpiCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/toast'
import { WasteTrendChart } from '@/components/charts/WasteTrendChart'
import { useDashboardData } from '@/hooks/useDashboardData'
import { daysLeft, getExpiryStatus } from '@/utils/expiry'
import type { Recommendation } from '@/data/mockInsights'

type Decision = 'approved' | 'dismissed'

const reliabilityCls: Record<Recommendation['reliability'], string> = {
  High: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  Low: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300',
}

function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading insights">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  )
}

export default function InsightsPage() {
  const { batches, wasteTrend, recommendations } = useDashboardData()
  const toast = useToast()
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})

  const queries = [batches, wasteTrend, recommendations]

  const open = useMemo(
    () => (recommendations.data ?? []).filter(r => !decisions[r.id] || decisions[r.id] === 'approved'),
    [recommendations.data, decisions],
  )

  const dismissedCount = useMemo(
    () => Object.values(decisions).filter(d => d === 'dismissed').length,
    [decisions],
  )

  const stats = useMemo(() => {
    const list = recommendations.data ?? []
    const rows = batches.data ?? []
    const surplusUnits = list.reduce((t, r) => t + r.surplus, 0)
    const surplusValue = list.reduce((t, r) => {
      const batch = rows.find(b => b.id === r.batchId)
      return t + (batch ? r.surplus * batch.cost : 0)
    }, 0)
    return {
      suggestions: list.length,
      surplusUnits,
      surplusValue,
      highConfidence: list.filter(r => r.reliability === 'High').length,
      methods: [...new Set(list.map(r => r.method))],
    }
  }, [recommendations.data, batches.data])

  if (queries.some(q => q.isError)) {
    return <ErrorState onRetry={() => queries.forEach(q => q.refetch())} />
  }
  if (!batches.data || !wasteTrend.data || !recommendations.data) {
    return <PageSkeleton />
  }

  const decide = (rec: Recommendation, decision: Decision) => {
    setDecisions(prev => ({ ...prev, [rec.id]: decision }))
    toast.push(
      decision === 'approved' ? 'success' : 'info',
      decision === 'approved'
        ? 'Suggestion approved — a person still confirms the final price or transfer'
        : 'Suggestion dismissed',
    )
  }

  const restore = () => {
    setDecisions({})
    toast.push('info', 'All suggestions restored')
  }

  const batchOf = (rec: Recommendation) => batches.data?.find(b => b.id === rec.batchId) ?? null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold sm:text-2xl">
            <Sparkles size={20} className="mr-1 inline text-emerald-600" aria-hidden /> AI Insights
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Demand estimates and suggested actions for stock that may not sell before expiry. Nothing is applied automatically.
          </p>
        </div>
        {dismissedCount > 0 && (
          <Button variant="secondary" onClick={restore}>Restore {dismissedCount} dismissed</Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Open suggestions" value={stats.suggestions} hint="Waiting for review" icon={Sparkles} tone="emerald" />
        <KpiCard label="Potential surplus" value={`${stats.surplusUnits} units`} hint="Estimated unsold stock" icon={TrendingDown} tone="amber" />
        <KpiCard label="Surplus value" value={`PKR ${stats.surplusValue.toLocaleString('en-US')}`} hint="Estimate, not guaranteed" icon={Wallet} tone="purple" />
        <KpiCard label="High confidence" value={stats.highConfidence} hint="Stronger sales history" icon={BadgeCheck} tone="sky" />
      </div>

      {open.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No suggestions right now"
          message="Every suggestion was handled. New ones appear as stock gets closer to its expiry date."
          action={dismissedCount > 0 ? <Button variant="secondary" onClick={restore}>Restore dismissed</Button> : undefined}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {open.map(rec => {
              const batch = batchOf(rec)
              if (!batch) return null
              const days = daysLeft(batch.expiry)
              const status = getExpiryStatus(days)
              const dismissed = decisions[rec.id] === 'dismissed'
              return (
                <Card key={rec.id} className={dismissed ? 'opacity-60' : undefined}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold">
                        {batch.product} <span className="font-normal text-[var(--muted)]">({batch.batchNo})</span>
                      </h2>
                      <p className="text-sm text-[var(--muted)]">
                        {batch.qty} {batch.unit} in stock · {days} day{days === 1 ? '' : 's'} left · {status.replace('_', ' ').toLowerCase()}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${reliabilityCls[rec.reliability]}`}>
                      Reliability: {rec.reliability}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-[var(--border)] p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Expected demand</p>
                      <p className="mt-1 text-xl font-bold">{rec.forecastDemand}</p>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Potential surplus</p>
                      <p className="mt-1 text-xl font-bold text-amber-600">{rec.surplus}</p>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Method</p>
                      <p className="mt-1 text-sm font-medium">{rec.method}</p>
                    </div>
                  </div>

                  <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                    Suggested action: {rec.action}
                  </p>
                  <p className="mt-3 text-sm text-[var(--muted)]">{rec.explanation}</p>

                  <div className="mt-4 flex flex-wrap gap-3 border-t border-[var(--border)] pt-4">
                    <Button
                      size="sm"
                      disabled={decisions[rec.id] === 'approved'}
                      onClick={() => decide(rec, 'approved')}
                    >
                      <ThumbsUp size={14} aria-hidden />
                      {decisions[rec.id] === 'approved' ? 'Approved' : 'Approve suggestion'}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={dismissed}
                      onClick={() => decide(rec, 'dismissed')}
                    >
                      <ThumbsDown size={14} aria-hidden /> Dismiss
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>

          <div className="space-y-6">
            <Card>
              <h2 className="flex items-center gap-2 font-semibold">
                <Info size={18} className="text-sky-600" aria-hidden /> How these estimates are made
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                {stats.methods.length > 0 ? (
                  stats.methods.map(method => (
                    <li key={method} className="flex gap-2">
                      <BrainCircuit size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden />
                      <span><strong className="text-[var(--text)]">{method}</strong> — used when enough sales history exists.</span>
                    </li>
                  ))
                ) : (
                  <li>No methods recorded yet.</li>
                )}
                <li className="flex gap-2">
                  <Info size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden />
                  <span>With limited history the model falls back to a plain baseline and marks reliability as Low.</span>
                </li>
                <li className="flex gap-2">
                  <Info size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden />
                  <span>Approving never changes a price by itself — a person confirms the discount or transfer.</span>
                </li>
              </ul>
            </Card>

            <Card>
              <h2 className="font-semibold">Waste trend</h2>
              <p className="mb-4 text-sm text-[var(--muted)]">Recorded waste is actual; prevention is an estimate.</p>
              <WasteTrendChart data={wasteTrend.data} />
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
