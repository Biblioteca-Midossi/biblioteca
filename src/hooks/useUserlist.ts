import type { UpdateUserData, UserListItem } from '@local/api'
import { usersApi } from '@local/hooks/api'
import { notifications } from '@mantine/notifications'
import axios from 'axios'
import { useEffect, useState } from 'react'

export function useUserlist(page: number, rowsPerPage: number) {
  const [users, setUsers] = useState<Array<UserListItem>>([])
  const [loading, setLoading] = useState(true)
  const [totalUsers, setTotalUsers] = useState(0)

  async function fetchUsers() {
    try {
      setLoading(true)
      const response = await usersApi.getUsers(page * rowsPerPage, rowsPerPage)
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

export async function updateUser(
  userId: number,
  userData: UpdateUserData
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await usersApi.updateUser(userId, { user_data: userData })

    if (response.status === 200) {
      notifications.show({
        title: 'Successo',
        message: 'Utente aggiornato correttamente',
        color: 'green',
      })
      return { success: true }
    }

    return { success: false, error: 'Update failed' }
  } catch (error) {
    const detail = axios.isAxiosError(error)
      ? (error.response?.data as { detail?: string } | undefined)?.detail
      : undefined
    const message = detail ?? "Errore imprevisto durante l'aggiornamento"
    console.error('Error updating user:', error)
    notifications.show({
      title: 'Errore',
      message: `Richiesta fallita: ${message}`,
      color: 'red',
    })
    return { success: false, error: message }
  }
}
