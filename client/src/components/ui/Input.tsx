import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  right?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, right, id, className, ...rest },
  ref,
) {
  const inputId = id ?? rest.name
  return (
    <div>
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium">{label}</label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={clsx(
            'w-full rounded-lg border bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500',
            error ? 'border-red-500' : 'border-[var(--border)]',
            right && 'pr-10',
            className,
          )}
          {...rest}
        />
        {right && <div className="absolute inset-y-0 right-0 flex items-center pr-3">{right}</div>}
      </div>
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
})
