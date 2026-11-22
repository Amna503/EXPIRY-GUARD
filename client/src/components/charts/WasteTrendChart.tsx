import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { WastePoint } from '@/data/mockInsights'

export function WasteTrendChart({ data }: { data: WastePoint[] }) {
  const summary = data.map(p => `${p.week}: recorded ${p.recorded}, estimated prevention ${p.prevented}`).join('; ')
  return (
    <div className="h-64 w-full" role="img" aria-label={`Waste trend in PKR. ${summary}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="week" tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="recorded" name="Recorded waste (actual)" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="prevented" name="Prevention (estimate)" stroke="#10b981" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
