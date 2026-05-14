import { createContext, useContext, useEffect, useState } from 'react'

import { checkAuthentication, login, logout } from "@local/hooks/auth"
import Cookies from "js-cookie"
import type { User } from "@local/types/User"
import type { ReactNode } from 'react'

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
        console.log(document.cookie)
        const storedUser = Cookies.get('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        } else {
          const userData = await checkAuthentication()
          setUser(userData)
          Cookies.set("user", JSON.stringify(userData), { expires: 2 / 24 })
        }
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    void fetchUser()
  }, [])

  async function handleLogin(username: string, password: string) {
    try {
      await login(username, password)
      const userData = await checkAuthentication()
      setUser(userData)
      Cookies.set('user', JSON.stringify(userData), { expires: 2 / 24 })
    } catch (error) {
      setUser(null)
      console.error('Login failed:', error)
      throw error
    }
  }

  async function handleLogout() {
    await logout()
    setUser(null)
    Cookies.remove('user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login: handleLogin,
        logout: handleLogout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider')
  }
  return context
}