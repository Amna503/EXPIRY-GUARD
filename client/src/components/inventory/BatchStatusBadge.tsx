import { AlertTriangle, CheckCircle2, PackageX, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { BatchStatus } from '@/types/inventory'
import { batchStatusMeta } from '@/utils/inventory'

const icons: Record<BatchStatus, LucideIcon> = {
  FRESH: CheckCircle2,
  EXPIRING_SOON: AlertTriangle,
  EXPIRED: XCircle,
  OUT_OF_STOCK: PackageX,
}

export function BatchStatusBadge({ status }: { status: BatchStatus }) {
  const meta = batchStatusMeta[status]
  const Icon = icons[status]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.cls}`}>
      <Icon size={12} aria-hidden /> {meta.label}
    </span>
  )
}
