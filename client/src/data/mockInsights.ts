export type WastePoint = { week: string; recorded: number; prevented: number }

// Demo data. "recorded" is actual waste; "prevented" is an estimate.
export const wasteTrend: WastePoint[] = [
  { week: 'Wk 1', recorded: 8200, prevented: 0 },
  { week: 'Wk 2', recorded: 7400, prevented: 1500 },
  { week: 'Wk 3', recorded: 9100, prevented: 2200 },
  { week: 'Wk 4', recorded: 6200, prevented: 3100 },
  { week: 'Wk 5', recorded: 5300, prevented: 3800 },
  { week: 'Wk 6', recorded: 4100, prevented: 4600 },
]

export type Recommendation = {
  id: string
  batchId: string
  forecastDemand: number
  surplus: number
  reliability: 'High' | 'Medium' | 'Low'
  method: string
  action: string
  explanation: string
}

export const recommendations: Recommendation[] = [
  {
    id: 'r1',
    batchId: '5',
    forecastDemand: 14,
    surplus: 10,
    reliability: 'Medium',
    method: '14-day moving average',
    action: 'Review a 20% discount',
    explanation: 'About 7 units sell per day, and only 2 days remain, so roughly 14 of 24 units are expected to sell.',
  },
  {
    id: 'r2',
    batchId: '7',
    forecastDemand: 31,
    surplus: 19,
    reliability: 'Medium',
    method: '14-day moving average',
    action: 'Consider moving 15 units to a faster-selling branch',
    explanation: 'About 5 units sell per day over the 6 days left, so about 31 of 50 units are expected to sell.',
  },
  {
    id: 'r3',
    batchId: '8',
    forecastDemand: 72,
    surplus: 18,
    reliability: 'Low',
    method: 'Baseline (limited history)',
    action: 'Monitor and review again in 3 days',
    explanation: 'Only 9 days of sales history exist, so treat this as a rough baseline, not a firm forecast.',
  },
]
