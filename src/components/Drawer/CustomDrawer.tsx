import { Divider, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material'
import { useAuth } from '@local/contexts/AuthContext'
import { useNavigate } from "@tanstack/react-router"

interface CustomDrawerProps {
  isOpen: boolean
  handleDrawerToggle: () => void
}

export function CustomDrawer({ isOpen, handleDrawerToggle }: CustomDrawerProps) {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={handleDrawerToggle}
      sx={{
        '& .MuiDrawer-paper': {
          width: '45%',
          opacity: '95%'
        }
      }}
    >
      <List disablePadding>
        <ListItem>
          <ListItemButton
            onClick={() => {
              handleDrawerToggle()
              navigate({ to: '/' })
            }}
          >
            <ListItemText
              primary={
                window.location.toString().endsWith('/') || window.location.toString().endsWith('/home')
                  ? 'Home'
                  : 'Torna alla Home'
              }
            />
          </ListItemButton>
        </ListItem>
        <Divider />
        {user && user.ruolo >= 3 && (
          <ListItem>
            <ListItemButton
              onClick={() => {
                handleDrawerToggle()
                navigate({ to: '/dashboard' })
              }}
            >
              <ListItemText primary="Inserimento libri" />
            </ListItemButton>
          </ListItem>
        )}
        <ListItem sx={{ bottom: 0 }}>
          <ListItemButton
            onClick={() => {
              handleDrawerToggle()
              navigate({ to: '/register' })
            }}
          >
            <ListItemText primary="Registrati" />
          </ListItemButton>
        </ListItem>

      </List>
    </Drawer>
  )
}
