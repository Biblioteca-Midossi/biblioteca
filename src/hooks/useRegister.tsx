import { register } from '@local/hooks/auth'
import { useAuth } from '@local/hooks/authContext'
import { Button, Group, Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export function useRegister() {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      modals.open({
        modalId: 'already-logged-in',
        title: 'Sei già loggato',
        centered: true,
        children: (
          <>
            <Text size="sm">Verrai reindirizzato alla home.</Text>
            <Group justify="flex-end" mt="md">
              <Button
                onClick={() => {
                  modals.closeAll()
                  navigate({ to: '/' })
                }}
              >
                OK
              </Button>
            </Group>
          </>
        ),
      })
    }
  }, [user])

  const form = useForm({
    initialValues: {
      nome: '',
      cognome: '',
      username: '',
      email: '',
      password: '',
      istituto: '',
    },
  })

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      const result = await register(values)
      if (result.includes('successful-request')) {
        navigate({ to: '/login' })
      }
    } catch (_error) {
      /* handled by auth.ts notification */
    }
  })

  return { form, handleSubmit }
}
