import type { CreateBookPayload, UpdateBookPayload } from '@local/api'
import { booksApi } from '@local/hooks/api'
import { bookKeys } from '@local/hooks/queryKeys'
import { toBookListItem } from '@local/types/book'
import { notifications } from '@mantine/notifications'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

/** Paginated book list. `search` matches title/author/genre server-side. */
export function useBooks(page: number, limit: number, search: string | null) {
  return useQuery({
    queryKey: bookKeys.list(page, limit, search),
    queryFn: async () => {
      const response = await booksApi.getBooks(page, limit, search)
      return {
        books: response.data.books.map(toBookListItem),
        maxpage: response.data.maxpage,
      }
    },
  })
}

/** Single book detail. Returns undefined while loading or on 404. */
export function useBook(bookId: number | undefined) {
  return useQuery({
    queryKey: bookKeys.detail(bookId ?? 0),
    queryFn: async () => {
      const response = await booksApi.getBook(bookId ?? 0)
      return response.data.book
    },
    enabled: bookId !== undefined,
    retry: false,
  })
}

/** Most recently added books (dashboard widget). */
export function useRecentBooks(limit: number) {
  return useQuery({
    queryKey: bookKeys.recent(limit),
    queryFn: async () => {
      const response = await booksApi.getRecentBooks(limit)
      return response.data.books
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

/** Create a book. 201 on success (fresh creation or ISBN-dedupe inventory bump). */
export function useAddBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { book: CreateBookPayload; thumbnail?: File | null }) => {
      const response = await booksApi.createBook(
        JSON.stringify(input.book),
        input.thumbnail ?? undefined
      )
      if (response.status !== 201) {
        throw new Error('Errore sconosciuto durante la creazione del libro')
      }
      return response.data
    },
    onSuccess: async () => {
      notifications.show({
        title: 'Successo',
        message: 'Libro aggiunto correttamente',
        color: 'green',
      })
      await queryClient.invalidateQueries({ queryKey: bookKeys.all })
    },
    onError: (error) => notifyError('Impossibile connettersi al server', error),
  })
}

/** Update a book; invalidates list, detail and recent caches. */
export function useEditBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { bookId: number; book: UpdateBookPayload; file?: File | null }) => {
      const response = await booksApi.updateBook(
        input.bookId,
        JSON.stringify(input.book),
        input.file ?? undefined
      )
      if (response.status !== 200) {
        throw new Error('Errore sconosciuto durante la modifica del libro')
      }
      return response.data
    },
    onSuccess: async (_data, variables) => {
      notifications.show({
        title: 'Successo',
        message: 'Libro modificato correttamente',
        color: 'green',
      })
      await queryClient.invalidateQueries({ queryKey: bookKeys.all })
      await queryClient.invalidateQueries({ queryKey: bookKeys.detail(variables.bookId) })
    },
    onError: (error) => notifyError('Impossibile connettersi al server', error),
  })
}

/** Delete a book; refreshes every book cache. */
export function useDeleteBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (bookId: number) => {
      const response = await booksApi.deleteBook(bookId)
      if (response.status !== 200) {
        throw new Error('Impossibile eliminare il libro')
      }
      return response.data
    },
    onSuccess: async () => {
      notifications.show({
        title: 'Successo',
        message: 'Libro eliminato correttamente',
        color: 'green',
      })
      await queryClient.invalidateQueries({ queryKey: bookKeys.all })
    },
    onError: (error) => notifyError('Impossibile connettersi al server', error),
  })
}
