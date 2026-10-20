import { Istituto } from '@local/api'
import { useRegister } from '@local/hooks/useRegister'
import { Button, Container, Paper, Select, Stack, TextInput, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/register')({
  component: Register,
})

function Register() {
  const { form, handleSubmit } = useRegister()

  return (
    <Container size="xs" className="mt-20">
      <Paper shadow="sm" p="md">
        <Title order={2}>Registrati</Title>
        <form onSubmit={handleSubmit}>
          <Stack gap="sm" mt="sm">
            <TextInput required label="Nome" {...form.getInputProps('nome')} />
            <TextInput required label="Cognome" {...form.getInputProps('cognome')} />
            <TextInput required label="Username" {...form.getInputProps('username')} />
            <TextInput required label="Email" type="email" {...form.getInputProps('email')} />
            <TextInput
              required
              label="Password"
              type="password"
              {...form.getInputProps('password')}
            />
            <Select
              required
              label="Istituto"
              data={Object.values(Istituto)}
              {...form.getInputProps('istituto')}
            />
            <Button type="submit" fullWidth>
              Registrati
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  )
}
