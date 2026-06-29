import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { updateUser, useUserlist } from '@local/hooks/useUserlist'
import { ProtectedPage } from '@local/components/ProtectedPage'
import { UserRole } from '@local/types/user'
import type { User } from '@local/types/user'

export const Route = createFileRoute('/userlist')({
  component: () => (
    <ProtectedPage levelOfProtection={3}>
      <UserList />
    </ProtectedPage>
  ),
})

const roleOptions = Object.entries(UserRole)
  .filter(([key]) => isNaN(Number(key)))
  .map(([key, value]) => ({
    value: String(value),
    label: `${key} (${value})`
  }))

interface EditUserFormProps {
  user: User
  onSaved: () => void
}

function EditUserForm({ user, onSaved }: EditUserFormProps) {
  const form = useForm({
    initialValues: {
      nome: user.nome,
      cognome: user.cognome,
      email: user.email,
      ruolo: user.ruolo,
    },
  })

  async function handleSave() {
    const updatedUser = { ...user, ...form.values }
    const result = await updateUser(user.id, updatedUser)
    if (result.success) {
      modals.closeAll()
      onSaved()
    }
  }

  return (
    <>
      <Stack gap="sm">
        <TextInput label="First Name" {...form.getInputProps('nome')} />
        <TextInput label="Last Name" {...form.getInputProps('cognome')} />
        <TextInput label="Email" {...form.getInputProps('email')} />
        <Select
          label="Role"
          data={roleOptions}
          value={String(form.values.ruolo)}
          onChange={(val) => form.setFieldValue('ruolo', val != null ? Number(val) : 1)}
        />
      </Stack>
      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={() => modals.closeAll()}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </Group>
    </>
  )
}

function UserList() {
  const [page, setPage] = useState<number>(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const { users, loading, totalUsers, refetch } = useUserlist(page, rowsPerPage)

  const handleEdit = (user: User) => {
    modals.open({
      title: 'Edit User',
      centered: true,
      children: <EditUserForm user={user} onSaved={refetch} />,
    })
  }

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-w-96">
        <Loader size="lg" />
      </Box>
    )
  }

  return (
    <>
      <Paper className="w-full overflow-hidden">
        <Table stickyHeader>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Username</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user: User) => (
              <Table.Tr key={user.id}>
                <Table.Td>{user.id}</Table.Td>
                <Table.Td>{`${user.nome} ${user.cognome}`}</Table.Td>
                <Table.Td>{user.username}</Table.Td>
                <Table.Td>{user.email}</Table.Td>
                <Table.Td>{user.ruolo}</Table.Td>
                <Table.Td>
                  <Button variant="outline" size="xs" onClick={() => handleEdit(user)}>
                    Edit
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        <Group justify="space-between" p="sm">
          <Group gap="xs">
            <Text size="sm">Rows per page:</Text>
            <Select
              data={['5', '10', '25', '50'].map(String)}
              value={String(rowsPerPage)}
              onChange={(val) => {
                setRowsPerPage(parseInt(val || '10', 10))
                setPage(0)
              }}
              size="xs"
              className="w-16"
            />
          </Group>
          <Group gap="xs">
            <Button variant="subtle" size="xs" disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</Button>
            <Text size="sm">Page {page + 1} of {Math.ceil(totalUsers / rowsPerPage)}</Text>
            <Button variant="subtle" size="xs" disabled={page >= Math.ceil(totalUsers / rowsPerPage) - 1} onClick={() => setPage(page + 1)}>Next</Button>
          </Group>
        </Group>
      </Paper>
    </>
  )
}
