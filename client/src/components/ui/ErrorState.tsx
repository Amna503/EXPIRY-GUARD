import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

type Props = { title?: string; message?: string; onRetry?: () => void }

export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this data. Check your connection and try again.',
  onRetry,
}: Props) {
  return (
    <div role="alert" className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-500/30 dark:bg-red-500/10">
      <AlertTriangle className="mx-auto mb-3 text-red-600" size={32} aria-hidden />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">{message}</p>
      {onRetry && <Button className="mt-4" onClick={onRetry}>Try again</Button>}
    </div>
  )
}
