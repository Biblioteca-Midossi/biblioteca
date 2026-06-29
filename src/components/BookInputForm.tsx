import { Button, Group, Select, Stack, Tabs, TextInput, Textarea, Tooltip } from '@mantine/core'
import { modals } from '@mantine/modals'
import { useForm } from '@mantine/form'
import { IconHelp } from '@tabler/icons-react'
import useBookStore from '@local/hooks/useBookStore'
import type { ChangeEvent } from 'react'

interface BookFormValues {
  istituto: string
  scaffale: string
  nomeAutore: string
  cognomeAutore: string
  isbn: string
  titolo: string
  genere: string
  quantita: string
  casaEditrice: string
  descrizione: string
  copertina: File | null
  preview: string
}

interface BookAddFormContentProps {
  onClose: () => void
}

function BookAddFormContent({ onClose }: BookAddFormContentProps) {
  const { addBook } = useBookStore()

  const form = useForm<BookFormValues>({
    initialValues: {
      istituto: '',
      scaffale: '',
      nomeAutore: '',
      cognomeAutore: '',
      isbn: '',
      titolo: '',
      genere: '',
      quantita: '',
      casaEditrice: '',
      descrizione: '',
      copertina: null,
      preview: '',
    },
  })

  function clearForm() {
    form.reset()
  }

  function onSelectFile(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) {
      form.setFieldValue('copertina', null)
      form.setFieldValue('preview', '')
      return
    }
    form.setFieldValue('copertina', e.target.files[0])
    form.setFieldValue('preview', URL.createObjectURL(e.target.files[0]))
  }

  async function handleSubmit(values: BookFormValues) {
    const success = await addBook({
      istituto: values.istituto,
      scaffale: values.scaffale,
      nomeAutore: values.nomeAutore ? [values.nomeAutore] : [],
      cognomeAutore: values.cognomeAutore ? [values.cognomeAutore] : [],
      isbn: values.isbn,
      titolo: values.titolo,
      genere: values.genere ? [values.genere] : [],
      quantita: values.quantita,
      casaEditrice: values.casaEditrice,
      descrizione: values.descrizione,
      copertina: values.copertina,
    })

    if (success) {
      clearForm()
      onClose()
    }
  }

  const istituti = ["ITT", "LAC", "LAV"]

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Tabs defaultValue="collocazione">
        <Tabs.List>
          <Tabs.Tab value="collocazione">Collocazione</Tabs.Tab>
          <Tabs.Tab value="autore">Autore</Tabs.Tab>
          <Tabs.Tab value="libro">Libro</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="collocazione" pt="xs">
          <Stack gap="xs">
            <Select
              required
              data={istituti}
              label="Istituto per Nome o ID (es. ITT, 1)"
              className="transition-none"
              classNames={{
                dropdown: "!rounded-t-none !border-t-0 !border-[var(--mantine-primary-color-filled)]",
                input: "!transition-none [&[data-expanded]]:!rounded-b-none [&[data-expanded]]:!border-[var(--mantine-primary-color-filled)]"
              }}
              comboboxProps={{
                position: 'bottom',
                offset: 0,
                withinPortal: true,
                middlewares: { flip: false, shift: false }
              }}
              rightSection={
                <Tooltip label="ITT: 1, LAC: 2, LAV: 3">
                  <IconHelp size={20} />
                </Tooltip>
              }
              {...form.getInputProps('istituto')}
            />
            <TextInput
              required
              label="Posizione/Scaffale (es. A01)"
              {...form.getInputProps('scaffale')}
            />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="autore" pt="xs">
          <Stack gap="xs">
            <TextInput
              required
              label="Nome"
              {...form.getInputProps('nomeAutore')}
            />
            <TextInput
              required
              label="Cognome"
              {...form.getInputProps('cognomeAutore')}
            />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="libro" pt="xs">
          <Stack gap="xs">
            <TextInput
              required
              label="Isbn"
              {...form.getInputProps('isbn')}
            />
            <TextInput
              required
              label="Titolo"
              {...form.getInputProps('titolo')}
            />
            <TextInput
              required
              label="Genere"
              {...form.getInputProps('genere')}
            />
            <TextInput
              required
              label="Quantità"
              {...form.getInputProps('quantita')}
            />
            <TextInput
              required
              label="Casa Editrice"
              {...form.getInputProps('casaEditrice')}
            />
            <Textarea
              required
              label="Descrizione"
              {...form.getInputProps('descrizione')}
              description={`${form.values.descrizione.length}/1024`}
              maxLength={1024}
            />
            <Button
              variant="outline"
              color="midossi"
              component="label"
              fullWidth
            >
              Carica copertina
              <input
                type="file"
                accept="file"
                onChange={onSelectFile}
                hidden
              />
            </Button>
            {form.values.preview && (
              <div className="flex justify-center">
                <img width="25%" src={form.values.preview} alt="Preview" />
              </div>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>

      <Group justify="flex-end" mt="md">
        <Button onClick={onClose} variant="default">Annulla</Button>
        <Button type="submit">Conferma</Button>
      </Group>
    </form>
  )
}

export function openBookAddModal() {
  const modalId = modals.open({
    title: 'Aggiungi Libro',
    size: 'lg',
    children: <BookAddFormContent onClose={() => modals.close(modalId)} />,
  })
}
