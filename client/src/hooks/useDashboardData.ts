import { useQuery } from '@tanstack/react-query'
import { fetchBatches, fetchRecommendations, fetchWasteTrend } from '@/services/api'

export function useDashboardData() {
  const batches = useQuery({ queryKey: ['batches'], queryFn: fetchBatches, retry: 1 })
  const wasteTrend = useQuery({ queryKey: ['wasteTrend'], queryFn: fetchWasteTrend, retry: 1 })
  const recommendations = useQuery({ queryKey: ['recommendations'], queryFn: fetchRecommendations, retry: 1 })
  return { batches, wasteTrend, recommendations }
}
