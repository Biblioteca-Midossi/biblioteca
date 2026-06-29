import { useEffect, useState } from 'react'
import { api } from '@local/hooks/api'
import { notifications } from '@mantine/notifications'
import type { User } from '@local/types/user'

interface FetchUsersResponse {
  users: Array<User>
  total: number
}

export function useUserlist(page: number, rowsPerPage: number) {
  const [users, setUsers] = useState<Array<User>>([])
  const [loading, setLoading] = useState(true)
  const [totalUsers, setTotalUsers] = useState(0)

  async function fetchUsers() {
    try {
      setLoading(true)
      const response = await api.get<FetchUsersResponse>(
        `/users/get-users?offset=${page * rowsPerPage}&limit=${rowsPerPage}`
      )
      setUsers(response.data.users)
      setTotalUsers(response.data.total)
    } catch (error) {
      console.error('Error fetching users:', error)
      notifications.show({
        title: 'Errore',
        message: 'Impossibile caricare la lista utenti',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchUsers()
  }, [page, rowsPerPage])

  return { users, loading, totalUsers, refetch: fetchUsers }
}

interface UpdateUserResponse {
  message: string
}

export async function updateUser(
  userId: number,
  userData: User
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await api.put<UpdateUserResponse>(
      `/users/update-user/${userId}`,
      { user_data: userData }
    )

    if (response.status === 200) {
      notifications.show({
        title: 'Successo',
        message: 'Utente aggiornato correttamente',
        color: 'green',
      })
      return { success: true }
    }

    return { success: false, error: 'Update failed' }
  } catch (error: any) {
    const detail = error?.response?.data?.detail ?? 'Errore imprevisto durante l\'aggiornamento'
    console.error('Error updating user:', error)
    notifications.show({
      title: 'Errore',
      message: `Richiesta fallita: ${detail}`,
      color: 'red',
    })
    return { success: false, error: detail }
  }
}