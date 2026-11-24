import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { ToastProvider } from '@/components/ui/ToastProvider'
import ProductsPage from './ProductsPage'

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ToastProvider>
          <ProductsPage />
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ProductsPage', () => {
  it('renders seeded products with stock and actions', async () => {
    renderPage()

    expect(await screen.findByText('Fresh Milk 1L', {}, { timeout: 4000 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add product' })).toBeInTheDocument()
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.getByText('Showing 12 of 12 products')).toBeInTheDocument()
    expect(screen.getByText('Cheddar Cheese')).toBeInTheDocument()
  })

  it('filters the table as the search term changes', async () => {
    renderPage()
    await screen.findByText('Fresh Milk 1L', {}, { timeout: 4000 })

    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'chicken' } })

    await waitFor(() => {
      expect(screen.queryByText('Fresh Milk 1L')).not.toBeInTheDocument()
      expect(screen.getByText('Chicken Breast')).toBeInTheDocument()
      expect(screen.getByText('Showing 1 of 12 products · filters applied')).toBeInTheDocument()
    })
  })

  it('opens the add-product form', async () => {
    renderPage()
    await screen.findByText('Fresh Milk 1L', {}, { timeout: 4000 })

    fireEvent.click(screen.getByRole('button', { name: 'Add product' }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Add product' })).toBeInTheDocument()
    expect(screen.getByLabelText('Product name')).toBeInTheDocument()
    expect(screen.getByLabelText('Manufacturer')).toBeInTheDocument()
  })

  it('shows the empty state when the store has no products', async () => {
    window.history.pushState({}, '', '?empty=1')
    renderPage()

    expect(await screen.findByText('No products yet', {}, { timeout: 4000 })).toBeInTheDocument()
    window.history.pushState({}, '', '/')
  })
})
