import { createFileRoute } from '@tanstack/react-router'
import {
  Alert,
  Box, Button,
  Card,
  Container,
  Group,
  Image,
  SimpleGrid,
  Skeleton,
  Text,
  Title,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useEffect, useState } from 'react'
import { openBookAddModal } from '@local/components/BookInputForm'
import { BookGridDashboard } from '@local/components/BookGrid/BookGridDashboard'
import { ProtectedPage } from '@local/components/ProtectedPage'
import { api } from '@local/hooks/api'
import { IconPlus } from "@tabler/icons-react"
import { UserCard } from "@local/components/UserCard"
import { StatCard } from "@local/components/StatCard"
import type { Book } from '@local/types/book'
import type { User } from '@local/types/user'

export const Route = createFileRoute('/dashboard')({
  component: () => (
    <ProtectedPage levelOfProtection={3}>
      <Dashboard />
    </ProtectedPage>
  ),
})

function Dashboard() {
  const [recentBooks, setRecentBooks] = useState<Array<Partial<Book>>>([])
  const [newUsers, setNewUsers] = useState<Array<Partial<User>>>([])
  const [stats] = useState({ total_books: 0, total_users: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [booksRes, usersRes] = await Promise.all([
          api.get('/books/recent?limit=5'),
          api.get('/users/recent?limit=5'),
        ])

        setRecentBooks(booksRes.data?.books || [])
        setNewUsers(usersRes.data?.users || [])
      } catch (err: any) {
        notifications.show({
          title: 'Errore',
          message: err?.message || 'Impossibile caricare i dati della dashboard',
          color: 'red',
        })
        setError(err?.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
  }, [])

  function handleCreateBook() {
    openBookAddModal()
  }

  return (
    <Box className="flex flex-col items-center w-full py-4">
      <Container fluid className="max-w-full px-8">
        <Box mb="xl">
          <Title order={2} fw={600}>Dashboard</Title>
          <Text size="sm" c="dimmed">Overview of your library management system</Text>
        </Box>

        {error && <Alert color="red" mb="md">{error}</Alert>}

        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md" mb="xl">
          <StatCard loading={loading} title="Total Books" value={stats.total_books} />
          <StatCard loading={loading} title="Total Users" value={stats.total_users} />
          <StatCard loading={loading} title="Recent Books" value={recentBooks.length} />
          <StatCard loading={loading} title="New Users" value={newUsers.length} />
        </SimpleGrid>

        <Box mb="xl">
          <Group align="center">
            <Title order={4} fw={600}>Recently Added Books</Title>
            <Button leftSection={<IconPlus size={16} />} onClick={handleCreateBook}>
              New Book
            </Button>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
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
                      <Image src={book.coverUrl} alt={book.titolo} height={200} />
                    </Card.Section>
                  )}
                  <Box mt="sm" className="grow">
                    <Text size="sm" fw={600} truncate>{book.titolo}</Text>
                    {book.autori && <Text size="xs" c="dimmed">{book.autori instanceof Array ? book.autori.join(', ') : book.autori}</Text>}
                  </Box>
                </Card>
              ))
            ) : (
              <Text c="dimmed">No books added yet</Text>
            )}
          </SimpleGrid>
        </Box>

        <Box mb="xl">
          <Title order={4} mb="sm" fw={600}>New Users</Title>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
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
              newUsers.map((user) => (
                <UserCard user={user}/>
              ))
            ) : (
              <Text c="dimmed">No new users yet</Text>
            )}
          </SimpleGrid>
        </Box>

        <Box mt="xl">
          <Title order={4} mb="sm" fw={600}>All Books</Title>
          <BookGridDashboard />
        </Box>
      </Container>
    </Box>
  )
}
