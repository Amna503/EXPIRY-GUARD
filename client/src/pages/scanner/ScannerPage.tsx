import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { BrowserMultiFormatReader } from '@zxing/browser'
import type { IScannerControls } from '@zxing/browser'
import {
  AlertTriangle,
  Camera,
  CameraOff,
  Clock,
  Keyboard,
  PackageSearch,
  QrCode,
  ScanLine,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { StockStatusBadge } from '@/components/inventory/StockStatusBadge'
import { BatchStatusBadge } from '@/components/inventory/BatchStatusBadge'
import { ProductDetailsModal } from '@/pages/products/ProductDetailsModal'
import { BatchDetailsModal } from '@/pages/batches/BatchDetailsModal'
import { useBatches, useProducts } from '@/hooks/useInventory'
import { inventoryApi } from '@/services/inventoryApi'
import type { Batch, Product } from '@/types/inventory'
import { decodeQrPayload } from '@/utils/qrPayload'
import { recommendFefo } from '@/utils/fefo'
import {
  daysLeft,
  daysText,
  earliestExpiry,
  formatDate,
  getBatchStatus,
  getProductStockStatus,
  totalAvailableQuantity,
} from '@/utils/inventory'

type ScanResult =
  | { kind: 'product'; product: Product }
  | { kind: 'batch'; batch: Batch; product: Product | null }
  | { kind: 'not_found'; code: string }
  | { kind: 'invalid'; text: string }

type HistoryItem = {
  key: number
  kind: 'product' | 'batch' | 'not found'
  label: string
  detail: string
}

export default function ScannerPage() {
  const productsQuery = useProducts()
  const batchesQuery = useBatches()
  const products = productsQuery.data
  const batches = batchesQuery.data

  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const lockRef = useRef(false)
  const historySeq = useRef(0)

  const [scanning, setScanning] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [resolving, setResolving] = useState(false)
  const [code, setCode] = useState('')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null)
  const [detailsBatch, setDetailsBatch] = useState<Batch | null>(null)

  const pushHistory = (kind: HistoryItem['kind'], label: string, detail: string) => {
    historySeq.current += 1
    const item: HistoryItem = { key: historySeq.current, kind, label, detail }
    setHistory(prev => [item, ...prev].slice(0, 6))
  }

  const handleText = async (raw: string) => {
    const text = raw.trim()
    if (!text || resolving) return
    setResolving(true)
    try {
      const target = decodeQrPayload(text)
      if (target?.type === 'product') {
        const product = await inventoryApi.fetchProduct(target.id)
        setResult({ kind: 'product', product })
        pushHistory('product', product.name, product.sku)
      } else if (target?.type === 'batch') {
        const batch = await inventoryApi.fetchBatch(target.id)
        const product = products?.find(p => p.id === batch.productId) ?? null
        setResult({ kind: 'batch', batch, product })
        pushHistory('batch', batch.batchNo, product?.name ?? 'Unknown product')
      } else if (/^https?:\/\//i.test(text)) {
        setResult({ kind: 'invalid', text })
      } else {
        const product = await inventoryApi.lookupProductByBarcode(text)
        if (product) {
          setResult({ kind: 'product', product })
          pushHistory('product', product.name, product.sku)
        } else {
          setResult({ kind: 'not_found', code: text })
          pushHistory('not found', text, 'No product matches this code')
        }
      }
    } catch {
      setResult({ kind: 'not_found', code: text })
      pushHistory('not found', text, 'Lookup failed')
    } finally {
      setResolving(false)
      setScanning(false)
    }
  }

  const handleTextRef = useRef(handleText)
  useEffect(() => {
    handleTextRef.current = handleText
  })

  useEffect(() => {
    if (!scanning) return
    let cancelled = false
    const reader = new BrowserMultiFormatReader()

    reader
      .decodeFromVideoDevice(undefined, videoRef.current ?? undefined, found => {
        if (cancelled || lockRef.current || !found) return
        lockRef.current = true
        const text = found.getText()
        controlsRef.current?.stop()
        setScanning(false)
        void handleTextRef.current(text)
      })
      .then(controls => {
        if (cancelled) controls.stop()
        else controlsRef.current = controls
      })
      .catch(() => {
        if (!cancelled) {
          setCameraError('Camera unavailable. Check permissions, or use manual entry below.')
          setScanning(false)
        }
      })

    return () => {
      cancelled = true
      controlsRef.current?.stop()
      controlsRef.current = null
      lockRef.current = false
    }
  }, [scanning])

  useEffect(() => {
    return () => {
      controlsRef.current?.stop()
    }
  }, [])

  const submitManual = async (event: FormEvent) => {
    event.preventDefault()
    await handleText(code)
    setCode('')
  }

  const productResult = result?.kind === 'product' ? result.product : null
  const batchResult = result?.kind === 'batch' ? result : null
  const batchProduct = batchResult?.product ?? null
  const productBatches = productResult && batches
    ? recommendFefo(batches, productResult.id)
    : null

  const loading = productsQuery.isLoading || batchesQuery.isLoading
  const failed = productsQuery.isError || batchesQuery.isError

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading scanner">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (failed) {
    return (
      <div role="alert" className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-500/30 dark:bg-red-500/10">
        <AlertTriangle className="mx-auto mb-3 text-red-600" size={32} aria-hidden />
        <h2 className="text-lg font-semibold">Could not load inventory</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">The scanner needs product and batch data to resolve codes.</p>
        <Button className="mt-4" onClick={() => { void productsQuery.refetch(); void batchesQuery.refetch() }}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Barcode &amp; QR Scanner</h1>
        <p className="text-sm text-[var(--muted)]">
          Scan a product barcode or an ExpiryGuard QR code to look up live stock and expiry data.
          Standard barcodes identify the product; expiry information comes from its recorded batches.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-semibold">
              <Camera size={18} aria-hidden /> Camera scanner
            </h2>
            <Button
              size="sm"
              variant={scanning ? 'secondary' : 'primary'}
              onClick={() => {
                if (scanning) {
                  setScanning(false)
                } else {
                  setCameraError(null)
                  setScanning(true)
                }
              }}
            >
              {scanning ? (
                <>
                  <CameraOff size={15} aria-hidden /> Stop
                </>
              ) : (
                <>
                  <ScanLine size={15} aria-hidden /> Start camera
                </>
              )}
            </Button>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-slate-900">
            {scanning ? (
              <video
                ref={videoRef}
                muted
                playsInline
                className="aspect-video w-full object-cover"
                aria-label="Camera preview for scanning codes"
              />
            ) : (
              <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 text-slate-400">
                <ScanLine size={36} aria-hidden />
                <p className="text-sm">Camera is off</p>
              </div>
            )}
            {scanning && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-40 w-40 rounded-2xl border-2 border-emerald-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
              </div>
            )}
          </div>

          {cameraError && (
            <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
              {cameraError}
            </p>
          )}

          <form onSubmit={submitManual} className="space-y-3 border-t border-[var(--border)] pt-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Keyboard size={15} aria-hidden /> Manual entry
            </h3>
            <Input
              label="Barcode or QR payload"
              name="code"
              placeholder="8964000101011 or EG1:product:p1"
              value={code}
              onChange={event => setCode(event.target.value)}
              autoComplete="off"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" size="sm" disabled={resolving || !code.trim()}>
                <Search size={15} aria-hidden /> Look up
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setCode('8964000101011')}
                disabled={resolving}
              >
                Sample barcode
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setCode('EG1:batch:b1')}
                disabled={resolving}
              >
                <QrCode size={15} aria-hidden /> Sample QR
              </Button>
            </div>
          </form>
        </Card>

        <Card aria-live="polite" className="space-y-4">
          <h2 className="flex items-center gap-2 font-semibold">
            <PackageSearch size={18} aria-hidden /> Scan result
          </h2>

          {resolving && (
            <div className="space-y-3" aria-busy="true">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          )}

          {!resolving && !result && (
            <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] text-center">
              <QrCode size={32} className="text-slate-400" aria-hidden />
              <p className="text-sm font-medium">Nothing scanned yet</p>
              <p className="max-w-xs text-sm text-[var(--muted)]">
                Start the camera or enter a code manually to look up a product or batch.
              </p>
            </div>
          )}

          {!resolving && result?.kind === 'not_found' && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
              <p className="flex items-center gap-2 text-sm font-semibold text-red-800 dark:text-red-200">
                <AlertTriangle size={16} aria-hidden /> Code not found
              </p>
              <p className="mt-1 font-mono text-sm text-red-700 dark:text-red-200">{result.code}</p>
              <p className="mt-1 text-sm text-red-700 dark:text-red-200">
                No product matches this barcode. Check the code or add the product first.
              </p>
            </div>
          )}

          {!resolving && result?.kind === 'invalid' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-100">
                <QrCode size={16} aria-hidden /> Not an ExpiryGuard QR code
              </p>
              <p className="mt-1 break-all font-mono text-sm text-amber-800 dark:text-amber-100">{result.text}</p>
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-100">
                ExpiryGuard QR codes start with “EG1:” and point to a product or batch.
              </p>
            </div>
          )}

          {!resolving && productResult && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{productResult.name}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {productResult.sku} · {productResult.category}
                    {productResult.manufacturer ? ` · ${productResult.manufacturer}` : ''}
                  </p>
                </div>
                <StockStatusBadge
                  status={getProductStockStatus(
                    totalAvailableQuantity(batches ?? [], productResult.id),
                    productResult.minStock,
                  )}
                />
              </div>

              <dl className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm dark:bg-white/5">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Barcode</dt>
                  <dd className="mt-0.5 font-mono">{productResult.barcode || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Available</dt>
                  <dd className="mt-0.5">
                    {totalAvailableQuantity(batches ?? [], productResult.id).toLocaleString('en-US')}{' '}
                    {productResult.unit}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Earliest expiry
                  </dt>
                  <dd className="mt-0.5">{formatDate(earliestExpiry(batches ?? [], productResult.id))}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Min stock</dt>
                  <dd className="mt-0.5">{productResult.minStock} {productResult.unit}</dd>
                </div>
              </dl>

              <div>
                <h3 className="mb-2 text-sm font-semibold">FEFO pick list (first expiry first)</h3>
                {productBatches && productBatches.eligible.length > 0 ? (
                  <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
                    {productBatches.eligible.slice(0, 3).map((batch, index) => (
                      <li key={batch.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                        <div>
                          <p className="font-semibold">
                            {batch.batchNo}
                            {index === 0 && (
                              <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                                Pick first
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-[var(--muted)]">
                            {formatDate(batch.expiryDate)} · {daysText(daysLeft(batch.expiryDate))}
                          </p>
                        </div>
                        <span className="text-[var(--muted)]">
                          {batch.availableQuantity.toLocaleString('en-US')} {productResult.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : !batches ? (
                  <Skeleton className="h-24 rounded-xl" />
                ) : (
                  <p className="rounded-xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
                    No sellable batches. Record stock for this product to see expiry-based picks.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="sm" onClick={() => setDetailsProduct(productResult)}>
                  View full details
                </Button>
                <Link to="/batches">
                  <Button size="sm" variant="secondary">Open batches</Button>
                </Link>
              </div>
            </div>
          )}

          {!resolving && batchResult && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">Batch {batchResult.batch.batchNo}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {batchProduct ? `${batchProduct.name} · ${batchProduct.sku}` : 'Product removed from catalogue'}
                  </p>
                </div>
                <BatchStatusBadge status={getBatchStatus(batchResult.batch)} />
              </div>

              <dl className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm dark:bg-white/5">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Expiry date</dt>
                  <dd className="mt-0.5">{formatDate(batchResult.batch.expiryDate)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Days left</dt>
                  <dd className="mt-0.5">{daysText(daysLeft(batchResult.batch.expiryDate))}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Available</dt>
                  <dd className="mt-0.5">
                    {batchResult.batch.availableQuantity.toLocaleString('en-US')} /{' '}
                    {batchResult.batch.purchaseQuantity.toLocaleString('en-US')}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Supplier</dt>
                  <dd className="mt-0.5">{batchResult.batch.supplierName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Manufacturing
                  </dt>
                  <dd className="mt-0.5">{formatDate(batchResult.batch.manufacturingDate)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Received</dt>
                  <dd className="mt-0.5">{formatDate(batchResult.batch.receivedAt)}</dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-3">
                <Button size="sm" onClick={() => setDetailsBatch(batchResult.batch)}>
                  View full details
                </Button>
                <Link to="/batches">
                  <Button size="sm" variant="secondary">Open batches</Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>

      {history.length > 0 && (
        <Card className="p-0">
          <div className="p-5 pb-3">
            <h2 className="flex items-center gap-2 font-semibold">
              <Clock size={16} aria-hidden /> Recent scans
            </h2>
            <p className="text-sm text-[var(--muted)]">This session only. Nothing is stored on a server.</p>
          </div>
          <ul>
            {history.map(item => (
              <li
                key={item.key}
                className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-5 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{item.label}</p>
                  <p className="truncate text-[var(--muted)]">{item.detail}</p>
                </div>
                <span className="shrink-0 rounded-full border border-[var(--border)] px-2.5 py-0.5 text-xs font-semibold text-[var(--muted)]">
                  {item.kind}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ProductDetailsModal
        product={detailsProduct}
        batches={batches ?? []}
        onClose={() => setDetailsProduct(null)}
      />

      <BatchDetailsModal
        batch={detailsBatch}
        product={batchProduct}
        batches={batches ?? []}
        onClose={() => setDetailsBatch(null)}
      />
    </div>
  )
}
