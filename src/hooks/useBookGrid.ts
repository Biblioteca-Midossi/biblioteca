import { getBreakpoints } from '@local/components/Utils/getBreakpoints'
import { useBooks, useDeleteBook, useEditBook } from '@local/hooks/books'
import type { BookListItem } from '@local/types/book'
import { useEffect, useMemo, useState } from 'react'

export const useBookGrid = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [selectedBook, setSelectedBook] = useState<Partial<BookListItem> | null>(null)

  const currentBreakpoint = getBreakpoints()
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [page, setPage] = useState<number>(1)

  const limit =
    currentBreakpoint === 'xl'
      ? 8
      : currentBreakpoint === 'lg'
        ? 6
        : currentBreakpoint === 'md'
          ? 4
          : 2

  const booksQuery = useBooks(page, limit, searchQuery || null)
  const editBook = useEditBook()
  const deleteBook = useDeleteBook()

  const books = useMemo(() => booksQuery.data?.books ?? [], [booksQuery.data])
  const maxpage = booksQuery.data?.maxpage ?? 1

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPage(1)
  }

  const handlePageChange = (value: number) => {
    setPage(value)
  }

  useEffect(() => {
    setSelectedBook(null)
  }, [page, limit, searchQuery])

  return {
    books,
    maxpage,
    page,
    limit,
    anchorEl,
    selectedBook,
    currentBreakpoint,
    isLoading: booksQuery.isPending,
    setAnchorEl,
    setSelectedBook,
    handleSearch,
    handlePageChange,
    editBook: editBook.mutateAsync,
    deleteBook: deleteBook.mutateAsync,
  }
}
