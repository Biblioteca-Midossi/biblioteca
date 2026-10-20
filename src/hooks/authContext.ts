import type { UserProfileOut } from '@local/api'
import { useRouterState } from '@tanstack/react-router'

export interface AuthState {
  user: UserProfileOut | null
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
    },
  })
}

/** Check if user has a specific named permission. */
export function hasPermission(user: UserProfileOut | null, permission: string): boolean {
  return user?.permissions?.includes(permission) ?? false
}
