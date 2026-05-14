import api from "@local/hooks/api"
import type { User } from "@local/types/User"

export async function fetchUserMe(): Promise<User> {
  try {
    const response = await api.get('/users/me')
    return response.data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}