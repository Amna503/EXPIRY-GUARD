import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { ToastProvider } from '@/components/ui/ToastProvider'
import BatchesPage from './BatchesPage'

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ToastProvider>
          <BatchesPage />
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('BatchesPage', () => {
  it('renders seeded batches with status and expiry information', async () => {
    renderPage()

    expect(await screen.findByText('Showing 18 of 18 batches', {}, { timeout: 4000 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add batch' })).toBeInTheDocument()
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.getAllByText('Expired').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Expiring soon').length).toBeGreaterThan(0)
  })

  it('filters batches by search term', async () => {
    renderPage()
    await screen.findByText('Showing 18 of 18 batches', {}, { timeout: 4000 })

    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'B-1042' } })

    await screen.findByText('Showing 1 of 18 batches · filters applied')
    expect(within(screen.getByRole('table')).getByText('Fresh Milk 1L')).toBeInTheDocument()
  })

  it('opens the add-batch form with product and date fields', async () => {
    renderPage()
    await screen.findByText('Showing 18 of 18 batches', {}, { timeout: 4000 })

    fireEvent.click(screen.getByRole('button', { name: 'Add batch' }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByLabelText('Product')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Batch number')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Manufacturing date')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Expiry date')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Purchase date')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Supplier')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Branch')).toBeInTheDocument()
  })
})
