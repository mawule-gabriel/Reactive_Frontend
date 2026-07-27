import { apiRequest } from './client'
import { setSession } from './session'
import type { AuthResponse } from './types'

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  })
  setSession({ token: response.token, email: response.email, role: response.role })
  return response
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: { email, password },
    auth: false,
  })
  setSession({ token: response.token, email: response.email, role: response.role })
  return response
}

export async function logout(): Promise<void> {
  try {
    await apiRequest<void>('/api/auth/logout', { method: 'POST' })
  } catch {
    // Best-effort server-side revocation; the local session is always cleared below.
  } finally {
    setSession(null)
  }
}
