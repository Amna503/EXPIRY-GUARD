import clsx from 'clsx'

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={clsx('animate-pulse rounded-lg bg-slate-200 dark:bg-white/10', className)} />
}
