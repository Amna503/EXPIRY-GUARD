const BASE: string = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1'

export const USE_MOCK: boolean = import.meta.env.VITE_USE_MOCK !== 'false'

type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: { code: string; message: string } }

export class ApiError extends Error {
  code: string
  status: number
  constructor(code: string, message: string, status: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

// The business is resolved by the server from the logged-in session.
// Never send a business_id from the client (PDF section 4.4).
export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init.headers },
  })

  let body: ApiResponse<T>
  try {
    body = (await res.json()) as ApiResponse<T>
  } catch {
    throw new ApiError('BAD_RESPONSE', 'Unexpected server response', res.status)
  }

  if (!res.ok || !body.success) {
    const err = body.success ? undefined : body.error
    throw new ApiError(err?.code ?? 'UNKNOWN', err?.message ?? 'Request failed', res.status)
  }
  return body.data
}
