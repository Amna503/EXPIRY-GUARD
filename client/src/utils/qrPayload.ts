export const QR_PAYLOAD_PREFIX = 'EG1'

export type QrTarget =
  | { type: 'product'; id: string }
  | { type: 'batch'; id: string }

const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

export function encodeQrPayload(target: QrTarget): string {
  return `${QR_PAYLOAD_PREFIX}:${target.type}:${target.id}`
}

/**
 * Returns null for anything that is not an ExpiryGuard QR payload so the UI
 * can show a clear "invalid QR code" state instead of navigating blindly.
 */
export function decodeQrPayload(text: string): QrTarget | null {
  const parts = text.trim().split(':')
  if (parts.length !== 3) return null
  const [prefix, type, id] = parts
  if (prefix !== QR_PAYLOAD_PREFIX) return null
  if (type !== 'product' && type !== 'batch') return null
  if (!ID_PATTERN.test(id)) return null
  return { type, id }
}
