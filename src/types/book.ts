import type { BookResponse } from '@local/api'

/** Store-level book view: BookResponse with `autori` flattened to a display string and the File kept for edit flows. */
export interface BookListItem extends Omit<BookResponse, 'autori'> {
  autori: string
  copertina: File | null
}

export function toBookListItem(book: BookResponse): BookListItem {
  return {
    ...book,
    autori: book.autori.join(', '),
    copertina: null,
  }
}
