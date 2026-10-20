import type { BookResponse, CreateBookPayload, UpdateBookPayload } from '@local/api'
import { booksApi } from '@local/hooks/api'
import { notifications } from '@mantine/notifications'
import { create } from 'zustand'

/** Store-level book view: BookResponse with `autori` flattened to a display string and the File kept for edit flows. */
export interface BookListItem extends Omit<BookResponse, 'autori'> {
  autori: string
  copertina: File | null
}

interface BookState {
  books: Array<BookListItem> | string
  singleBook: BookResponse | string
  maxpage: number
  isLoading: boolean

  // Actions
  fetchBooks: (page: number, limit: number, searchQuery?: string) => Promise<undefined | string>
  fetchSingleBook: (bookId: number) => Promise<undefined | string>
  addBook: (book: CreateBookPayload, thumbnail?: File | null) => Promise<boolean>
  editBook: (bookId: number, book: UpdateBookPayload, file?: File | null) => Promise<boolean>
  deleteBook: (bookId: number) => Promise<void>
}

function formatErrorMessage(data: unknown, fallback: string): string {
  return typeof data === 'string' ? data : fallback
}

const useBookStore = create<BookState>((_set, _get) => {
  return {
    books: [],
    singleBook: '',
    maxpage: 1,
    isLoading: false,

    fetchBooks: async (page: number, limit: number, searchQuery?: string) => {
      _set({ isLoading: true })

      try {
        const response = await booksApi.getBooks(page, limit, searchQuery ?? null)
        if (response.status === 200) {
          const formattedBooks: Array<BookListItem> = response.data.books.map((book) => ({
            ...book,
            autori: book.autori.join(', '),
            copertina: null,
          }))
          _set({ books: formattedBooks, maxpage: response.data.maxpage })
        } else if (response.status === 204) {
          _set({ books: 'No books found! Is the database empty?' })
        } else {
          _set({ books: 'An error has occurred and no books were found! (Response is not 200 OK)' })
        }
      } catch (error) {
        console.error('Error fetching multiple books:', error)
        notifications.show({
          title: 'Errore',
          message: 'Impossibile caricare i libri',
          color: 'red',
        })
        _set({
          books:
            'An error has occurred! Please report this (Axios get failed. Maybe the API is not accessible?)',
        })
      } finally {
        _set({ isLoading: false })
      }
    },

    fetchSingleBook: async (bookId: number) => {
      if (!bookId) {
        console.error('No book id provided while fetching single book')
        return 'No book id provided while fetching single book'
      }
      _set({ isLoading: true })
      try {
        const response = await booksApi.getBook(bookId)
        if (response.status === 200) {
          _set({ singleBook: { ...response.data.book } })
        } else {
          return 'An error has occurred and no book was found! (Response is not 200 OK)'
        }
      } catch (error) {
        console.error('Error fetching single book:', error)
        notifications.show({
          title: 'Errore',
          message: 'Impossibile caricare il libro',
          color: 'red',
        })
        return 'An error has occurred! Are you sure that book exists?'
      } finally {
        _set({ isLoading: false })
      }
    },

    addBook: async (book: CreateBookPayload, thumbnail?: File | null) => {
      try {
        const response = await booksApi.createBook(JSON.stringify(book), thumbnail ?? undefined)

        if (response.status === 201) {
          notifications.show({
            title: 'Successo',
            message: 'Libro aggiunto correttamente',
            color: 'green',
          })
          return true
        } else {
          notifications.show({
            title: 'Errore client',
            message: formatErrorMessage(response.data, 'Errore sconosciuto'),
            color: 'red',
          })
          return false
        }
      } catch (_error) {
        notifications.show({
          title: 'Errore di rete',
          message: 'Impossibile connettersi al server',
          color: 'red',
        })
        return false
      }
    },

    editBook: async (bookId: number, book: UpdateBookPayload, file?: File | null) => {
      try {
        const response = await booksApi.updateBook(bookId, JSON.stringify(book), file ?? undefined)

        if (response.status === 200) {
          _set((state) => {
            if (!Array.isArray(state.books)) {
              return state
            }

            const updatedBooks: Array<BookListItem> = state.books.map((item) =>
              item.id === bookId
                ? {
                    ...item,
                    titolo: book.titolo ?? item.titolo,
                    isbn: book.isbn ?? item.isbn,
                    genere: Array.isArray(book.genere) ? book.genere : item.genere,
                    quantita: book.quantita ?? item.quantita,
                    casaEditrice: book.casaEditrice ?? item.casaEditrice,
                    descrizione: book.descrizione ?? item.descrizione,
                    autori:
                      [book.nomeAutore, book.cognomeAutore]
                        .filter(
                          (part): part is Array<string> => Array.isArray(part) && part.length > 0
                        )
                        .map((part) => part.join(' '))
                        .join(', ') || item.autori,
                    copertina: file ?? item.copertina,
                  }
                : item
            )

            return {
              ...state,
              books: updatedBooks,
            }
          })

          notifications.show({
            title: 'Successo',
            message: 'Libro modificato correttamente',
            color: 'green',
          })
          return true
        } else {
          notifications.show({
            title: 'Errore client',
            message: formatErrorMessage(response.data, 'Errore sconosciuto'),
            color: 'red',
          })
          return false
        }
      } catch (_error) {
        notifications.show({
          title: 'Errore di rete',
          message: 'Impossibile connettersi al server',
          color: 'red',
        })
        return false
      }
    },

    deleteBook: async (bookId: number) => {
      try {
        const response = await booksApi.deleteBook(bookId)
        if (response.status === 200) {
          _set((state) => {
            if (!Array.isArray(state.books)) {
              return state
            }
            return {
              ...state,
              books: state.books.filter((book) => book.id !== bookId),
            }
          })
          notifications.show({
            title: 'Successo',
            message: 'Libro eliminato correttamente',
            color: 'green',
          })
        } else {
          notifications.show({
            title: 'Errore',
            message: 'Impossibile eliminare il libro',
            color: 'red',
          })
        }
      } catch (_error) {
        notifications.show({
          title: 'Errore di rete',
          message: 'Impossibile connettersi al server',
          color: 'red',
        })
      }
    },
  }
})

export default useBookStore
