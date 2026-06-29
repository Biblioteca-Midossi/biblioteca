import { Group, Pagination, SimpleGrid, Stack, Text } from '@mantine/core'
import { SearchBar } from '@local/components/SearchBar'
import { getBreakpoints } from '@local/components/Utils/getBreakpoints'
import { getResponsivePadding } from '@local/styles/bookGridStyles'
import type { Book } from '@local/types/book'
import type { ReactNode } from 'react'

interface BookGridProps {
  books: Array<Partial<Book>> | string
  maxpage: number
  page: number
  onPageChange: (page: number) => void
  onSearch: (query: string) => void
  renderBookCard: (book: Partial<Book>) => ReactNode
}

export function BookGrid({
  books,
  maxpage,
  page,
  onPageChange,
  onSearch,
  renderBookCard
}: BookGridProps) {
  const currentBreakpoint = getBreakpoints()

  return (
    <>
      {books instanceof Array ? (
        <SimpleGrid
          cols={{
            xs: 2,
            sm: 4,
            lg: 6,
            xl: 8,
          }}
          spacing="xs"
          className={
            `mt-4 mb-1 w-full items-center pt-2 pl-[${getResponsivePadding(currentBreakpoint)}] pr-[${getResponsivePadding(currentBreakpoint)}]`
          }
        >
          {books.map((book) => renderBookCard(book))}
        </SimpleGrid>
      ) : (
        <Group justify="center" my="xl" className="w-full flex">
          <Text size="lg" fw={500} ta="center">
            {books}
          </Text>
        </Group>
      )}

      <Stack
        align="center"
        mb="xl"
      >
        <Pagination
          total={maxpage}
          value={page}
          onChange={onPageChange}
          color="midossi"
        />
        <SearchBar onSearch={onSearch} />
      </Stack>
    </>
  )
}