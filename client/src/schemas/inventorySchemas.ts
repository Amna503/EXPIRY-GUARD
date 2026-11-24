import { z } from 'zod'
import { isValidIsoDate } from '@/utils/inventory'

const optionalUrl = z
  .string()
  .trim()
  .refine(v => v === '' || isHttpUrl(v), 'Enter a valid http(s) URL')

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required (at least 2 characters)'),
  sku: z
    .string()
    .trim()
    .min(1, 'SKU is required')
    .regex(/^[A-Za-z0-9_-]+$/, 'SKU may contain letters, numbers, hyphens and underscores'),
  barcode: z
    .string()
    .trim()
    .refine(v => v === '' || /^[0-9]{8,14}$/.test(v), 'Barcode must be empty or 8-14 digits (EAN-8 / UPC / EAN-13)'),
  category: z.string().trim().min(1, 'Category is required'),
  manufacturer: z.string().trim().max(120, 'Manufacturer must be 120 characters or fewer'),
  description: z.string().trim().max(500, 'Description must be 500 characters or fewer'),
  unit: z.string().trim().min(1, 'Unit of measurement is required'),
  minStock: z
    .number({ error: 'Minimum stock must be a number' })
    .min(0, 'Minimum stock must be 0 or more'),
  imageUrl: optionalUrl,
})

export type ProductFormValues = z.infer<typeof productSchema>

export const batchSchema = z
  .object({
    productId: z.string().min(1, 'Select a product'),
    batchNo: z.string().trim().min(1, 'Batch number is required').max(40, 'Batch number is too long'),
    manufacturingDate: z
      .string()
      .min(1, 'Manufacturing date is required')
      .refine(isValidIsoDate, 'Enter a valid manufacturing date'),
    expiryDate: z
      .string()
      .min(1, 'Expiry date is required')
      .refine(isValidIsoDate, 'Enter a valid expiry date'),
    purchaseDate: z
      .string()
      .min(1, 'Purchase date is required')
      .refine(isValidIsoDate, 'Enter a valid purchase date'),
    purchaseQuantity: z
      .number({ error: 'Quantity must be a number' })
      .min(0, 'Quantity must be 0 or more'),
    availableQuantity: z
      .number({ error: 'Quantity must be a number' })
      .min(0, 'Quantity must be 0 or more'),
    supplierName: z.string().trim().min(1, 'Supplier name is required'),
    supplierContact: z.string().trim().max(120, 'Supplier contact is too long'),
    purchasePrice: z
      .number({ error: 'Purchase price must be a number' })
      .min(0, 'Purchase price must be 0 or more'),
    branch: z.string().trim().min(1, 'Branch is required'),
  })
  .refine(d => new Date(d.manufacturingDate) <= new Date(d.expiryDate), {
    message: 'Manufacturing date cannot be after the expiry date',
    path: ['expiryDate'],
  })
  .refine(d => d.availableQuantity <= d.purchaseQuantity, {
    message: 'Available quantity cannot exceed purchase quantity',
    path: ['availableQuantity'],
  })

export type BatchFormValues = z.infer<typeof batchSchema>

export const deductSchema = z.object({
  quantity: z
    .number({ error: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .min(1, 'Pick at least 1 unit')
    .max(10000, 'Quantity is too large for a single pick'),
})

export type DeductFormValues = z.infer<typeof deductSchema>
