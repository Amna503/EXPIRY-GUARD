import { differenceInCalendarDays, parseISO } from 'date-fns'

export type ExpiryStatus = 'SAFE' | 'MONITOR' | 'EXPIRING_SOON' | 'EXPIRES_TODAY' | 'EXPIRED'

export function daysLeft(expiryDate: string, today = new Date()): number {
  return differenceInCalendarDays(parseISO(expiryDate), today)
}

export function getExpiryStatus(days: number): ExpiryStatus {
  if (days < 0) return 'EXPIRED'
  if (days === 0) return 'EXPIRES_TODAY'
  if (days <= 7) return 'EXPIRING_SOON'
  if (days <= 30) return 'MONITOR'
  return 'SAFE'
}

export const statusMeta: Record<ExpiryStatus, { label: string; icon: string; cls: string }> = {
  SAFE:          { label: 'Safe',          icon: 'CheckCircle2',  cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' },
  MONITOR:       { label: 'Monitor',       icon: 'Eye',           cls: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300' },
  EXPIRING_SOON: { label: 'Expiring soon', icon: 'AlertTriangle', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300' },
  EXPIRES_TODAY: { label: 'Expires today', icon: 'Clock',         cls: 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300' },
  EXPIRED:       { label: 'Expired',       icon: 'XCircle',       cls: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300' },
}