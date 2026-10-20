import {
  BookEditFormContent,
  type EditBookFormValues,
} from '@local/components/BookGrid/BookEditDialog'
import { BookAddFormContent } from '@local/components/BookInputForm'
import type { BookListItem } from '@local/types/book'
import { modals } from '@mantine/modals'

/** Modal-opener helpers. Kept out of the component files so they stay
 * Fast-Refresh compatible (modules must export only components or only
 * plain functions). */
export function openBookAddModal() {
  const modalId = modals.open({
    title: 'Aggiungi Libro',
    size: 'lg',
    children: <BookAddFormContent onClose={() => modals.close(modalId)} />,
  })
}

export function openBookEditModal(
  book: Partial<BookListItem> | null,
  onSubmit: (values: EditBookFormValues) => Promise<void>
) {
  const modalId = modals.open({
    title: 'Modifica Libro',
    size: 'lg',
    centered: true,
    children: (
      <BookEditFormContent book={book} onSubmit={onSubmit} onClose={() => modals.close(modalId)} />
    ),
  })
}
