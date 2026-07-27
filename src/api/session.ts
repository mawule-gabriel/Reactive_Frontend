import type { Role } from './types'

export interface Session {
  token: string
  email: string
  role: Role
}

const STORAGE_KEY = 'reactive-hr-session'

let listeners: Array<() => void> = []
let session: Session | null = loadFromStorage()

function loadFromStorage(): Session | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function getSession(): Session | null {
  return session
}

export function setSession(next: Session | null): void {
  session = next
  if (next) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
  for (const listener of listeners) listener()
}

export function subscribe(listener: () => void): () => void {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((existing) => existing !== listener)
  }
}
