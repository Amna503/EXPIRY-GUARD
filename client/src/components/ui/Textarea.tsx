import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import clsx from 'clsx'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { label, error, hint, id, className, ...rest },
  ref,
) {
  const inputId = id ?? rest.name
  return (
    <div>
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium">{label}</label>
      <textarea
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        className={clsx(
          'w-full rounded-lg border bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500',
          error ? 'border-red-500' : 'border-[var(--border)]',
          className,
        )}
        {...rest}
      />
      {hint && !error && <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>}
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
})
