import { createFileRoute } from '@tanstack/react-router'
import { Box, Divider, Image, SimpleGrid, Text, Title } from '@mantine/core'
import useBookStore from '@local/hooks/useBookStore'
import { useEffect } from 'react'

export const Route = createFileRoute('/books/$id')({
  component: BookPage,
})

function BookPage() {
  const { id: bookId } = Route.useParams()

  const { singleBook, fetchSingleBook } = useBookStore()

  useEffect(() => {
    void fetchSingleBook(bookId)
  }, [bookId, fetchSingleBook])

  return (
    <>
      {typeof singleBook !== 'string' ? (
        <SimpleGrid
          cols={{ base: 1, sm: 3 }}
          spacing="md"
          mt="5rem"
          p="0 5%"
          className="flex align-center"
        >
          <Box className="text-center">
            <Image
              src={typeof (singleBook.coverUrl) === 'string'
                ? `/api/${singleBook.coverUrl}`
                : `/api/uploads/thumbnails/.no-thumbnail-found.png`
              }
              alt={`${singleBook.titolo}'s cover`}
              m="auto"
              className="w-full max-w-2xs aspect-9/16 object-contain"
            />
          </Box>

          <Box className="flex flex-col justify-start">
            <Title order={2}>{singleBook.titolo}</Title>
            <Text size="lg" c="dimmed">by {singleBook.autori ?? "Autore Sconosciuto"}</Text>
            <Divider my="lg" />
            <Text>{singleBook.descrizione}</Text>
          </Box>
        </SimpleGrid>
      ) : (
        <Text size="lg" mt="xl" className="text-center">
          {singleBook}
        </Text>
      )}
    </>
  )
}
