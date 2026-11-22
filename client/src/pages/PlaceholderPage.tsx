import { Card } from '@/components/ui/Card'

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <Card className="text-[var(--muted)]">This page is coming soon.</Card>
    </div>
  )
}
