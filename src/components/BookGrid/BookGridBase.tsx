import { Box, Divider, Grid, Pagination, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import useBookStore from "@local/hooks/useBookStore"
import { SearchBar } from '@local/components/SearchBar'
import { getBreakpoints } from "@local/components/Utils/getBreakpoints"
import { BookCard } from "@local/components/BookGrid/BookCard"
import type { Book } from '@local/types/Book'
import type { CSSProperties, ChangeEvent } from 'react'
import type { SxProps } from '@mui/material'

export const BookGridStyles: {
  [key: string]: CSSProperties | SxProps
} = {
  altText: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center'
  },
  containerGrid: {
    marginBottom: '1rem',
    width: '100%',
    maxWidth: '100%',
    justifyItems: 'center',
    paddingTop: '.5rem',
    '& .MuiGrid-item': {
      padding: 0.5
    },
    '& .MuiGrid-root:last-of-type': {
      margin: '0rem'
    }
  },
  bookCard: {
    height: '100%',
    width: '100%',
    padding: '.5rem',
    '& .MuiCardContent-root:last-child': {
      padding: 0,
      margin: '0rem'
    }
  },
  bookTitle: {
    whiteSpace: 'hidden',
    textOverflow: 'ellipsis'
  },
  bookAuthor: {
    whiteSpace: 'hidden',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
}

export function BookGridBase() {
  const currentBreakpoint = getBreakpoints()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const limit =
    (currentBreakpoint === "xl") ? 16
    : (currentBreakpoint === 'lg') ? 6
    : (currentBreakpoint === 'md') ? 4
    : (currentBreakpoint === 'sm') ? 4
    : 2
  // const limit = greaterThanMid ? 8 : smallToMid ? 3 : 2

  const { books, maxpage, fetchBooks } = useBookStore()

  useEffect(() => {
    void fetchBooks(page, limit, searchQuery)
  }, [page, limit, searchQuery, fetchBooks])

  function handleSearch(query: string) {
    setSearchQuery(query)
    setPage(1)
  }

  // Filter books based on search query
  const filteredBooks = useMemo(() => {
    if (!Array.isArray(books)) return []
    return books.sort((a, b) => a.id - b.id)
  }, [books])

  // console.log(filteredBooks[0])

  function handlePageChange(_event: ChangeEvent<unknown>, value: number) {
    setPage(value)
  }

  return (
    <>
      <Grid container sx={{
        ...BookGridStyles.containerGrid,
        paddingX: (currentBreakpoint === "xl") ? '4rem'
          : (currentBreakpoint === 'lg') ? '2.75rem'
          : (currentBreakpoint === 'md') ? '1.75rem'
          : (currentBreakpoint === 'sm') ? '1.25rem'
          : '.75rem',
        }}
      >
        {Array.isArray(books) ? (
          filteredBooks.map((book: Partial<Book>) => (
            <Grid
              key={book.id}
              size={{ xs: 6, sm: 3, md: 3, lg: 2, xl: 1.5 }}
            >
              <BookCard
                book={book}
              />
            </Grid>
          ))
        ) : (
          <Typography variant="h5" sx={BookGridStyles.altText}>
            {books}
          </Typography>
        )}
      </Grid>

      <Box
        sx={{
          flexDirection: 'column',
          display: "flex",
          justifyContent: "center",
          marginTop: '.5rem',
          width: "100%",
          marginBottom: '3rem'
        }}
      >
        <Pagination
          sx={{
            alignSelf: 'center',
            marginBottom: '.25rem'
          }}
          count={maxpage}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
      <Divider sx={{ width: '80%', marginX: 'auto' }}/>
      <SearchBar onSearch={handleSearch} />
    </>
  )
}
