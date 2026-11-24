import { useEffect, useState } from 'react'
import { QrCode } from 'lucide-react'
import QRCode from 'qrcode'

type Props = {
  value: string
  size?: number
  caption?: string
}

type QrState = { value: string; url: string | null; failed: boolean }

/** Renders a QR code for an ExpiryGuard payload (product or batch). */
export function QrCodeImage({ value, size = 144, caption }: Props) {
  const [state, setState] = useState<QrState>({ value, url: null, failed: false })

  useEffect(() => {
    let active = true
    QRCode.toDataURL(value, { width: size * 2, margin: 1 })
      .then(dataUrl => {
        if (active) setState({ value, url: dataUrl, failed: false })
      })
      .catch(() => {
        if (active) setState({ value, url: null, failed: true })
      })
    return () => {
      active = false
    }
  }, [value, size])

  const loading = state.value !== value
  const url = loading ? null : state.url
  const failed = !loading && state.failed

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex items-center justify-center rounded-xl border border-[var(--border)] bg-white p-2"
        style={{ width: size + 16, height: size + 16 }}
      >
        {failed ? (
          <QrCode size={size * 0.6} className="text-slate-400" aria-hidden />
        ) : url ? (
          <img src={url} width={size} height={size} alt={`QR code for ${value}`} />
        ) : (
          <div
            aria-hidden
            className="animate-pulse rounded-lg bg-slate-200 dark:bg-white/10"
            style={{ width: size, height: size }}
          />
        )}
      </div>
      <p className="max-w-full truncate font-mono text-xs text-[var(--muted)]" title={value}>
        {caption ?? value}
      </p>
    </div>
  )
}
