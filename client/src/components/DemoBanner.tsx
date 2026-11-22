import { FlaskConical } from 'lucide-react'
import { USE_MOCK } from '@/services/http'

export default function DemoBanner() {
  if (!USE_MOCK) return null
  return (
    <div
      role="note"
      className="mb-6 flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200"
    >
      <FlaskConical size={18} className="mt-0.5 shrink-0" aria-hidden />
      <p>
        <strong>Demo data.</strong> Figures on this screen are sample data for demonstration. Forecasts are estimates, not guarantees.
      </p>
    </div>
  )
}
