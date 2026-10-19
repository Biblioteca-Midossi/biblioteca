import { api } from '@local/hooks/api'
import { notifications } from '@mantine/notifications'
import axios from 'axios'

interface RegisterProps {
  nome: string
  cognome: string
  username: string
  email: string
  password: string
  istituto: string | number
}

export async function register(newUser: RegisterProps): Promise<string> {
  try {
    const response = await api.post('/auth/register', newUser)

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
      message: response.data.detail,
      color: 'red',
    })

    return 'register-error'
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? (error.response?.data as { detail?: string } | undefined)?.detail
      : undefined
    notifications.show({
      title: 'Errore di registrazione',
      message: message ?? 'Errore imprevisto durante la registrazione',
      color: 'red',
    })

    return 'register-error'
  }
}
