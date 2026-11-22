import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, Package, Boxes, PackagePlus, ScanLine, Timer, Sparkles,
  BarChart3, GitBranch, Users, Settings, Bell, Menu, Moon, ShieldCheck, X,
} from 'lucide-react'
import clsx from 'clsx'
import DemoBanner from '@/components/DemoBanner'
import { toggleTheme } from '@/utils/theme'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/batches', label: 'Batches', icon: Boxes },
  { to: '/receive', label: 'Receive Stock', icon: PackagePlus },
  { to: '/scanner', label: 'Scanner', icon: ScanLine },
  { to: '/expiry', label: 'Expiry Monitor', icon: Timer },
  { to: '/insights', label: 'AI Insights', icon: Sparkles },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/branches', label: 'Branches', icon: GitBranch },
  { to: '/team', label: 'Team & Roles', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function AppLayout() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-emerald-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy-900 text-slate-300 transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full max-lg:invisible',
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <ShieldCheck className="text-emerald-500" aria-hidden /> ExpiryGuard
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                  isActive ? 'bg-emerald-600 text-white' : 'hover:bg-white/5 hover:text-white',
                )
              }
            >
              <Icon size={18} aria-hidden /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4 text-xs text-slate-400">Demo Supermarket</div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 lg:px-8">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
            <Menu size={22} />
          </button>
          <div className="hidden text-sm text-[var(--muted)] lg:block">Main Branch</div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-[var(--border)] p-2"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              <Moon size={18} />
            </button>
            <button className="relative rounded-lg border border-[var(--border)] p-2" aria-label="Notifications, 3 unread">
              <Bell size={18} />
              <span aria-hidden className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">3</span>
            </button>
            <div className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white" aria-hidden>U</div>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="p-4 outline-none lg:p-8">
          <DemoBanner />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
