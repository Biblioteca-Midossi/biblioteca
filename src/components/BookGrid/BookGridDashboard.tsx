import React from 'react'
import { Box, Grid, Pagination, Typography } from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { useBookGrid } from '@local/hooks/useBookGrid'
import { BookGridStyles, getResponsivePadding } from '@local/styles/bookGridStyles'
import { BookOptionsMenu } from '@local/components/BookGrid/BookOptionsMenu'
import { SearchBar } from '@local/components/SearchBar'
import { BookEditDialog } from '@local/components/BookGrid/BookEditDialog'
import { BookDeleteDialog } from '@local/components/BookGrid/BookDeleteDialog'
import { BookCard } from '@local/components/BookGrid/BookCard'

export function BookGridDashboard() {
  const navigate = useNavigate()
  const {
    books,
    filteredBooks, 
    maxpage, 
    page,
    limit,
    currentBreakpoint,
    anchorEl,
    selectedBook,
    isDeleteDialogOpen,
    deleteResponseDialog,
    isEditDialogOpen,
    editFormData,
    setAnchorEl,
    setSelectedBook,
    setIsDeleteDialogOpen,
    setDeleteResponseDialog,
    setIsEditDialogOpen,
    setEditFormData,
    handleSearch,
    handlePageChange,
    fetchBooks,
    editBook,
    deleteBook
  } = useBookGrid()

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, book: any) => {
    event.preventDefault()
    setSelectedBook(book)
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleGoToPage = () => {
    if (selectedBook?.id) {
      navigate({ to: `/books/${selectedBook.id}` })
    }
  }

  function parseAuthors(authorsString: string | Array<string> | undefined) {
    if (Array.isArray(authorsString)) {
      // If it's already an array, process each author
      return authorsString.map(authorStr => {
        const [nome, ...cognomeparts] = authorStr.split(' ')
        return {
          nome: nome,
          cognome: cognomeparts.join(' ')
        }
      })
    }

    // If it's a string of authors
    return authorsString?.split(', ').map(authorStr => {
      const [nome, ...cognomeparts] = authorStr.split(' ')
      return {
        nome: nome,
        cognome: cognomeparts.join(' ')
      }
    })
  }

  return (
    <>
      <Grid
        container 
        sx={{
          ...BookGridStyles.containerGrid,
          paddingX: getResponsivePadding(currentBreakpoint),
        }}
      >
        {Array.isArray(books) ? (
          filteredBooks.map((book) => (
            <Grid
              key={book.id}
              size={{ xs: 6, sm: 3, md: 3, lg: 2, xl: 1.5 }}
            >
              <BookCard 
                book={book}
                showId
                onMenuOpen={handleMenuOpen} 
              />
            </Grid>
          ))
        ) : (
          <Typography variant="h5" sx={BookGridStyles.altText}>
            {books}
          </Typography>
        )}
      </Grid>

      <BookOptionsMenu 
        anchorEl={anchorEl}
        onClose={handleMenuClose}
        onEdit={() => {
          handleMenuClose()

          console.debug('onEdit', selectedBook)

          setEditFormData({
            ...selectedBook,
            nomeAutore: parseAuthors(selectedBook?.autori)!.map(author => author.nome),
            cognomeAutore: parseAuthors(selectedBook?.autori)!.map(author => author.cognome),
            autori: undefined,
          })

          setIsEditDialogOpen(true)
        }}
        onDelete={() => setIsDeleteDialogOpen(true)}
        onGoToPage={handleGoToPage}
      />

      <BookEditDialog 
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        onSubmit={async () => {
          try {
            const response = await editBook(editFormData)
            if (response === 'successful-request') {
              await fetchBooks(page, limit, '')
              setIsEditDialogOpen(false)
            }
          } catch (error) {
            console.error('Error editing book', error)
          }
        }}
      />

      <BookDeleteDialog 
        open={isDeleteDialogOpen}
        book={selectedBook}
        deleteResponseDialog={deleteResponseDialog}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          handleMenuClose()

          if (selectedBook?.id) {
            deleteBook(selectedBook.id).then((response) => {
              setDeleteResponseDialog({
                open: true,
                message: response === 'successful-request' 
                  ? 'Libro eliminato con successo' 
                  : "Errore durante l'eliminazione del libro.",
                success: response === 'successful-request',
              })
            })
          }
          setIsDeleteDialogOpen(false)
        }}
        onResponseDialogClose={() => {
          setDeleteResponseDialog({
            ...deleteResponseDialog,
            open: false
          })
          void fetchBooks(page, limit, '')
        }}
      />

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
        <SearchBar onSearch={handleSearch} />
      </Box>
    </>
  )
}