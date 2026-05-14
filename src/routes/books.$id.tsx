import { createFileRoute } from '@tanstack/react-router'
import { Box, Divider, Grid, Typography } from '@mui/material'
import useBookStore from '@local/hooks/useBookStore'
import { useEffect } from "react"
import host from "@local/hooks/getHost"

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
        <Grid
          container
          spacing={2}
          sx={{
            marginTop: '5rem',
            padding: '0 5%'
          }}
        >
          {/* Book Cover */}
          <Grid
            size={{ xs: 12, sm: 4, md: 3 }}
            sx={{
              textAlign: 'center'
            }}
          >
            <Box
              component="img"
              src={typeof(singleBook.coverUrl) === "string"
                ? `${host}/api/${singleBook.coverUrl}`
                : `${host}/api/assets/thumbnails/.no-thumbnail-found.png`
              }
              alt={`${singleBook.titolo}'s cover`}
              sx={{
                width: '100%',
                maxWidth: '300px',
                aspectRatio: '9/16',
                objectFit: 'contain'
              }}
            />
          </Grid>

          {/* Book Details */}
          <Grid
            size={{ xs: 12, sm: 8, md: 6 }}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start'
            }}
          >
            <Typography variant="h4">{singleBook.titolo}</Typography>
            <Typography variant="subtitle1">by {singleBook.autori ?? "Autore Sconosciuto"}</Typography>
            <Divider
              variant="middle"
              sx={{
                marginY: '1.5rem'
              }}
            />
            <Typography variant="body1">{singleBook.descrizione}</Typography>
          </Grid>
        </Grid>
      ) : (
        <Typography variant="h5" sx={{ textAlign: 'center', marginTop: '2rem' }}>
          {singleBook}
        </Typography>
      )}
    </>
  )
}


