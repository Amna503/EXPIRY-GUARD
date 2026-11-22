import { Link } from 'react-router-dom'
import { PackageOpen } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { useDashboardData } from '@/hooks/useDashboardData'
import DashboardContent from './DashboardContent'

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  )
}

export default function DashboardPage() {
  const { batches, wasteTrend, recommendations } = useDashboardData()
  const queries = [batches, wasteTrend, recommendations]

  if (queries.some(q => q.isError)) {
    return <ErrorState onRetry={() => queries.forEach(q => q.refetch())} />
  }
  if (!batches.data || !wasteTrend.data || !recommendations.data) {
    return <DashboardSkeleton />
  }
  if (batches.data.length === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title="No batches yet"
        message="Receive your first stock to see expiry status, alerts and forecasts here."
        action={<Link to="/receive"><Button>Receive stock</Button></Link>}
      />
    )
  }
  return (
    <DashboardContent
      batches={batches.data}
      wasteTrend={wasteTrend.data}
      recommendations={recommendations.data}
    />
  )
}
