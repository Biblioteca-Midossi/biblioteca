import type { UpdateUserData } from '@local/api'
import { usersApi } from '@local/hooks/api'
import { userKeys } from '@local/hooks/queryKeys'
import { notifications } from '@mantine/notifications'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

/** Current user's profile. */
export function useProfile() {
  return useQuery({
    queryKey: userKeys.profile,
    queryFn: async () => {
      const response = await usersApi.getProfile()
      return response.data
    },
    retry: false,
  })
}

/** Paginated user list (admin). */
export function useUsers(offset: number, limit: number) {
  return useQuery({
    queryKey: userKeys.list(offset, limit),
    queryFn: async () => {
      const response = await usersApi.getUsers(offset, limit)
      return {
        users: response.data.users,
        total: response.data.total,
      }
    },
  })
}

/** Most recently registered users (dashboard widget). */
export function useRecentUsers(limit: number) {
  return useQuery({
    queryKey: userKeys.recent(limit),
    queryFn: async () => {
      const response = await usersApi.getRecentUsers(limit)
      return response.data.users
    },
  })
}

function notifyError(fallback: string, error: unknown) {
  notifications.show({
    title: 'Errore',
    message: error instanceof Error ? error.message : fallback,
    color: 'red',
  })
}

/** Update another user (admin); refreshes user lists. */
export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { userId: number; userData: UpdateUserData }) => {
      const response = await usersApi.updateUser(input.userId, {
        user_data: input.userData,
      })
      if (response.status !== 200) {
        throw new Error("Errore sconosciuto durante l'aggiornamento")
      }
      return response.data
    },
    onSuccess: async () => {
      notifications.show({
        title: 'Successo',
        message: 'Utente aggiornato correttamente',
        color: 'green',
      })
      await queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
    onError: (error) => notifyError("Errore imprevisto durante l'aggiornamento", error),
  })
}

/** Delete a user (admin); refreshes user lists. */
export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await usersApi.deleteUser(userId)
      if (response.status !== 200) {
        throw new Error("Errore sconosciuto durante l'eliminazione")
      }
      return response.data
    },
    onSuccess: async () => {
      notifications.show({
        title: 'Successo',
        message: 'Utente eliminato correttamente',
        color: 'green',
      })
      await queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
    onError: (error) => notifyError("Errore imprevisto durante l'eliminazione", error),
  })
}
