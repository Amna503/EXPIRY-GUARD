import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { ToastProvider } from '@/components/ui/ToastProvider'
import AnalyticsPage from './analytics/AnalyticsPage'
import BranchesPage from './branches/BranchesPage'
import ExpiryMonitorPage from './expiry/ExpiryMonitorPage'
import InsightsPage from './insights/InsightsPage'
import ReceivePage from './receive/ReceivePage'
import SettingsPage from './settings/SettingsPage'
import TeamPage from './team/TeamPage'

function renderPage(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ToastProvider>{ui}</ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

const cases: { name: string; heading: string; ui: ReactElement }[] = [
  { name: 'ReceivePage', heading: 'Receive Stock', ui: <ReceivePage /> },
  { name: 'ExpiryMonitorPage', heading: 'Expiry Monitor', ui: <ExpiryMonitorPage /> },
  { name: 'InsightsPage', heading: 'AI Insights', ui: <InsightsPage /> },
  { name: 'AnalyticsPage', heading: 'Analytics', ui: <AnalyticsPage /> },
  { name: 'BranchesPage', heading: 'Branches', ui: <BranchesPage /> },
  { name: 'TeamPage', heading: 'Team & Roles', ui: <TeamPage /> },
  { name: 'SettingsPage', heading: 'Settings', ui: <SettingsPage /> },
]

describe('module pages', () => {
  it.each(cases)('$name renders its heading and content', async ({ heading, ui }) => {
    renderPage(ui)

    expect(
      await screen.findByRole('heading', { name: heading, level: 1 }, { timeout: 4000 }),
    ).toBeInTheDocument()
  })

  it('ReceivePage shows the delivery form and KPIs', async () => {
    renderPage(<ReceivePage />)

    expect(await screen.findByText('New delivery', {}, { timeout: 4000 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Receive stock' })).toBeInTheDocument()
    expect(screen.getByText('Received today')).toBeInTheDocument()
    expect(screen.getByText('Recent receipts')).toBeInTheDocument()
  })

  it('ExpiryMonitorPage lists batches with days left', async () => {
    renderPage(<ExpiryMonitorPage />)

    expect(await screen.findByText('Action guide', {}, { timeout: 4000 })).toBeInTheDocument()
    expect(screen.getByText('Units by expiry window')).toBeInTheDocument()
    expect(screen.getByText('Value at risk')).toBeInTheDocument()
  })

  it('TeamPage lists members and role cards', async () => {
    renderPage(<TeamPage />)

    expect(await screen.findByText('Roles & permissions', {}, { timeout: 4000 })).toBeInTheDocument()
    expect(screen.getByText('Ayesha Khan')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Invite member/ })).toBeInTheDocument()
  })

  it('BranchesPage shows branch stats and seeded locations', async () => {
    renderPage(<BranchesPage />)

    expect(await screen.findByText('Main Branch', {}, { timeout: 4000 })).toBeInTheDocument()
    expect(screen.getByText('North Outlet')).toBeInTheDocument()
    expect(screen.getByText('Stock value')).toBeInTheDocument()
  })

  it('SettingsPage shows every settings section', async () => {
    renderPage(<SettingsPage />)

    expect(await screen.findByText('Store profile', {}, { timeout: 4000 })).toBeInTheDocument()
    expect(screen.getByText('Expiry rules')).toBeInTheDocument()
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('Appearance')).toBeInTheDocument()
    expect(screen.getByText('Reset')).toBeInTheDocument()
  })
})
