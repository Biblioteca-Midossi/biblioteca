import { BookCard } from '@local/components/BookGrid/BookCard'
import { BookGrid } from '@local/components/BookGrid/BookGrid'
import { getBreakpoints } from '@local/components/Utils/getBreakpoints'
import { useBooks } from '@local/hooks/books'
import { getResponsiveCols } from '@local/styles/bookGridStyles'
import type { BookListItem } from '@local/types/book'
import { Divider } from '@mantine/core'
import { useMemo, useState } from 'react'

export function BookGridBase() {
  const currentBreakpoint = getBreakpoints()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [page, setPage] = useState<number>(1)

  const limit = getResponsiveCols(currentBreakpoint)

  const booksQuery = useBooks(page, limit, searchQuery || null)

  const books = useMemo(
    () => [...(booksQuery.data?.books ?? [])].sort((a, b) => a.id - b.id),
    [booksQuery.data]
  )
  const maxpage = booksQuery.data?.maxpage ?? 1

  function handleSearch(query: string) {
    setSearchQuery(query)
    setPage(1)
  }

  return (
    <>
      <BookGrid
        books={books}
        maxpage={maxpage}
        page={page}
        onPageChange={setPage}
        onSearch={handleSearch}
        renderBookCard={(book: Partial<BookListItem>) => <BookCard book={book} />}
      />
      <Divider className="w-4/5 m-auto" />
    </>
  )
}
