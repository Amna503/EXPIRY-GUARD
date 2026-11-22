import type { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

type Tone = 'red' | 'amber' | 'sky' | 'purple' | 'emerald'

const tones: Record<Tone, { box: string; icon: string; value: string }> = {
  red:     { box: 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30',             icon: 'bg-red-100 text-red-600 dark:bg-red-500/20',         value: 'text-red-600' },
  amber:   { box: 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30',     icon: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20',   value: 'text-amber-600' },
  sky:     { box: 'bg-sky-50 border-sky-200 dark:bg-sky-500/10 dark:border-sky-500/30',             icon: 'bg-sky-100 text-sky-600 dark:bg-sky-500/20',         value: 'text-sky-600' },
  purple:  { box: 'bg-purple-50 border-purple-200 dark:bg-purple-500/10 dark:border-purple-500/30', icon: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20', value: 'text-purple-600' },
  emerald: { box: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30', icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20', value: 'text-emerald-600' },
}

type Props = {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
  tone?: Tone
}

export function KpiCard({ label, value, hint, icon: Icon, tone = 'emerald' }: Props) {
  const t = tones[tone]
  return (
    <div className={clsx('rounded-2xl border p-5', t.box)}>
      <div className={clsx('mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl', t.icon)}>
        <Icon size={20} aria-hidden />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className={clsx('mt-1 text-3xl font-bold', t.value)}>{value}</p>
      {hint && <p className="mt-1 text-sm text-[var(--muted)]">{hint}</p>}
    </div>
  )
}
