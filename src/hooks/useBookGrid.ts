import { useEffect, useMemo, useState } from 'react'
import useBookStore from "@local/hooks/useBookStore"
import { getBreakpoints } from "@local/components/Utils/getBreakpoints"
import type { Book } from '@local/types/book'

export const useBookGrid = () => {
  const { books, singleBook, maxpage, fetchBooks, fetchSingleBook, editBook, deleteBook } = useBookStore()

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [selectedBook, setSelectedBook] = useState<Partial<Book> | null>(null)

  const currentBreakpoint = getBreakpoints()
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [page, setPage] = useState<number>(1)

  const limit =
    (currentBreakpoint === "xl") ? 8
    : (currentBreakpoint === 'lg') ? 6
    : (currentBreakpoint === 'md') ? 4
    : (currentBreakpoint === 'sm') ? 4
    : 2

  const filteredBooks = useMemo(() => {
    if (!(books instanceof Array)) return []
    return books.sort((a, b) => a.id - b.id)
  }, [books])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPage(1)
  }

  const handlePageChange = (value: number) => {
    setPage(value)
  }

  useEffect(() => {
    void fetchBooks(page, limit, searchQuery)
  }, [page, limit, searchQuery, fetchBooks])

  return {
    books,
    singleBook,
    filteredBooks,
    maxpage,
    page,
    limit,
    anchorEl,
    selectedBook,
    currentBreakpoint,
    setAnchorEl,
    setSelectedBook,
    handleSearch,
    handlePageChange,
    fetchBooks,
    fetchSingleBook,
    editBook,
    deleteBook
  }
}
