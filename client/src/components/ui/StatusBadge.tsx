import { CheckCircle2, Eye, AlertTriangle, Clock, XCircle } from 'lucide-react'
import { statusMeta } from '@/utils/expiry'
import type { ExpiryStatus } from '@/utils/expiry'

const icons = { CheckCircle2, Eye, AlertTriangle, Clock, XCircle }

export function StatusBadge({ status }: { status: ExpiryStatus }) {
  const m = statusMeta[status]
  const Icon = icons[m.icon as keyof typeof icons]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${m.cls}`}>
      <Icon size={12} aria-hidden /> {m.label}
    </span>
  )
}