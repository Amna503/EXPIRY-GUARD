import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '@/services/inventoryApi'
import type { BatchInput, ProductInput } from '@/types/inventory'

// TanStack Query hooks for the Inventory & Scanning module.
// Query keys are shared so every page stays in sync after a mutation.

export function useProducts() {
  return useQuery({ queryKey: ['products'], queryFn: () => inventoryApi.fetchProducts(), retry: 1 })
}

export function useBatches() {
  return useQuery({ queryKey: ['batches'], queryFn: () => inventoryApi.fetchBatches(), retry: 1 })
}

function useInvalidate(keys: string[][]) {
  const queryClient = useQueryClient()
  return () =>
    Promise.all(keys.map(key => queryClient.invalidateQueries({ queryKey: key }))).then(() => undefined)
}

export function useProductMutations() {
  const invalidate = useInvalidate([['products'], ['batches']])

  const create = useMutation({
    mutationFn: (input: ProductInput) => inventoryApi.createProduct(input),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProductInput }) => inventoryApi.updateProduct(id, input),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: string) => inventoryApi.deleteProduct(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}

export function useBatchMutations() {
  const invalidate = useInvalidate([['batches'], ['products']])

  const create = useMutation({
    mutationFn: (input: BatchInput) => inventoryApi.createBatch(input),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: BatchInput }) => inventoryApi.updateBatch(id, input),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: string) => inventoryApi.deleteBatch(id),
    onSuccess: invalidate,
  })
  const deduct = useMutation({
    mutationFn: ({ batchId, quantity }: { batchId: string; quantity: number }) =>
      inventoryApi.deductStock(batchId, quantity),
    onSuccess: invalidate,
  })

  return { create, update, remove, deduct }
}
