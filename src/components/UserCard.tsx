import type { UserListItem } from '@local/api'
import { Avatar, Box, Card, Group, Text } from '@mantine/core'

interface UserCardProps {
  user: UserListItem
}

export function UserCard({ user }: UserCardProps) {
  return (
    <Card key={user.id} withBorder shadow="sm">
      <Group gap="sm" align="center">
        <Avatar
          key={`${user.nome} ${user.cognome}`}
          name={`${user.nome} ${user.cognome}`}
          color="initials"
          size={50}
        />
        <Box key={user.id}>
          <Text size="sm" fw={600}>
            {user.nome} {user.cognome}
          </Text>
          <Text size="xs" c="dimmed">
            @{user.username}
          </Text>
        </Box>
      </Group>
    </Card>
  )
}
