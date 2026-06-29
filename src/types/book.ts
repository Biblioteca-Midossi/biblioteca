/*
Books fields will always be ordered like in this in the suite entirety,
apart from database initialization.
 */

export interface Book {
  // ID FROM DB
  id: number

  // Collocazione
  istituto: string
  scaffale: string

  // Autore/i
  autori: Array<string>
  nomeAutore?: Array<string>
  cognomeAutore?: Array<string>

  // Libro
  isbn: string
  titolo: string
  genere: Array<string>
  quantita: string
  casaEditrice: string
  descrizione: string
  copertina: File | null
  coverUrl: string
}
