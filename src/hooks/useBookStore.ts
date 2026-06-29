import { create } from 'zustand'
import { api } from '@local/hooks/api'
import { notifications } from '@mantine/notifications'
import type { Book } from '@local/types/book'

interface BookState {
  books: Array<Book> | string
  singleBook: Partial<Book> | string
  maxpage: number
  isLoading: boolean

  // Actions
  fetchBooks: (page: number, limit: number, searchQuery?: string) => Promise<void | string>
  fetchSingleBook: (bookId: number) => Promise<void | string>
  addBook: (book: Partial<Book>) => Promise<boolean>
  editBook: (book: Partial<Book>) => Promise<boolean>
  deleteBook: (bookId: number) => Promise<void>
}

const useBookStore = create<BookState>((_set, _get) => {
  return ({
    books: [],
    singleBook: '',
    maxpage: 1,
    isLoading: false,

    fetchBooks: async (page: number, limit: number, searchQuery?: string) => {
      _set({ isLoading: true })
      let url = `/books?page=${page}&limit=${limit}`
      if (searchQuery) {
        url += `&search=${searchQuery}`
      }

      try {
        const response = await api.get(url)
        if (response.status === 200) {
          const formattedBooks = response.data.books.map((book: Book) => ({
            ...book,
            autori: book.autori.join(', '),
            coverUrl: `${api.defaults.baseURL}/${book.coverUrl}`
          }))
          _set({ books: formattedBooks, maxpage: response.data.maxpage })
        } else if (response.status === 204) {
          _set({ books: "No books found! Is the database empty?" })
        } else {
          _set({ books: "An error has occurred and no books were found! (Response is not 200 OK)" })
        }
      } catch (error) {
        console.error('Error fetching multiple books:', error)
        notifications.show({
          title: 'Errore',
          message: 'Impossibile caricare i libri',
          color: 'red',
        })
        _set({
          books: 'An error has occurred! Please report this (Axios get failed. Maybe the API is not accessible?)'
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
        const response = await api.get(`/books/${bookId}`)
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

    addBook: async (book: Partial<Book>) => {
      const book_obj = {
        ...book,
        copertina: null,
      }

      const formData = new FormData()
      formData.append('data', JSON.stringify(book_obj))

      if (book.copertina) {
        formData.append('thumbnail', book.copertina)
      }

      try {
        const response = await api.post('/books', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        if (response.status === 201) {
          notifications.show({
            title: 'Successo',
            message: 'Libro aggiunto correttamente',
            color: 'green',
          })
          return true

        } else if (response.status === 400) {
          notifications.show({
            title: 'Errore client',
            message: response.data,
            color: 'red',
          })
          return false

        } else if (response.status === 500) {
          notifications.show({
            title: 'Errore server',
            message: response.data,
            color: 'red',
          })
          return false

        } else {
          notifications.show({
            title: 'Errore sconosciuto',
            message: response.data,
            color: 'red',
          })
          return false
        }
      } catch (error) {
        notifications.show({
          title: 'Errore di rete',
          message: 'Impossibile connettersi al server',
          color: 'red',
        })
        return false
      }
    },

    editBook: async (updatedBook: Partial<Book>) => {
      const formData = new FormData()
      formData.append('updatedBook', JSON.stringify({
        ...updatedBook,
        copertina: null,
        coverUrl: null,
      }))

      if (updatedBook.copertina) {
        formData.append('file', updatedBook.copertina)
      }

      try {
        const response = await api.put(`/books/${updatedBook.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        if (response.status === 200) {
          _set((state: BookState) => {
            if (!(state.books instanceof Array)) {
              return state
            }

            const updatedBooks: Array<Book> = state.books.map((book: Book) =>
              book.id === updatedBook.id
                ? { ...book, ...updatedBook }
                : book
            )

            return {
              ...state,
              books: updatedBooks
            }
          })

          notifications.show({
            title: 'Successo',
            message: 'Libro modificato correttamente',
            color: 'green',
          })
          return true
        } else if (response.status === 400) {
          notifications.show({
            title: 'Errore client',
            message: response.data,
            color: 'red',
          })
          return false

        } else if (response.status === 500) {
          notifications.show({
            title: 'Errore server',
            message: response.data,
            color: 'red',
          })
          return false

        } else {
          notifications.show({
            title: 'Errore sconosciuto',
            message: response.data,
            color: 'red',
          })
          return false
        }
      } catch (error) {
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
        const response = await api.delete(`/books/${bookId}`)
        if (response.status === 200) {
          _set((state: BookState) => {
            if (!(state.books instanceof Array)) {
              return state
            }
            return {
              ...state,
              books: state.books.filter((book: Book) => book.id !== bookId)
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
      } catch (error) {
        notifications.show({
          title: 'Errore di rete',
          message: 'Impossibile connettersi al server',
          color: 'red',
        })
      }
    },
  })
})

export default useBookStore
