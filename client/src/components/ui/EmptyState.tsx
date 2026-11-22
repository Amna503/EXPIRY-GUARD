import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

type Props = { icon: LucideIcon; title: string; message: string; action?: ReactNode }

export function EmptyState({ icon: Icon, title, message, action }: Props) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
        <Icon size={26} aria-hidden />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
