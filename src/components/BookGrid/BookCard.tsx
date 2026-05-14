import {
  Box, Card, CardContent, CardMedia, IconButton, Typography
} from '@mui/material'
import { MoreVertRounded } from '@mui/icons-material'
import { BookGridStyles } from '@local/styles/bookGridStyles'
import host from "@local/hooks/getHost"
import { useNavigate } from "@tanstack/react-router"
import type { Book } from '@local/types/Book'
import type { MouseEvent } from 'react'

interface BookCardProps {
  book: Partial<Book>
  showId?: boolean
  onMenuOpen?: (event: MouseEvent<HTMLButtonElement>, book: Partial<Book>) => void
}

export function BookCard({ book, showId, onMenuOpen }: BookCardProps) {
  const navigate = useNavigate()

  console.debug(`book cover: ${book.coverUrl}`)
  // console.debug(!book.coverUrl!.includes("undefined"))
  // console.debug(typeof book.coverUrl === "string")
  return (
    <Card sx={BookGridStyles.bookCard}>
      <CardMedia
        sx={{
          aspectRatio: 1/1.5
        }}
        component={'img'}
        image={!book.coverUrl!.includes("undefined")
          ? `${book.coverUrl}`
          : `${host}/api/assets/thumbnails/.no-thumbnail-found`
        }
        draggable={false}
        onClick={() => {
          navigate({ to: `/books/${book.id}` })
        }}
      />
      <CardContent
        sx={{
          padding: 0
        }}
      >
        <Typography
          variant={'subtitle1'}
          noWrap={true}
          sx={BookGridStyles.bookTitle}
        >
          {book.titolo}
        </Typography>
        <Typography
          variant={'subtitle2'}
          noWrap={true}
          sx={BookGridStyles.bookAuthor}
          color={'textSecondary'}
        >
          {book.autori ?? "Autore Sconosciuto"}
        </Typography>
        {showId && (
          <Typography
            variant={'subtitle2'}
            noWrap={true}
            sx={BookGridStyles.bookAuthor}
            color={'textSecondary'}
          >
            {book.id}
          </Typography>
        )}
        {onMenuOpen && (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton
              onClick={(e) => onMenuOpen(e, book)}
            >
              <MoreVertRounded />
            </IconButton>
          </Box>
        )}

      </CardContent>
    </Card>
  )
}