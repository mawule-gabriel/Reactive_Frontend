import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react'
import { getSession, subscribe, type Session } from '@/api/session'
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '@/api/auth'

interface AuthContextValue {
  session: Session | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(subscribe, getSession)

  const value: AuthContextValue = {
    session,
    isAuthenticated: session !== null,
    isAdmin: session?.role === 'ROLE_ADMIN',
    login: async (email, password) => {
      await apiLogin(email, password)
    },
    register: async (email, password) => {
      await apiRegister(email, password)
    },
    logout: async () => {
      await apiLogout()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
