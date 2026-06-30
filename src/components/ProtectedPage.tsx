import { LoadingScreen } from '@local/components/LoadingScreen'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '@local/hooks/authContext'
import type { ReactElement } from 'react'

interface ProtectedPageProps {
  levelOfProtection: number
  children: ReactElement
}

export function ProtectedPage({ levelOfProtection, children }: ProtectedPageProps) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    if (!user) {
      navigate({ to: '/login' })
      return
    }

    if (user.ruolo < levelOfProtection) {
      navigate({ to: '/' })
      return
    }
  }, [user, loading, levelOfProtection, navigate])

  if (loading) return <LoadingScreen />

  if (!user || user.ruolo < levelOfProtection) {
    return <LoadingScreen />
  }

  return children
}
