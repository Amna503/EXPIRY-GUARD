import { useState } from 'react'
import {
  AlertTriangle,
  Bell,
  Building2,
  Info,
  Moon,
  Palette,
  RefreshCw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/toast'
import { applyTheme, getTheme } from '@/utils/theme'
import type { Theme } from '@/utils/theme'

type Settings = {
  storeName: string
  branchName: string
  timezone: string
  currency: string
  address: string
  monitorDays: number
  soonDays: number
  fefo: boolean
  autoMarkdown: boolean
  expiryAlerts: boolean
  lowStock: boolean
  dailyDigest: boolean
  weeklyReport: boolean
  theme: Theme
}

const STORAGE_KEY = 'expiryguard-settings'

const DEFAULTS: Settings = {
  storeName: 'Demo Supermarket',
  branchName: 'Main Branch',
  timezone: 'Asia/Karachi',
  currency: 'PKR',
  address: 'Shahrah-e-Faisal, Karachi',
  monitorDays: 30,
  soonDays: 7,
  fefo: true,
  autoMarkdown: false,
  expiryAlerts: true,
  lowStock: true,
  dailyDigest: true,
  weeklyReport: false,
  theme: 'light',
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS, theme: getTheme() }
    const parsed = JSON.parse(raw) as Partial<Settings>
    return { ...DEFAULTS, ...parsed, theme: getTheme() }
  } catch {
    return { ...DEFAULTS, theme: getTheme() }
  }
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-[var(--border)] p-3 hover:bg-slate-50 dark:hover:bg-white/5">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block text-xs text-[var(--muted)]">{hint}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={event => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-emerald-600"
      />
    </label>
  )
}

