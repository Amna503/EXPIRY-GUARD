import { AlertTriangle, PackageCheck, PackageX } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ProductStockStatus } from '@/types/inventory'
import { stockStatusMeta } from '@/utils/inventory'

const icons: Record<ProductStockStatus, LucideIcon> = {
  IN_STOCK: PackageCheck,
  LOW_STOCK: AlertTriangle,
  OUT_OF_STOCK: PackageX,
}

export function StockStatusBadge({ status }: { status: ProductStockStatus }) {
  const meta = stockStatusMeta[status]
  const Icon = icons[status]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.cls}`}>
      <Icon size={12} aria-hidden /> {meta.label}
    </span>
  )
}
