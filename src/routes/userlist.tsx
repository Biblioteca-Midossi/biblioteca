import type { UpdateUserData, UserListItem } from '@local/api'
import { ProtectedPage } from '@local/components/ProtectedPage'
import { updateUser, useUserlist } from '@local/hooks/useUserlist'
import { Box, Button, Group, Select, Stack, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { createFileRoute } from '@tanstack/react-router'
import { DataTable } from 'mantine-datatable'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/userlist')({
  component: () => (
    <ProtectedPage permissions={['view_users', 'edit_user']}>
      <UserList />
    </ProtectedPage>
  ),
})

interface RoleOption {
  value: string
  label: string
}

function useRoles() {
  const [roles, setRoles] = useState<Array<RoleOption>>([])

  useEffect(() => {
    // Hardcoded roles matching DB seed. Replace with API call later.
    setRoles([
      { value: '1', label: 'Amministratore' },
      { value: '2', label: 'Bibliotecario' },
      { value: '3', label: 'Utente' },
    ])
  }, [])

  return roles
}

interface EditUserFormProps {
  user: UserListItem
  onSaved: () => void
}

function EditUserForm({ user, onSaved }: EditUserFormProps) {
  const roleOptions = useRoles()

  const form = useForm({
    initialValues: {
      nome: user.nome,
      cognome: user.cognome,
      email: user.email,
      ruolo: user.roleId,
    },
  })

  async function handleSave() {
    const updatedUser: UpdateUserData = {
      nome: form.values.nome,
      cognome: form.values.cognome,
      email: form.values.email,
      ruolo: Number(form.values.ruolo),
    }
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
          onChange={(val) => form.setFieldValue('ruolo', val != null ? Number(val) : 3)}
        />
      </Stack>
      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={() => modals.closeAll()}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </Group>
    </>
  )
}

function UserList() {
  const [page, setPage] = useState<number>(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const { users, loading, totalUsers, refetch } = useUserlist(page - 1, rowsPerPage)

  function handleEdit(user: UserListItem) {
    modals.open({
      title: (
        <Text>
          Editing <code>{user.username}</code> (ID {user.id})
        </Text>
      ),
      centered: true,
      children: <EditUserForm user={user} onSaved={refetch} />,
    })
  }

  const columns = [
    { accessor: 'id', title: 'ID' },
    {
      accessor: 'nome',
      title: 'Name',
      render: (user: UserListItem) => `${user.nome} ${user.cognome}`,
    },
    { accessor: 'username', title: 'Username' },
    { accessor: 'email', title: 'Email' },
    {
      accessor: 'roleName',
      title: 'Role',
      render: (user: UserListItem) => user.roleName,
    },
    {
      accessor: 'actions',
      title: 'Actions',
      render: (user: UserListItem) => (
        <Button variant="outline" size="xs" onClick={() => handleEdit(user)}>
          Edit
        </Button>
      ),
    },
  ]

  return (
    <Box className="p-4">
      <DataTable
        withTableBorder
        borderRadius="sm"
        shadow="sm"
        columns={columns}
        records={users}
        fetching={loading}
        page={page}
        onPageChange={setPage}
        totalRecords={totalUsers}
        recordsPerPage={rowsPerPage}
        onRecordsPerPageChange={(val) => {
          setRowsPerPage(val)
          setPage(1)
        }}
        recordsPerPageOptions={[5, 10, 25, 50]}
        recordsPerPageLabel="Rows per page"
        highlightOnHover
        striped
        noRecordsText="No users found"
      />
    </Box>
  )
}
