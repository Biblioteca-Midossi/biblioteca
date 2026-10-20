import { BookGridDashboard } from '@local/components/BookGrid/BookGridDashboard'
import { openBookAddModal } from '@local/components/BookModals'
import { ProtectedPage } from '@local/components/ProtectedPage'
import { StatCard } from '@local/components/StatCard'
import { UserCard } from '@local/components/UserCard'
import { useRecentBooks } from '@local/hooks/books'
import { useRecentUsers } from '@local/hooks/users'
import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Group,
  Image,
  SimpleGrid,
  Skeleton,
  Text,
  Title,
} from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: () => (
    <ProtectedPage permissions={['view_dashboard']}>
      <Dashboard />
    </ProtectedPage>
  ),
})

function Dashboard() {
  const recentBooksQuery = useRecentBooks(5)
  const recentUsersQuery = useRecentUsers(5)

  const recentBooks = recentBooksQuery.data ?? []
  const newUsers = recentUsersQuery.data ?? []
  const loading = recentBooksQuery.isPending || recentUsersQuery.isPending
  const stats = { total_books: 0, total_users: 0 }

  return (
    <Box className="flex flex-col items-center w-full py-4">
      <Container fluid className="max-w-full px-8">
        <Box mb="xl">
          <Title order={2} fw={600}>
            Dashboard
          </Title>
          <Text size="sm" c="dimmed">
            Overview of your library management system
          </Text>
        </Box>

        {(recentBooksQuery.isError || recentUsersQuery.isError) && (
          <Alert color="red" mb="md">
            Impossibile caricare i dati della dashboard
          </Alert>
        )}

        <SimpleGrid cols={{ base: 2, sm: 2, md: 4 }} spacing="md" mb="xl">
          <StatCard loading={loading} title="Total Books" value={stats.total_books} />
          <StatCard loading={loading} title="Total Users" value={stats.total_users} />
          <StatCard loading={loading} title="Recent Books" value={recentBooks.length} />
          <StatCard loading={loading} title="New Users" value={newUsers.length} />
        </SimpleGrid>

        <Box mb="xl">
          <Group align="center" mb="xs">
            <Title order={4} fw={600}>
              Recently Added Books
            </Title>
            <Button leftSection={<IconPlus size={16} />} onClick={openBookAddModal}>
              New Book
            </Button>
          </Group>
          <SimpleGrid cols={{ base: 3, sm: 3, md: 6, lg: 8 }} spacing="md">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <Skeleton height={200} />
                  <Box mt="sm">
                    <Skeleton height={16} width="80%" />
                    <Skeleton height={14} width="60%" mt={4} />
                  </Box>
                </Card>
              ))
            ) : recentBooks.length > 0 ? (
              recentBooks.map((book) => (
                <Card key={book.id} className="h-full flex flex-col">
                  {book.coverUrl && (
                    <Card.Section>
                      <Image
                        className="aspect-1/1.5 cursor-pointer"
                        src={book.coverUrl}
                        alt={book.titolo}
                        height={200}
                      />
                    </Card.Section>
                  )}
                  <Box mt="sm" className="grow">
                    <Text size="sm" fw={600} truncate>
                      {book.titolo}
                    </Text>
                    {book.autori && (
                      <Text size="xs" c="dimmed">
                        {Array.isArray(book.autori) ? book.autori.join(', ') : book.autori}
                      </Text>
                    )}
                  </Box>
                </Card>
              ))
            ) : (
              <Text c="dimmed">No books added yet</Text>
            )}
          </SimpleGrid>
        </Box>

        <Box mb="xl">
          <Title order={4} mb="sm" fw={600}>
            New Users
          </Title>
          <SimpleGrid cols={{ base: 2, sm: 2, md: 3, lg: 4 }} spacing="md">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <Group gap="sm" align="center">
                    <Skeleton circle />
                    <Box className="flex-1">
                      <Skeleton height={14} width="80%" />
                      <Skeleton height={12} width="60%" mt={4} />
                    </Box>
                  </Group>
                </Card>
              ))
            ) : newUsers.length > 0 ? (
              newUsers.map((user) => <UserCard key={user.id} user={user} />)
            ) : (
              <Text c="dimmed">No new users yet</Text>
            )}
          </SimpleGrid>
        </Box>

        <Box mt="xl">
          <Title order={4} mb="sm" fw={600}>
            All Books
          </Title>
          <BookGridDashboard />
        </Box>
      </Container>
    </Box>
  )
}
