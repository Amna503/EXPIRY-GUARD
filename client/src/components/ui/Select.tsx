import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'
import clsx from 'clsx'

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  /** Renders the label for screen readers only (useful inside tables). */
  labelHidden?: boolean
  error?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, labelHidden, error, options, id, className, ...rest },
  ref,
) {
  const selectId = id ?? rest.name
  return (
    <div>
      <label htmlFor={selectId} className={clsx('mb-1 block text-sm font-medium', labelHidden && 'sr-only')}>{label}</label>
      <select
        ref={ref}
        id={selectId}
        aria-invalid={!!error}
        className={clsx(
          'w-full rounded-lg border bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500',
          error ? 'border-red-500' : 'border-[var(--border)]',
          className,
        )}
        {...rest}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
})