export default function SettingsPage() {
  const toast = useToast()
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [resetOpen, setResetOpen] = useState(false)

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const save = (label: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      toast.push('success', `${label} saved`)
    } catch {
      toast.push('error', 'Could not save settings — storage is blocked')
    }
  }

  const applyAppearance = (theme: Theme) => {
    applyTheme(theme)
    update('theme', theme)
  }

  const resetAll = () => {
    const next: Settings = { ...DEFAULTS, theme: 'light' }
    applyTheme('light')
    setSettings(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Ignore storage errors; the form still resets.
    }
    toast.push('success', 'Settings reset to defaults')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-[var(--muted)]">
            Store details, expiry rules, notifications and how this workspace looks.
          </p>
        </div>
        <Button onClick={() => save('All settings')}>
          <Save size={16} aria-hidden /> Save all
        </Button>
      </div>

      <Card className="flex flex-wrap items-center gap-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white" aria-hidden>
          DS
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{settings.storeName}</p>
          <p className="text-sm text-[var(--muted)]">
            owner@demo.example · {settings.branchName} · {settings.currency}
          </p>
        </div>
        <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold">
          Demo workspace
        </span>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 font-semibold">
            <Building2 size={18} className="text-emerald-600" aria-hidden /> Store profile
          </h2>
          <p className="mb-4 text-sm text-[var(--muted)]">Shown on receipts, reports and the sidebar.</p>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Store name"
                name="storeName"
                value={settings.storeName}
                onChange={event => update('storeName', event.target.value)}
              />
              <Input
                label="Default branch"
                name="branchName"
                value={settings.branchName}
                onChange={event => update('branchName', event.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Timezone"
                name="timezone"
                value={settings.timezone}
                onChange={event => update('timezone', event.target.value)}
                options={[
                  { value: 'Asia/Karachi', label: 'Asia/Karachi (PKT)' },
                  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
                  { value: 'Europe/London', label: 'Europe/London (GMT)' },
                  { value: 'America/New_York', label: 'America/New_York (ET)' },
                ]}
              />
              <Select
                label="Currency"
                name="currency"
                value={settings.currency}
                onChange={event => update('currency', event.target.value)}
                options={[
                  { value: 'PKR', label: 'PKR — Pakistani Rupee' },
                  { value: 'AED', label: 'AED — UAE Dirham' },
                  { value: 'USD', label: 'USD — US Dollar' },
                  { value: 'GBP', label: 'GBP — Pound Sterling' },
                ]}
              />
            </div>
            <Textarea
              label="Address"
              name="address"
              rows={3}
              value={settings.address}
              onChange={event => update('address', event.target.value)}
              hint="Appears on printed reports."
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={() => save('Store profile')}>
                <Save size={14} aria-hidden /> Save profile
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 font-semibold">
            <SlidersHorizontal size={18} className="text-emerald-600" aria-hidden /> Expiry rules
          </h2>
          <p className="mb-4 text-sm text-[var(--muted)]">How batches are coloured and picked.</p>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Monitor window (days)"
                name="monitorDays"
                type="number"
                min={1}
                max={365}
                value={settings.monitorDays}
                onChange={event => update('monitorDays', Number(event.target.value))}
              />
              <Input
                label="Expiring soon window (days)"
                name="soonDays"
                type="number"
                min={1}
                max={90}
                value={settings.soonDays}
                onChange={event => update('soonDays', Number(event.target.value))}
              />
            </div>
            <Toggle
              label="Force FEFO picking"
              hint="Always sell the batch closest to expiry first."
              checked={settings.fefo}
              onChange={next => update('fefo', next)}
            />
            <Toggle
              label="Suggest auto-discounts"
              hint="AI flags stock that may need a markdown before expiry."
              checked={settings.autoMarkdown}
              onChange={next => update('autoMarkdown', next)}
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={() => save('Expiry rules')}>
                <Save size={14} aria-hidden /> Save rules
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 font-semibold">
            <Bell size={18} className="text-emerald-600" aria-hidden /> Notifications
          </h2>
          <p className="mb-4 text-sm text-[var(--muted)]">Sent to owner@demo.example.</p>
          <div className="space-y-3">
            <Toggle
              label="Expiry alerts"
              hint="When a batch enters the expiring-soon window."
              checked={settings.expiryAlerts}
              onChange={next => update('expiryAlerts', next)}
            />
            <Toggle
              label="Low stock alerts"
              hint="When available stock falls to the product minimum."
              checked={settings.lowStock}
              onChange={next => update('lowStock', next)}
            />
            <Toggle
              label="Daily digest"
              hint="A morning summary of what needs action today."
              checked={settings.dailyDigest}
              onChange={next => update('dailyDigest', next)}
            />
            <Toggle
              label="Weekly waste report"
              hint="Recorded vs estimated prevented waste, every Monday."
              checked={settings.weeklyReport}
              onChange={next => update('weeklyReport', next)}
            />
            <div className="flex justify-end pt-1">
              <Button size="sm" onClick={() => save('Notifications')}>
                <Save size={14} aria-hidden /> Save notifications
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 font-semibold">
            <Palette size={18} className="text-emerald-600" aria-hidden /> Appearance
          </h2>
          <p className="mb-4 text-sm text-[var(--muted)]">Applies immediately and is remembered on this device.</p>
          <div className="space-y-4">
            <Select
              label="Theme"
              name="theme"
              value={settings.theme}
              onChange={event => applyAppearance(event.target.value as Theme)}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
            />
            <div className="flex gap-3">
              <span className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm">
                <Sun size={16} className="text-amber-500" aria-hidden /> Light mode
              </span>
              <span className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm">
                <Moon size={16} className="text-sky-500" aria-hidden /> Dark mode
              </span>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-slate-50 p-3 text-xs text-[var(--muted)] dark:bg-white/5">
              The header moon button toggles the same theme from anywhere in the app.
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => save('Appearance')}>
                <Save size={14} aria-hidden /> Save appearance
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 font-semibold">
            <Info size={18} className="text-sky-600" aria-hidden /> Demo data
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            This workspace runs on demo data (<code className="rounded bg-slate-100 px-1 dark:bg-white/10">VITE_USE_MOCK=true</code>).
            Products, batches and insights are seeded so every page has something to show. Switch the flag to call a real backend.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-[var(--muted)]">
            <li>· <code className="rounded bg-slate-100 px-1 dark:bg-white/10">?empty=1</code> shows empty states.</li>
            <li>· <code className="rounded bg-slate-100 px-1 dark:bg-white/10">?fail=1</code> shows error states.</li>
          </ul>
        </Card>

        <Card className="border-red-200 dark:border-red-500/30">
          <h2 className="flex items-center gap-2 font-semibold text-red-600">
            <AlertTriangle size={18} aria-hidden /> Reset
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Puts every setting on this page back to its default value. Stock and team data are not affected.
          </p>
          <Button variant="danger" className="mt-4" onClick={() => setResetOpen(true)}>
            <RefreshCw size={16} aria-hidden /> Reset settings
          </Button>
        </Card>
      </div>

      <Card className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
        <ShieldCheck size={18} className="text-emerald-600" aria-hidden />
        Signed in as owner@demo.example · Role: Owner · Sessions expire after 7 days of inactivity.
      </Card>

      <ConfirmDialog
        open={resetOpen}
        title="Reset all settings?"
        message="Store profile, expiry rules, notifications and appearance return to their defaults. This cannot be undone."
        confirmLabel="Reset"
        onConfirm={resetAll}
        onClose={() => setResetOpen(false)}
      />
    </div>
  )
}
