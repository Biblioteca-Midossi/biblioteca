import { Divider, Drawer, Stack, Text, UnstyledButton } from '@mantine/core'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@local/hooks/authContext'

interface CustomDrawerProps {
  opened: boolean
  onClose: () => void
}

export function CustomDrawer({ opened, onClose }: CustomDrawerProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const pathname = useLocation({ select: (location) => location.pathname })

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="left"
      size="45%"
      overlayProps={{ backgroundOpacity: 0.05 }}
      withCloseButton={false}
    >
      <Stack gap={0}>
        <UnstyledButton
          p="sm"
          onClick={() => {
            onClose()
            navigate({ to: '/' })
          }}
        >
          <Text>
            {pathname.endsWith('/')
              ? 'Home'
              : 'Torna alla Home'}
          </Text>
        </UnstyledButton>
        <Divider />
        {user && user.ruolo >= 3 && (
          <UnstyledButton
            p="sm"
            onClick={() => {
              onClose()
              navigate({ to: '/dashboard' })
            }}
          >
            <Text>Inserimento libri</Text>
          </UnstyledButton>
        )}
        <UnstyledButton
          p="sm"
          onClick={() => {
            onClose()
            navigate({ to: '/register' })
          }}
        >
          <Text>Registrati</Text>
        </UnstyledButton>
      </Stack>
    </Drawer>
  )
}
