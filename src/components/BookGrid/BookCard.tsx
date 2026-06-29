import { ActionIcon, Box, Card, Image, Text } from '@mantine/core'
import { IconDotsVertical } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import type { Book } from '@local/types/book'
import type { MouseEvent } from 'react'

interface BookCardProps {
  book: Partial<Book>
  showId?: boolean
  onMenuOpen?: (event: MouseEvent<HTMLButtonElement>, book: Partial<Book>) => void
}

export function BookCard({ book, showId, onMenuOpen }: BookCardProps) {
  const navigate = useNavigate()

  console.debug(`book cover: ${book.coverUrl}`)
  return (
    <Card padding="sm">
      <Card.Section>
        <Image
          className="aspect-1/1.5 cursor-pointer"
          src={typeof (book.coverUrl) === 'string'
            ? `/api/${book.coverUrl}`
            : `/api/assets/thumbnails/.no-thumbnail-found.png`
          }
          alt={book.titolo ?? 'Book cover'}
          draggable={false}
          onClick={() => {
            navigate({ to: `/books/${book.id}` })
          }}
        />
      </Card.Section>
      <Box p={0}>
        <Text
          size="sm"
          fw={500}
          truncate
        >
          {book.titolo}
        </Text>
        <Text
          size="xs"
          c="dimmed"
          truncate
        >
          {book.autori ?? "Autore Sconosciuto"}
        </Text>
        {showId && (
          <Text
            size="xs"
            c="dimmed"
            truncate
          >
            {book.id}
          </Text>
        )}
        {onMenuOpen && (
          <Box className="w-full flex justify-end">
            <ActionIcon
              variant="subtle"
              onClick={(e) => onMenuOpen(e, book)}
            >
              <IconDotsVertical size={16} />
            </ActionIcon>
          </Box>
        )}
      </Box>
    </Card>
  )
}
