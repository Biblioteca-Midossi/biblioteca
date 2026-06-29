import { api } from "@local/hooks/api"
import { notifications } from "@mantine/notifications"
import type { User } from "@local/types/user"

export async function fetchUserMe(): Promise<User> {
  try {
    const response = await api.get('/users/me')
    return response.data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    notifications.show({
      title: 'Errore',
      message: 'Impossibile caricare il profilo utente',
      color: 'red',
    })
    throw error
  }
}
