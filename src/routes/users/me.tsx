import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  Avatar,
  Badge,
  Card,
  Container,
  Divider,
  Grid,
  Group,
  Text,
  Title,
} from '@mantine/core'
import { IconBriefcase, IconMail } from '@tabler/icons-react'
import { IstitutoEnum, UserRole } from '@local/types/user'
import { ProtectedPage } from '@local/components/ProtectedPage'
import { useAuth } from '@local/hooks/authContext'

function SelfUserPage() {
  const { user } = useAuth()

  if (!user) throw redirect({ to: "/login" })

  return (
    <Container size="md" mt="md">
      <Card withBorder shadow="sm" p="lg">
        <Grid align="center">
          <Grid.Col span={{ base: 12, md: 6 }} className="flex justify-center">
            <Avatar
              key={`${user.nome} ${user.cognome}`}
              name={`${user.nome} ${user.cognome}`}
              color="initials"
              size={120}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Title order={2}>{user.username}</Title>
            <Text size="sm" mb="xs">{user.nome} {user.cognome}</Text>

            <Grid mt="sm">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Group gap="xs" align="center">
                  <IconMail color="var(--mantine-color-blue-6)" size={18} />
                  <Text size="sm">{user.email}</Text>
                </Group>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Group gap="xs" align="center">
                  <IconBriefcase color="var(--mantine-color-blue-6)" size={18} />
                  <Badge
                    variant="outline"
                    color="blue"
                  >
                    {
                      user.ruolo in UserRole
                        ? UserRole[user.ruolo]
                        : 'Ruolo Sconosciuto'
                    }
                  </Badge>
                </Group>
              </Grid.Col>
            </Grid>
          </Grid.Col>
        </Grid>

        <Divider my="lg" />

        <Title order={4}>Institution Details</Title>
        <Text size="sm">
          Istituto: {
            user.id_istituto in IstitutoEnum
              ? IstitutoEnum[user.id_istituto]
              : 'Non specificato'
          }
        </Text>
      </Card>
    </Container>
  )
}

export const Route = createFileRoute('/users/me')({
  component: () => (
    <ProtectedPage levelOfProtection={1}>
      <SelfUserPage />
    </ProtectedPage>
  ),
})
