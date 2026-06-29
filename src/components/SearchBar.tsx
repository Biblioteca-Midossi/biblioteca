import { Box, Card, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import type { ChangeEvent, KeyboardEvent } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const form = useForm({
    initialValues: { query: '' },
  })

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.currentTarget.value
    form.setFieldValue('query', value)
    onSearch(value)
  }

  return (
    <Card padding="sm" pos="sticky" w="70%">
      <TextInput
        value={form.values.query}
        onChange={handleInputChange}
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === 'Enter') {
            onSearch(form.values.query)
          }
        }}
        placeholder="Cerca per titolo, o parola chiave"
      />
    </Card>
  )
}
