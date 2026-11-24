import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { productSchema } from '@/schemas/inventorySchemas'
import type { ProductFormValues } from '@/schemas/inventorySchemas'
import type { Product, ProductInput } from '@/types/inventory'

const UNITS = ['pcs', 'kg', 'g', 'l', 'ml', 'pack', 'box', 'dozen']

function defaultValues(product?: Product | null): ProductFormValues {
  return {
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    barcode: product?.barcode ?? '',
    category: product?.category ?? '',
    manufacturer: product?.manufacturer ?? '',
    description: product?.description ?? '',
    unit: product?.unit ?? 'pcs',
    minStock: product?.minStock ?? 0,
    imageUrl: product?.imageUrl ?? '',
  }
}

type Props = {
  open: boolean
  product?: Product | null
  categories: string[]
  onClose: () => void
  onSubmit: (input: ProductInput) => Promise<void>
}

export function ProductFormModal({ open, product, categories, onClose, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues(product),
  })

  useEffect(() => {
    if (open) reset(defaultValues(product))
  }, [open, product, reset])

  const imageUrl = watch('imageUrl')

  const submit = async (values: ProductFormValues) => {
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
      title={product ? 'Edit product' : 'Add product'}
      description={
        product
          ? `Update ${product.name}. Changes apply to future batches too.`
          : 'Register a new product in the catalogue.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="product-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : product ? 'Save changes' : 'Add product'}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <Input
          label="Product name"
          placeholder="Fresh Milk 1L"
          autoComplete="off"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="SKU"
            placeholder="DAI-MILK-1L"
            autoComplete="off"
            error={errors.sku?.message}
            {...register('sku')}
          />
          <Input
            label="Barcode"
            placeholder="8964000101011"
            inputMode="numeric"
            autoComplete="off"
            error={errors.barcode?.message}
            {...register('barcode')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Input
              label="Category"
              list="product-categories"
              placeholder="Dairy"
              autoComplete="off"
              error={errors.category?.message}
              {...register('category')}
            />
            <datalist id="product-categories">
              {categories.map(category => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </div>
          <Input
            label="Manufacturer"
            placeholder="DairyFresh Ltd"
            autoComplete="off"
            error={errors.manufacturer?.message}
            {...register('manufacturer')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Input
              label="Unit"
              list="product-units"
              placeholder="pcs"
              autoComplete="off"
              error={errors.unit?.message}
              {...register('unit')}
            />
            <datalist id="product-units">
              {UNITS.map(unit => (
                <option key={unit} value={unit} />
              ))}
            </datalist>
          </div>
          <Input
            label="Minimum stock"
            type="number"
            min={0}
            step={1}
            error={errors.minStock?.message}
            {...register('minStock', { valueAsNumber: true })}
          />
        </div>

        <div>
          <Input
            label="Image URL"
            placeholder="https://example.com/product.jpg"
            autoComplete="off"
            error={errors.imageUrl?.message}
            {...register('imageUrl')}
          />
          {imageUrl && !errors.imageUrl && (
            <img
              src={imageUrl}
              alt=""
              className="mt-2 h-16 w-16 rounded-lg border border-[var(--border)] object-cover"
              onError={event => {
                event.currentTarget.style.display = 'none'
              }}
            />
          )}
        </div>

        <Textarea
          label="Description"
          rows={3}
          placeholder="Pasteurised full-cream milk, 1 litre carton."
          error={errors.description?.message}
          {...register('description')}
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
