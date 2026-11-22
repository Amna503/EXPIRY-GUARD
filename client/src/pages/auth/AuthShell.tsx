import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

type Props = { title: string; subtitle: string; children: ReactNode }

export default function AuthShell({ title, subtitle, children }: Props) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-navy-900 p-12 text-white lg:flex">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <ShieldCheck className="text-emerald-500" aria-hidden /> ExpiryGuard
        </Link>
        <div>
          <h2 className="text-4xl font-bold leading-tight">
            Track. Predict. <span className="text-emerald-400">Prevent waste.</span>
          </h2>
          <p className="mt-4 max-w-md text-slate-300">
            See which stock needs attention, why it is at risk, and what to do about it.
          </p>
        </div>
        <p className="text-sm text-slate-400">2026 ExpiryGuard</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 text-lg font-bold lg:hidden">
            <ShieldCheck className="text-emerald-600" aria-hidden /> ExpiryGuard
          </Link>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}
