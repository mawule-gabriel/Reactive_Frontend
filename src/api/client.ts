import { getSession, setSession } from './session'
import type { ApiErrorShape } from './types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export class ApiError extends Error {
  status: number
  path: string

  constructor(shape: ApiErrorShape) {
    super(shape.message)
    this.status = shape.status
    this.path = shape.path
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  auth?: boolean
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options
  const headers: Record<string, string> = {}

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (auth) {
    const session = getSession()
    if (session) headers.Authorization = `Bearer ${session.token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  const data = text ? JSON.parse(text) : undefined

  if (!response.ok) {
    if (response.status === 401) {
      setSession(null)
    }
    throw new ApiError(data as ApiErrorShape)
  }

  return data as T
}
