import { useBook } from '@local/hooks/books'
import { Box, Divider, Image, Loader, SimpleGrid, Text, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/books/$id')({
  component: BookPage,
})

function BookPage() {
  const { id: bookId } = Route.useParams()
  const bookIdNumber = Number(bookId)

  const bookQuery = useBook(Number.isFinite(bookIdNumber) ? bookIdNumber : undefined)

  if (bookQuery.isPending) {
    return <Loader mt="5rem" m="auto" style={{ display: 'block' }} />
  }

  if (bookQuery.isError || !bookQuery.data) {
    return (
      <Text size="lg" mt="xl" className="text-center">
        Libro non trovato
      </Text>
    )
  }

  const book = bookQuery.data

  return (
    <SimpleGrid
      cols={{ base: 1, sm: 3 }}
      spacing="md"
      mt="5rem"
      p="0 5%"
      className="flex align-center"
    >
      <Box className="text-center">
        <Image
          src={
            typeof book.coverUrl === 'string'
              ? `/api/${book.coverUrl}`
              : `/api/uploads/thumbnails/.no-thumbnail-found.png`
          }
          alt={`${book.titolo}'s cover`}
          m="auto"
          className="w-full max-w-2xs aspect-9/16 object-contain"
        />
      </Box>

      <Box className="flex flex-col justify-start">
        <Title order={2}>{book.titolo}</Title>
        <Text size="lg" c="dimmed">
          by {book.autori.join(', ') || 'Autore Sconosciuto'}
        </Text>
        <Divider my="lg" />
        <Text>{book.descrizione}</Text>
      </Box>
    </SimpleGrid>
  )
}
