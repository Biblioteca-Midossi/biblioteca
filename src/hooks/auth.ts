import type { RegisterRequest } from '@local/api'
import { authApi } from '@local/hooks/api'
import { notifications } from '@mantine/notifications'
import axios from 'axios'

export async function register(newUser: RegisterRequest): Promise<string> {
  try {
    const response = await authApi.register(newUser)

    if (response.status === 201) {
      notifications.show({
        title: 'Registrazione completata',
        message: `${response.data.message}, verrai reindirizzato al login.`,
        color: 'green',
      })
      return 'successful-request'
    }

    notifications.show({
      title: 'Errore di registrazione',
      message: detailOf(response.data) ?? 'Errore di registrazione',
      color: 'red',
    })

    return 'register-error'
  } catch (error) {
    const message = axios.isAxiosError(error) ? detailOf(error.response?.data) : undefined
    notifications.show({
      title: 'Errore di registrazione',
      message: message ?? 'Errore imprevisto durante la registrazione',
      color: 'red',
    })

    return 'register-error'
  }
}

function detailOf(data: unknown): string | undefined {
  if (typeof data === 'object' && data !== null && 'detail' in data) {
    const { detail } = data as { detail?: unknown }
    if (typeof detail === 'string') return detail
  }
  return undefined
}
