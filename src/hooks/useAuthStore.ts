import { api } from '@local/hooks/api'
import { create } from 'zustand'
import type { User } from "@local/types/user"

interface AuthState {
  user: User | null
  loading: boolean
  fetchUser: () => Promise<void>
  login: (login: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  fetchUser: async () => {
    try {
      const { data } = await api.get('/users/me')
      console.debug(data)
      set({ user: data, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },

  login: async (login: string, password: string) => {
    await api.post('/auth/login', { login, password })

    const { data } = await api.get<User>('/users/me')
    set({ user: data, loading: false })
  },

  logout: async () => {
    await api.post('/auth/logout')
    set({ user: null })
  }
}))

export function isAdmin(user: User | null) {
  return (user?.ruolo ?? 0) >= 3
}

export function isBibliotecario(user: User | null) {
  return (user?.ruolo ?? 0) >= 2
}

export function isLoggedIn(user: User | null) {
  return user !== null
}