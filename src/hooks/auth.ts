import { api } from '@local/hooks/api'
import { notifications } from '@mantine/notifications'

interface RegisterProps {
  nome: string,
  cognome: string,
  username: string,
  email: string,
  password: string,
  istituto: string | number,
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

  } catch (error: any) {
    const message =
      error?.response?.data?.detail ??
      'Errore imprevisto durante la registrazione'

    notifications.show({
      title: 'Errore di registrazione',
      message,
      color: 'red',
    })

    return 'register-error'
  }
}
