import { LoadingScreen } from '@local/components/LoadingScreen'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '@local/hooks/authContext'
import type { ReactElement } from 'react'

interface ProtectedPageProps {
  /** User needs at least one of these permissions (OR). */
  permissions?: string[]
  /** Require authentication (any user). */
  requireAuth?: boolean
  children: ReactElement
}

export function ProtectedPage({
  permissions,
  requireAuth = true,
  children,
}: ProtectedPageProps) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    if (!user && requireAuth) {
      navigate({ to: '/login' })
      return
    }

    if (user && permissions && permissions.length > 0) {
      const hasAny = permissions.some(p => user.permissions.includes(p))
      if (!hasAny) {
        navigate({ to: '/' })
      }
    }
  }, [user, loading, permissions, requireAuth, navigate])

  if (loading) return <LoadingScreen />
  if (requireAuth && !user) return <LoadingScreen />
  return children
}
