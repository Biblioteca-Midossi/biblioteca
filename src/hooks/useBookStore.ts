import { create } from 'zustand'
import api from '@local/hooks/api'
import type { Book } from '@local/types/Book'

interface BookState {
  books: Array<Book> | string
  singleBook: Partial<Book> | string
  maxpage: number
  isLoading: boolean

  // Actions
  fetchBooks: (page: number, limit: number, searchQuery?: string) => Promise<void | string>
  fetchSingleBook: (bookId: number) => Promise<void | string>
  addBook: (book: Partial<Book>) => Promise<Array<string>>
  editBook: (book: Partial<Book>) => Promise<void | string>
  deleteBook: (bookId: number) => Promise<string>
}

const useBookStore = create<BookState>((_set, _get) => {
  return ({
    books: [],
    singleBook: '',
    maxpage: 1,
    isLoading: false,

    // @ts-expect-warning
    fetchBooks: async (page: number, limit: number, searchQuery?: string) => {
      _set({ isLoading: true })
      let url = `/books?page=${page}&limit=${limit}`
      if (searchQuery) {
        url += `&search=${searchQuery}`
      }

      try {
        await api.get(url)
          .then((response) => {
            if (response.status === 200) {
              // response.data.books.map((book: Book) => (console.debug(book.autori)))
              const formattedBooks = response.data.books.map((book: Book) => ({
                ...book,
                autori: book.autori.join(', '),
                coverUrl: `${api.defaults.baseURL}/${book.coverUrl}`
              }))

              _set({ books: formattedBooks, maxpage: response.data.maxpage })

            } else if (response.status === 204) {
              _set({ books: "No books found! Is the database empty?" })
            }
            else {
              _set({ books: "An error has occurred and no books were found! (Response is not 200 OK)" })
            }
          })
      } catch (error) {
        console.error('Error fetching multiple books:', error)
        _set({
          books: 'An error has occurred! Please report this (Axios get failed. Maybe the API is not accessible?)'
        })
      } finally {
        _set({ isLoading: false })
      }
    },

    // @ts-expect-warning
    fetchSingleBook: async (bookId: number) => {
      if (!bookId) {
        console.error('No book id provided while fetching single book')
        return 'No book id provided while fetching single book'
      }
      _set({ isLoading: true })
      try {
        await api.get(`/books/${bookId}`)
          .then((response) => {
            if (response.status === 200) {
              const book = response.data.book
              _set({
                singleBook: {
                  ...book
                }
              })
              // console.debug(_get().singleBook)
            } else {
              return 'An error has occurred and no book was found! (Response is not 200 OK)'
            }
          })

      } catch (error) {
        console.error('Error fetching single book:', error)
        return 'An error has occurred! Are you sure that book exists?'
      } finally {
        _set({ isLoading: false })
      }
    },

    // @ts-expect-warning
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
        return await api.post('/books', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .then(function (response) {
          // console.debug(response.status)
          if (response.status === 201) {
            return ['successful-request']

          } else if (response.status === 400) {
            console.error('Client error:', response.data)
            return ['client-error', response.data]

          } else if (response.status === 500) {
            console.error('Server error:', response.data)
            return ['server-error', response.data]

          } else {
            console.error('Uncoded error:', response.data)
            return ['uncoded-error', response.data]

          }
        })
        .catch(function (error) {
          console.error('Network error:', error)
          return ['network-error', error]
        })
      } catch (error) {
        console.error('Network error:', error)
        return ['network-error', error as string]
      }
    },

    // @ts-expect-warning
    editBook: async (updatedBook: Partial<Book>) => {
      // console.debug("updatedBook:", updatedBook)
      const formData = new FormData()
      formData.append('updatedBook', JSON.stringify({
        ...updatedBook,
        copertina: null,
        coverUrl: null,
      }))

      if (updatedBook.copertina) {
        formData.append('file', updatedBook.copertina)
      }

      console.debug("FormData edit:", formData)

      return await api.put(`/books/${updatedBook.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(function (response) {
          if (response.status === 200) {
            _set((state: BookState) => {
              if (!Array.isArray(state.books)) {
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

            return 'successful-request'
          } else if (response.status === 400) {
            console.error('Client error:', response.data)
            return 'client-error'

          } else if (response.status === 500) {
            console.error('Server error:', response.data)
            return 'server-error'

          } else {
            console.error('Unknown error:', response.data)
            return 'unknown error'

          }
        })
        .catch(function (error) {
          console.error('Network error:', error)
          return 'network-error'
        })
    },

    // @ts-expect-warning
    deleteBook: async (bookId: number) => {
      try {
        return await api.delete(`/books/${bookId}`)
          .then((response) => {
            if (response.status === 200) {
              _set((state: BookState) => {
                if (!Array.isArray(state.books)) {
                  return state
                }
                return {
                  ...state,
                  books: state.books.filter((book: Book) => book.id !== bookId)
                }
              })
              return 'successful-request'
            } else {
              console.error('Error deleting book:', response.data)
              return 'delete-error'
            }
          })
      } catch (error) {
        console.error('Network error when deleting book:', error)
        return 'network-error'
      }
    },
  })
})

export default useBookStore