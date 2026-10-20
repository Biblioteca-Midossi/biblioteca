import type { UserProfileOut } from '@local/api'
import { usersApi } from '@local/hooks/api'
import { notifications } from '@mantine/notifications'

export async function fetchUserMe(): Promise<UserProfileOut> {
  try {
    const response = await usersApi.getProfile()
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
