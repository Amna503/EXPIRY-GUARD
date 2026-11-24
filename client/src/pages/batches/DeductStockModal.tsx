import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { deductSchema } from '@/schemas/inventorySchemas'
import type { DeductFormValues } from '@/schemas/inventorySchemas'
import type { Batch } from '@/types/inventory'

type Props = {
  batch: Batch | null
  onClose: () => void
  onConfirm: (quantity: number) => Promise<void>
}

export function DeductStockModal({ batch, onClose, onConfirm }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DeductFormValues>({
    resolver: zodResolver(deductSchema),
    defaultValues: { quantity: 1 },
  })

  useEffect(() => {
    if (batch) reset({ quantity: 1 })
  }, [batch, reset])

  const submit = async (values: DeductFormValues) => {
    if (!batch) return
    if (values.quantity > batch.availableQuantity) {
      setError('root', { message: `Only ${batch.availableQuantity} units are available in this batch.` })
      return
    }
    try {
      await onConfirm(values.quantity)
    } catch (err) {
      setError('root', { message: err instanceof Error ? err.message : 'Something went wrong' })
    }
  }

  return (
    <Modal
      open={batch !== null}
      onClose={isSubmitting ? () => {} : onClose}
      title="Deduct stock"
      description={
        batch
          ? `Reduce available stock for batch ${batch.batchNo}. The server re-validates availability.`
          : undefined
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="deduct-form" disabled={isSubmitting}>
            {isSubmitting ? 'Deducting…' : 'Deduct stock'}
          </Button>
        </>
      }
    >
      <form id="deduct-form" onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        {batch && (
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-[var(--muted)] dark:bg-white/5">
            Available stock:{' '}
            <strong className="text-[var(--text)]">
              {batch.availableQuantity.toLocaleString('en-US')} units
            </strong>
          </p>
        )}
        <Input
          label="Quantity to deduct"
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          error={errors.quantity?.message}
          {...register('quantity', { valueAsNumber: true })}
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
