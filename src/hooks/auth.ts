import api from '@local/hooks/api'
import type { User } from '@local/types/User'

interface RegisterProps {
  nome: string,
  cognome: string,
  username: string,
  email: string,
  password: string,
  istituto: string | number,
}

export async function checkAuthentication(): Promise<User | null> {
  try {
    // Try to check authentication
    const response = await api.get('/auth/check')
    return response.data as User
  } catch (error) {
    console.error('Authentication check failed:', error)
    return null
  }
}

export async function login(username: string, password: string) {
  try {
    await api.post('/auth/login', { username, password })
  } catch (error) {
    console.error('Login failed:', error)
    throw error
  }
}

export async function logout() {
  try {
    await api.get('auth/logout')
  } catch (error) {
    console.error('Logout failed', error)
  }
}

export async function register(newUser: RegisterProps): Promise<string> {
  try {
    return await api.post('/auth/register', newUser)
      .then((response) => {
        if (response.status === 201) {
          alert(`${response.data.message}, you will be redirected to login.`)
          return 'successful-request'
        }
        else {
          console.error(response.data.detail)
          alert(response.data.detail)
          return 'register-error'
        }
      })
      .catch((error) => {
        console.error(error)
        alert(error.response.data.detail)
        return 'register-error'
      })
  } catch (error: any) {
    console.error(error)
    alert(error.response.data.detail)
    return 'register-error'
  }
}