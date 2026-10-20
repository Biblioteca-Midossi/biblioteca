import { authApi } from '@local/hooks/api'
import { useAuth } from '@local/hooks/authContext'
import { Button, Container, Paper, Stack, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/login')({
  component: Login,
})

function Login() {
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
  })

  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      notifications.show({
        title: 'Già autenticato',
        message: 'Sei già loggato. Reindirizzamento alla home.',
        color: 'blue',
      })
      navigate({ to: '/' })
    }
  }, [])

  async function handleSubmit(values: { username: string; password: string }) {
    try {
      await authApi.login({ login: values.username, password: values.password })
      navigate({ to: '/' })
    } catch {
      notifications.show({
        title: 'Errore di accesso',
        message: 'Credenziali non valide. Riprova.',
        color: 'red',
      })
    }
  }

  return (
    <Container size="xs" mt="5.5rem">
      <Paper shadow="sm" p="md">
        <Title order={2}>Login</Title>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="sm" mt="sm">
            <TextInput required label="Username" autoFocus {...form.getInputProps('username')} />
            <TextInput
              required
              label="Password"
              type="password"
              {...form.getInputProps('password')}
            />
            <Button type="submit" fullWidth>
              Login
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  )
}
