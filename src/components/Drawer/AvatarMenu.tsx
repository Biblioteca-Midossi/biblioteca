import { Avatar, Container, Divider, ListItemIcon, Menu, MenuItem } from "@mui/material"
import { Book, LoginRounded, Logout, People, Settings } from "@mui/icons-material"
import { useTheme } from '@mui/material/styles'
import { useAuth } from '@local/contexts/AuthContext'
import { useNavigate } from "@tanstack/react-router"
import type { User } from "@local/types/User"

interface AvatarMenuProps {
  anchorEl: HTMLElement | null
  setAnchorEl: (value: HTMLElement | null) => void
  user: User | null
}

export function AvatarMenu({ anchorEl, setAnchorEl, user }: AvatarMenuProps) {
  const theme = useTheme()
  const { logout } = useAuth()
  const navigate = useNavigate()


  function handleClose() {
    setAnchorEl(null)
  }

  return (
    <Menu
      anchorEl={anchorEl}
      id="account-menu"
      open={!!anchorEl}
      onClose={handleClose}
      onClick={handleClose}
      slotProps={{
        paper: {
          elevation: 4,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            bgcolor: theme.palette.mode === 'dark' ? 'graphiteblack.main' : 'background.paper',
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {user ? (
        <Container>
        <MenuItem
          onClick={() => {
            handleClose()
            navigate({ to: `/users/me` })
          }}
        >
          <Avatar />
          My account
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleClose()
            navigate({ to: `/dashboard` })
          }}
        >
          <ListItemIcon>
            <Book fontSize="small"/>
          </ListItemIcon>
          Dashboard
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose()
            navigate({ to: `/userlist` })
          }}
        >
          <ListItemIcon>
            <People fontSize="small"/>
          </ListItemIcon>
          User list
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={async () => {
          handleClose()
          await logout()
          navigate({ to: `/` })}}
        >
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
        </Container>
      )
      :
      (
        <Container>
        <MenuItem onClick={() => {navigate({ to: '/login' })}}>
          <ListItemIcon>
            <LoginRounded/>
          </ListItemIcon>
           Login
        </MenuItem>
        </Container>
      )}
    </Menu>
  )
}