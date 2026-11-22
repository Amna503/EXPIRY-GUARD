import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export type DistributionPoint = { band: string; units: number; color: string }

export function ExpiryDistributionChart({ data }: { data: DistributionPoint[] }) {
  const summary = data.map(p => `${p.band}: ${p.units} units`).join(', ')
  return (
    <div className="h-64 w-full" role="img" aria-label={`Stock units by expiry band. ${summary}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="band" tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: 'rgba(100,116,139,0.12)' }}
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
          />
          <Bar dataKey="units" name="Units" radius={[6, 6, 0, 0]}>
            {data.map(p => <Cell key={p.band} fill={p.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
