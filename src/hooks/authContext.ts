import { useRouterState } from '@tanstack/react-router'
import type { User } from "@local/types/user"

export interface AuthState {
  user: User | null
  loading: boolean
}

export const defaultAuthState: AuthState = {
  user: null,
  loading: true,
}

export function useAuth(): AuthState {
  return useRouterState({
    select: (s) => {
      const ctx = s.matches[0]?.context as { auth?: AuthState } | undefined
      return ctx?.auth ?? defaultAuthState
    }
  })
}

export function isAdmin(user: User | null) {
  return (user?.ruolo ?? 0) >= 3
}

export function isBibliotecario(user: User | null) {
  return (user?.ruolo ?? 0) >= 2
}

export function isLoggedIn(user: User | null) {
  return user !== null
}
