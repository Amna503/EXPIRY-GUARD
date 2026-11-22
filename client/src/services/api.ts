import { batches } from '@/data/mockData'
import type { Batch } from '@/data/mockData'
import { recommendations, wasteTrend } from '@/data/mockInsights'
import type { Recommendation, WastePoint } from '@/data/mockInsights'
import { http, USE_MOCK } from './http'

// With VITE_USE_MOCK=true (default) the app uses demo data. With VITE_USE_MOCK=false it calls the
// real backend. Demo switches in the address bar: ?fail=1 (error state), ?empty=1 (empty state).

const delay = (ms = 700) => new Promise(resolve => setTimeout(resolve, ms))
const flag = (name: string) => new URLSearchParams(window.location.search).has(name)

async function simulate<T>(data: T): Promise<T> {
  await delay()
  if (flag('fail')) throw new Error('Demo failure')
  return data
}

export const fetchBatches = (): Promise<Batch[]> =>
  USE_MOCK ? simulate(flag('empty') ? [] : batches) : http<Batch[]>('/batches')

export const fetchWasteTrend = (): Promise<WastePoint[]> =>
  USE_MOCK ? simulate(wasteTrend) : http<WastePoint[]>('/analytics/waste')

export const fetchRecommendations = (): Promise<Recommendation[]> =>
  USE_MOCK ? simulate(recommendations) : http<Recommendation[]>('/ai/recommendations')
