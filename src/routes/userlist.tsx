import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem, Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField
} from '@mui/material'
import api from '@local/hooks/api'
import { UserRole } from "@local/types/User"
import { ProtectedPage } from '@local/components/ProtectedPage'
import type { User } from "@local/types/User"
import type { SetStateAction } from 'react'

function UserList() {
  const [users, setUsers] = useState<Array<User>>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [page, setPage] = useState<number>(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalUsers, setTotalUsers] = useState(0)
  const [editDialog, setEditDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const roleOptions = Object.entries(UserRole)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({
      id: value,
      name: key
    }))

  async function fetchUsers() {
    try {
      setLoading(true)
      const response = await api.get(
        `/users/get-users?offset=${page * rowsPerPage}&limit=${rowsPerPage}`
      )
      setUsers(response.data.users)
      setTotalUsers(response.data.total)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: any) => {
    setEditingUser(user)
    setEditDialog(true)
  }

  const handleSave = async () => {
    try {
      await api.put(`/users/update-user/${editingUser!.id_utente}`,
        {
          'user_data': editingUser
        }).then((response) => {
          if (response.status === 200) {
            alert(response.data.message)
          }
        }).catch((error) => {
          console.error(error)
          alert(`Request failed with status code ${error.response.data.detail}`)
        })
      setEditDialog(false)
      void fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleChange = (field: keyof User, value: string | number | null) => {
    if (editingUser) {
      setEditingUser((prev) => {
        if (!prev) return null
        return {
          ...prev,
          [field]: value
        }
      })
    }
  }

  useEffect(() => {
    void fetchUsers()
  }, [page, rowsPerPage])

  function handleChangePage(_event: any, newPage: SetStateAction<number>) {
    setPage(newPage)
  }

  function handleChangeRowsPerPage(event: { target: { value: string } }) {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  if (loading) {
    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </>
    )
  }

  return (
    <>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user: User) => (
                <TableRow key={user.id_utente}>
                  <TableCell>{user.id_utente}</TableCell>
                  <TableCell>{`${user.nome} ${user.cognome}`}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.ruolo}</TableCell>
                  <TableCell>
                    <Button variant={'outlined'} onClick={() => handleEdit(user)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalUsers}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="First Name"
              value={editingUser?.nome || ''}
              onChange={(e) => handleChange('nome', e.target.value)}
            />
            <TextField
              label="Last Name"
              value={editingUser?.cognome || ''}
              onChange={(e) => handleChange('cognome', e.target.value)}
            />
            <TextField
              label="Email"
              value={editingUser?.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
            />
            <FormControl>
              <InputLabel>Role</InputLabel>
              <Select
                value={editingUser?.ruolo || ''}
                onChange={(e) => handleChange('ruolo', e.target.value)}
              >
                {roleOptions.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {`${role.name} (${role.id})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export const Route = createFileRoute('/userlist')({
  component: () => (
    <ProtectedPage levelOfProtection={3}>
      <UserList />
    </ProtectedPage>
  ),
})




