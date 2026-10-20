import { BookCard } from '@local/components/BookGrid/BookCard'
import type { EditBookFormValues } from '@local/components/BookGrid/BookEditDialog'
import { BookGrid } from '@local/components/BookGrid/BookGrid'
import { BookOptionsMenu } from '@local/components/BookGrid/BookOptionsMenu'
import { openBookEditModal } from '@local/components/BookModals'
import { useBookGrid } from '@local/hooks/useBookGrid'
import type { BookListItem } from '@local/types/book'
import { Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { useNavigate } from '@tanstack/react-router'
import type { MouseEvent } from 'react'

export function BookGridDashboard() {
  const navigate = useNavigate()
  const {
    books,
    maxpage,
    page,
    anchorEl,
    selectedBook,
    setAnchorEl,
    setSelectedBook,
    handleSearch,
    handlePageChange,
    editBook,
    deleteBook,
  } = useBookGrid()

  function handleMenuOpen(event: MouseEvent<HTMLButtonElement>, book: Partial<BookListItem>) {
    event.preventDefault()
    setSelectedBook(book)
    setAnchorEl(event.currentTarget)
  }

  function handleMenuClose() {
    setAnchorEl(null)
  }

  function handleGoToPage() {
    if (selectedBook?.id) {
      navigate({ to: `/books/${selectedBook.id}` })
    }
  }

  async function handleEditSubmit(values: EditBookFormValues) {
    try {
      const bookData = {
        titolo: values.titolo,
        nomeAutore: values.nomeAutore ? values.nomeAutore.split(',').map((s) => s.trim()) : [],
        cognomeAutore: values.cognomeAutore
          ? values.cognomeAutore.split(',').map((s) => s.trim())
          : [],
        isbn: values.isbn,
        genere: values.genere ? values.genere.split(',').map((s) => s.trim()) : [],
        quantita: Number(values.quantita),
        casaEditrice: values.casaEditrice,
        descrizione: values.descrizione,
        istituto: values.istituto || undefined,
        scaffale: values.scaffale || undefined,
      }
      if (!selectedBook?.id) return
      await editBook({
        bookId: selectedBook.id,
        book: bookData,
        file: values.copertina ?? undefined,
      })
      modals.closeAll()
    } catch {
      /* handled by the mutation notification */
    }
  }

  return (
    <>
      <BookGrid
        books={books}
        maxpage={maxpage}
        page={page}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        renderBookCard={(book) => (
          <BookCard key={book.id} book={book} showId onMenuOpen={handleMenuOpen} />
        )}
      />

      <BookOptionsMenu
        anchorEl={anchorEl}
        onClose={handleMenuClose}
        onEdit={() => {
          handleMenuClose()
          openBookEditModal(selectedBook, handleEditSubmit)
        }}
        onDelete={() => {
          modals.openConfirmModal({
            title: 'Conferma eliminazione',
            centered: true,
            children: (
              <Text size="sm">
                Sei sicuro di voler eliminare il libro &quot;{selectedBook?.titolo}&quot;? Questa
                azione non può essere annullata.
              </Text>
            ),
            labels: { confirm: 'Elimina', cancel: 'Annulla' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
              handleMenuClose()
              if (selectedBook?.id) {
                await deleteBook(selectedBook.id)
              }
            },
          })
        }}
        onGoToPage={handleGoToPage}
      />
    </>
  )
}
