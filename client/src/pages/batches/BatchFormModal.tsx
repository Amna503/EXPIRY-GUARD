import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { batchSchema } from '@/schemas/inventorySchemas'
import type { BatchFormValues } from '@/schemas/inventorySchemas'
import type { Batch, BatchInput, Product } from '@/types/inventory'

const today = () => format(new Date(), 'yyyy-MM-dd')

function defaultValues(batch?: Batch | null): BatchFormValues {
  return {
    productId: batch?.productId ?? '',
    batchNo: batch?.batchNo ?? '',
    manufacturingDate: batch?.manufacturingDate ?? '',
    expiryDate: batch?.expiryDate ?? '',
    purchaseDate: batch?.purchaseDate ?? (batch ? batch.receivedAt.slice(0, 10) : today()),
    purchaseQuantity: batch?.purchaseQuantity ?? 0,
    availableQuantity: batch?.availableQuantity ?? 0,
    supplierName: batch?.supplierName ?? '',
    supplierContact: batch?.supplierContact ?? '',
    purchasePrice: batch?.purchasePrice ?? 0,
    branch: batch?.branch ?? 'Main Branch',
  }
}

type Props = {
  open: boolean
  batch?: Batch | null
  products: Product[]
  onClose: () => void
  onSubmit: (input: BatchInput) => Promise<void>
}

export function BatchFormModal({ open, batch, products, onClose, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: defaultValues(batch),
  })

  useEffect(() => {
    if (open) reset(defaultValues(batch))
  }, [open, batch, reset])

  const purchaseQuantity = watch('purchaseQuantity')

  // While creating, available stock mirrors the purchase quantity until edited.
  useEffect(() => {
    if (!open || batch || dirtyFields.availableQuantity) return
    const next = Number.isFinite(purchaseQuantity) ? purchaseQuantity : 0
    setValue('availableQuantity', next)
  }, [open, batch, purchaseQuantity, dirtyFields.availableQuantity, setValue])

  const submit = async (values: BatchFormValues) => {
    try {
      await onSubmit(values)
    } catch (err) {
      setError('root', { message: err instanceof Error ? err.message : 'Something went wrong' })
    }
  }

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? () => {} : onClose}
      size="lg"
      title={batch ? 'Edit batch' : 'Add batch'}
      description={
        batch
          ? `Update batch ${batch.batchNo}.`
          : 'Record a new stock batch with its expiry and supplier details.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="batch-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : batch ? 'Save changes' : 'Add batch'}
          </Button>
        </>
      }
    >
      <form id="batch-form" onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Product"
            error={errors.productId?.message}
            options={[
              { value: '', label: 'Select a product' },
              ...products.map(product => ({
                value: product.id,
                label: `${product.name} (${product.sku})`,
              })),
            ]}
            {...register('productId')}
          />
          <Input
            label="Batch number"
            placeholder="B-1042"
            autoComplete="off"
            error={errors.batchNo?.message}
            {...register('batchNo')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Manufacturing date"
            type="date"
            error={errors.manufacturingDate?.message}
            {...register('manufacturingDate')}
          />
          <Input label="Expiry date" type="date" error={errors.expiryDate?.message} {...register('expiryDate')} />
          <Input label="Purchase date" type="date" error={errors.purchaseDate?.message} {...register('purchaseDate')} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Purchase quantity"
            type="number"
            min={0}
            step={1}
            error={errors.purchaseQuantity?.message}
            {...register('purchaseQuantity', { valueAsNumber: true })}
          />
          <Input
            label="Available stock"
            type="number"
            min={0}
            step={1}
            error={errors.availableQuantity?.message}
            {...register('availableQuantity', { valueAsNumber: true })}
          />
          <Input
            label="Purchase price (per unit)"
            type="number"
            min={0}
            step="0.01"
            error={errors.purchasePrice?.message}
            {...register('purchasePrice', { valueAsNumber: true })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Supplier"
            placeholder="DairyFresh Ltd"
            autoComplete="off"
            error={errors.supplierName?.message}
            {...register('supplierName')}
          />
          <Input
            label="Supplier contact"
            placeholder="sales@dairyfresh.example"
            autoComplete="off"
            error={errors.supplierContact?.message}
            {...register('supplierContact')}
          />
        </div>

        <Input
          label="Branch"
          placeholder="Main Branch"
          autoComplete="off"
          error={errors.branch?.message}
          {...register('branch')}
        />

        {errors.root?.message && (
          <p role="alert" className="text-sm text-red-600">
            {errors.root.message}
          </p>
        )}
      </form>
    </Modal>
  )
}
