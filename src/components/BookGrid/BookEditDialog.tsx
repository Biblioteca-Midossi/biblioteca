import { Box, Button, Group, Image, SimpleGrid, TextInput } from '@mantine/core'
import { modals } from '@mantine/modals'
import { useForm } from '@mantine/form'
import { useEffect } from 'react'
import type { ChangeEvent } from 'react'
import type { Book } from '@local/types/book'

export interface EditBookFormValues {
  titolo: string
  nomeAutore: string
  cognomeAutore: string
  isbn: string
  genere: string
  quantita: string
  casaEditrice: string
  istituto: string
  scaffale: string
  descrizione: string
  copertina: File | null
  coverUrl: string
}

interface BookEditFormContentProps {
  book: Partial<Book> | null
  onClose: () => void
  onSubmit: (values: EditBookFormValues) => Promise<void>
}

function BookEditFormContent({ book, onClose, onSubmit }: BookEditFormContentProps) {
  const form = useForm<EditBookFormValues>({
    initialValues: {
      titolo: '',
      nomeAutore: '',
      cognomeAutore: '',
      isbn: '',
      genere: '',
      quantita: '',
      casaEditrice: '',
      istituto: '',
      scaffale: '',
      descrizione: '',
      copertina: null,
      coverUrl: '',
    },
  })

  useEffect(() => {
    if (book) {
      form.setValues({
        titolo: book.titolo || '',
        nomeAutore: book.nomeAutore?.join(', ') || '',
        cognomeAutore: book.cognomeAutore?.join(', ') || '',
        isbn: book.isbn || '',
        genere: book.genere?.join(', ') || '',
        quantita: book.quantita || '',
        casaEditrice: book.casaEditrice || '',
        istituto: book.istituto || '',
        scaffale: book.scaffale || '',
        descrizione: book.descrizione || '',
        copertina: book.copertina || null,
        coverUrl: book.coverUrl || '',
      })
    }
  }, [book])

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      form.setFieldValue('copertina', file)
      form.setFieldValue('coverUrl', URL.createObjectURL(file))
    }
  }

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mt="sm">
        <TextInput label="Titolo" {...form.getInputProps('titolo')} />
        <TextInput label="Nome Autore (separato da virgole)" {...form.getInputProps('nomeAutore')} />
        <TextInput label="Cognome Autore (separato da virgole)" {...form.getInputProps('cognomeAutore')} />
        <TextInput label="ISBN" {...form.getInputProps('isbn')} />
        <TextInput label="Genere (separato da virgole)" {...form.getInputProps('genere')} />
        <TextInput label="Quantità" type="number" {...form.getInputProps('quantita')} />
        <TextInput label="Casa Editrice" {...form.getInputProps('casaEditrice')} />
        <TextInput label="Istituto" {...form.getInputProps('istituto')} />
        <TextInput label="Scaffale" {...form.getInputProps('scaffale')} />
      </SimpleGrid>
      <Box mt="md">
        <TextInput label="Descrizione" {...form.getInputProps('descrizione')} />
      </Box>
      <Box mt="md">
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {form.values.coverUrl && (
          <Image src={form.values.coverUrl} alt="Current Cover" className="max-w-48 mt-4" />
        )}
      </Box>
      <Group justify="flex-end" mt="md">
        <Button onClick={onClose} variant="default">Annulla</Button>
        <Button type="submit">Salva Modifiche</Button>
      </Group>
    </form>
  )
}

export function openBookEditModal(book: Partial<Book> | null, onSubmit: (values: EditBookFormValues) => Promise<void>) {
  const modalId = modals.open({
    title: 'Modifica Libro',
    size: 'lg',
    centered: true,
    children: <BookEditFormContent book={book} onSubmit={onSubmit} onClose={() => modals.close(modalId)} />,
  })
}
