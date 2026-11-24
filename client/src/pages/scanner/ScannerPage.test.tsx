import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { ToastProvider } from '@/components/ui/ToastProvider'
import ScannerPage from './ScannerPage'

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ToastProvider>
          <ScannerPage />
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ScannerPage', () => {
  it('renders the scanner with camera and manual entry', async () => {
    renderPage()

    expect(await screen.findByText('Nothing scanned yet', {}, { timeout: 4000 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start camera/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Barcode or QR payload')).toBeInTheDocument()
  })

  it('looks up a product from a manually entered barcode', async () => {
    renderPage()
    await screen.findByText('Nothing scanned yet', {}, { timeout: 4000 })

    fireEvent.change(screen.getByLabelText('Barcode or QR payload'), {
      target: { value: '8964000101011' },
    })
    fireEvent.click(screen.getByRole('button', { name: /look up/i }))

    expect((await screen.findAllByText('Fresh Milk 1L', {}, { timeout: 4000 })).length).toBeGreaterThan(0)
    expect(screen.getByText('FEFO pick list (first expiry first)')).toBeInTheDocument()
    expect(screen.getByText('Pick first')).toBeInTheDocument()
  })

  it('resolves an ExpiryGuard QR payload to a batch', async () => {
    renderPage()
    await screen.findByText('Nothing scanned yet', {}, { timeout: 4000 })

    fireEvent.change(screen.getByLabelText('Barcode or QR payload'), {
      target: { value: 'EG1:batch:b1' },
    })
    fireEvent.click(screen.getByRole('button', { name: /look up/i }))

    expect(await screen.findByText('Batch B-1042', {}, { timeout: 4000 })).toBeInTheDocument()
    expect(screen.getByText(/Fresh Milk 1L · DAI-MILK-1L/)).toBeInTheDocument()
  })

  it('reports unknown barcodes clearly', async () => {
    renderPage()
    await screen.findByText('Nothing scanned yet', {}, { timeout: 4000 })

    fireEvent.change(screen.getByLabelText('Barcode or QR payload'), {
      target: { value: '0000000000000' },
    })
    fireEvent.click(screen.getByRole('button', { name: /look up/i }))

    expect(await screen.findByText('Code not found', {}, { timeout: 4000 })).toBeInTheDocument()
    expect(screen.getAllByText('0000000000000').length).toBeGreaterThan(0)
  })
})
