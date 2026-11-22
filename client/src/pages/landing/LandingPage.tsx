import { Link } from 'react-router-dom'
import {
  ShieldCheck, Bell, ScanLine, QrCode, Sparkles, BarChart3, Boxes, ArrowRight,
  Store, UtensilsCrossed, Pill, Warehouse, ShoppingBasket, CheckCircle2, XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'

const features = [
  { icon: Boxes, title: 'Batch-level tracking', text: 'Every batch has its own expiry date, quantity and QR label.' },
  { icon: Bell, title: 'Smart expiry alerts', text: 'Timely warnings before stock expires, with no duplicate alerts.' },
  { icon: ScanLine, title: 'Barcode scanning', text: 'Find products fast with the camera, or type the code by hand.' },
  { icon: QrCode, title: 'QR batch labels', text: 'Print a secure QR for each batch and open its record in seconds.' },
  { icon: Sparkles, title: 'Explainable forecasts', text: 'Estimate potential surplus and see why a batch is at risk.' },
  { icon: BarChart3, title: 'Waste analytics', text: 'Separate actual recorded waste from estimated prevention.' },
]

const businesses = [
  { icon: Store, name: 'Supermarkets' },
  { icon: UtensilsCrossed, name: 'Restaurants' },
  { icon: Pill, name: 'Pharmacies' },
  { icon: Warehouse, name: 'Warehouses' },
  { icon: ShoppingBasket, name: 'Small shops' },
]

const steps = [
  { n: '1', title: 'Add products', text: 'Create your catalog or scan a barcode.' },
  { n: '2', title: 'Receive batches', text: 'Enter quantity and expiry, then print the QR label.' },
  { n: '3', title: 'Get alerts', text: 'ExpiryGuard watches every batch for you.' },
  { n: '4', title: 'Act early', text: 'Use FEFO, review discounts and cut waste.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Top menu */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <ShieldCheck className="text-emerald-600" aria-hidden /> ExpiryGuard
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--muted)] md:flex">
            <a href="#features" className="hover:text-[var(--text)]">Features</a>
            <a href="#business" className="hover:text-[var(--text)]">Business types</a>
            <a href="#how" className="hover:text-[var(--text)]">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="secondary" size="sm">Log in</Button></Link>
            <Link to="/register"><Button size="sm">Get started</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-3 inline-block rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
              AI-powered expiry and waste prevention
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Track. Predict. <span className="text-emerald-400">Prevent waste.</span>
            </h1>
            <p className="mt-4 max-w-lg text-slate-300">
              ExpiryGuard helps supermarkets, restaurants, pharmacies and warehouses see which stock
              needs attention, why it is at risk, and what to do about it.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register">
                <Button className="px-6 py-3">Start free <ArrowRight size={16} aria-hidden /></Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="secondary" className="px-6 py-3 !border-white/20 !bg-transparent !text-white hover:!bg-white/10">
                  View demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Mini preview */}
          <div className="rounded-2xl border border-white/10 bg-navy-800 p-5 shadow-2xl">
            <p className="mb-3 text-sm font-semibold text-slate-300">Today at a glance</p>
            <div className="space-y-3">
              {[
                { name: 'Fresh Milk 1L', info: 'Batch B-1042', s: 'EXPIRING_SOON' as const },
                { name: 'Greek Yogurt', info: 'Batch B-0987', s: 'EXPIRES_TODAY' as const },
                { name: 'Cheddar Cheese', info: 'Batch B-0911', s: 'EXPIRED' as const },
                { name: 'Orange Juice', info: 'Batch B-1103', s: 'SAFE' as const },
              ].map(r => (
                <div key={r.info} className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">{r.name}</p>
                    <p className="text-xs text-slate-400">{r.info}</p>
                  </div>
                  <StatusBadge status={r.s} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem and solution */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-500/30 dark:bg-red-500/10">
            <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-red-700 dark:text-red-300">
              <XCircle aria-hidden /> The problem
            </h2>
            <ul className="space-y-2 text-sm text-red-900 dark:text-red-200">
              <li>Stock expires before it is sold or used, causing avoidable loss.</li>
              <li>Staff do not know which batch to sell first.</li>
              <li>Owners cannot see near-expiry stock or waste trends.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 aria-hidden /> The solution
            </h2>
            <ul className="space-y-2 text-sm text-emerald-900 dark:text-emerald-200">
              <li>Batch-level expiry tracking with clear status labels.</li>
              <li>FEFO guidance: first expired, first out.</li>
              <li>Alerts, forecasts and analytics in one dashboard.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-[var(--surface)] py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">Everything you need to stop waste</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <Icon size={22} aria-hidden />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business types */}
      <section id="business" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold">Built for every kind of business</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {businesses.map(({ icon: Icon, name }) => (
            <div key={name} className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold">
              <Icon size={18} className="text-emerald-600" aria-hidden /> {name}
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-[var(--surface)] py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">How it works</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(s => (
              <div key={s.n} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">
                  {s.n}
                </div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="bg-navy-900 py-16 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-3xl font-bold">Move from reactive tracking to proactive expiry management</h2>
          <p className="mt-3 text-slate-300">Create your workspace in minutes.</p>
          <Link to="/register" className="mt-6 inline-block">
            <Button className="px-8 py-3">Create free account</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-6 text-center text-sm text-[var(--muted)]">
        2026 ExpiryGuard. Track. Predict. Prevent waste.
      </footer>
    </div>
  )
}
