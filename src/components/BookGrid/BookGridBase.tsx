import { Divider } from '@mantine/core'
import { useEffect, useState } from 'react'
import useBookStore from '@local/hooks/useBookStore'
import { getBreakpoints } from '@local/components/Utils/getBreakpoints'
import { getResponsiveCols } from '@local/styles/bookGridStyles'
import { BookCard } from '@local/components/BookGrid/BookCard'
import { BookGrid } from '@local/components/BookGrid/BookGrid'
import type { Book } from '@local/types/book'

export function BookGridBase() {
  const currentBreakpoint = getBreakpoints()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [page, setPage] = useState<number>(1)

  const limit = getResponsiveCols(currentBreakpoint)

  const { books, maxpage, fetchBooks } = useBookStore()

  useEffect(() => {
    void fetchBooks(page, limit, searchQuery)
  }, [page, limit, searchQuery, fetchBooks])

  function handleSearch(query: string) {
    setSearchQuery(query)
    setPage(1)
  }

  const filteredBooks = books instanceof Array
    ? [...books].sort((a, b) => a.id - b.id)
    : books

  return (
    <>
      <BookGrid
        books={filteredBooks}
        maxpage={maxpage}
        page={page}
        onPageChange={setPage}
        onSearch={handleSearch}
        renderBookCard={(book: Partial<Book>) => (
          <BookCard book={book} />
        )}
      />
      <Divider className="w-4/5 m-auto"/>
    </>
  )
}