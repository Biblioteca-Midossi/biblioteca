import { BookCard } from '@local/components/BookGrid/BookCard'
import type { EditBookFormValues } from '@local/components/BookGrid/BookEditDialog'
import { openBookEditModal } from '@local/components/BookGrid/BookEditDialog'
import { BookGrid } from '@local/components/BookGrid/BookGrid'
import { BookOptionsMenu } from '@local/components/BookGrid/BookOptionsMenu'
import { useBookGrid } from '@local/hooks/useBookGrid'
import type { Book } from '@local/types/book'
import { Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { useNavigate } from '@tanstack/react-router'
import type { MouseEvent } from 'react'

export function BookGridDashboard() {
  const navigate = useNavigate()
  const {
    books,
    filteredBooks,
    maxpage,
    page,
    limit,
    anchorEl,
    selectedBook,
    setAnchorEl,
    setSelectedBook,
    handleSearch,
    handlePageChange,
    fetchBooks,
    editBook,
    deleteBook,
  } = useBookGrid()

  function handleMenuOpen(event: MouseEvent<HTMLButtonElement>, book: Partial<Book>) {
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
        id: selectedBook?.id,
        titolo: values.titolo,
        nomeAutore: values.nomeAutore ? values.nomeAutore.split(',').map((s) => s.trim()) : [],
        cognomeAutore: values.cognomeAutore
          ? values.cognomeAutore.split(',').map((s) => s.trim())
          : [],
        isbn: values.isbn,
        genere: values.genere ? values.genere.split(',').map((s) => s.trim()) : [],
        quantita: values.quantita,
        casaEditrice: values.casaEditrice,
        istituto: values.istituto,
        scaffale: values.scaffale,
        descrizione: values.descrizione,
        copertina: values.copertina,
      }
      const success = await editBook(bookData)
      if (success) {
        await fetchBooks(page, limit, '')
        modals.closeAll()
      }
    } catch (_error) {
      /* handled by the store notification */
    }
  }

  return (
    <>
      <BookGrid
        books={Array.isArray(books) ? filteredBooks : books}
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
                void fetchBooks(page, limit, '')
              }
            },
          })
        }}
        onGoToPage={handleGoToPage}
      />
    </>
  )
}
