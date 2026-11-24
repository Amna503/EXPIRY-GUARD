import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { ToastContext, useToastState } from './toast'
import type { ToastKind } from './toast'

const styles: Record<ToastKind, { cls: string; icon: typeof CheckCircle2 }> = {
  success: {
    cls: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100',
    icon: CheckCircle2,
  },
  error: {
    cls: 'border-red-200 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100',
    icon: AlertTriangle,
  },
  info: {
    cls: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100',
    icon: Info,
  },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const { items, push, dismiss } = useToastState()

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {items.map(item => {
          const s = styles[item.kind]
          const Icon = s.icon
          return (
            <div
              key={item.id}
              role={item.kind === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${s.cls}`}
            >
              <Icon size={18} className="mt-0.5 shrink-0" aria-hidden />
              <p className="flex-1">{item.message}</p>
              <button
                type="button"
                aria-label="Dismiss notification"
                className="shrink-0 opacity-60 hover:opacity-100"
                onClick={() => dismiss(item.id)}
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
