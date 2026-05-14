import { createFileRoute } from '@tanstack/react-router'
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from '@mui/material'
import { useAuth } from '@local/contexts/AuthContext'
import { InputForm } from "@local/components/InputForm"
import { BookGridDashboard } from "@local/components/BookGrid/BookGridDashboard"
import { ProtectedPage } from '@local/components/ProtectedPage'

export const Route = createFileRoute('/dashboard')({
  component: () => (
    <ProtectedPage levelOfProtection={3}>
      <Dashboard />
    </ProtectedPage>
  ),
})

function Dashboard() {

  const { user, logout } = useAuth()

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          minHeight: "100vh", // Ensure full height centering
          marginX: "auto",
          '& .MuiContainer-root': { maxWidth: '100%' }
        }}
      >
        <Container sx={{
          maxWidth: "100%",
          paddingX: { xs: 2, sm: 4 },
          '& .MuiGrid-root:last-of-type': {
            marginX: 'auto',
          }
        }}>
          <AppBar
            position="static"
            sx={{
              borderRadius: ".25rem",
              width: { xs: "100%", sm: "70%" },
              marginX: "auto",
              marginY: "1rem"
            }}
          >
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Welcome {user?.username}
              </Typography>
              <Button
                color="inherit"
                sx={{ backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                onClick={logout}
              >
                Logout
              </Button>
            </Toolbar>
          </AppBar>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center", // Center everything else
              width: "100%",
            }}
          >
            <Box sx={{ marginX: '15%', placeSelf: "flex-start" }}>
              <Typography
                variant="h4"
                sx={{ marginY: '.5rem', width: "100%" }} // Align "Manage Books" to the start
              >
                Manage Books
              </Typography>
            </Box>
            {/* make this responsive using limit or cuurentBreakpoint*/}
            <Box sx={{ width: "80%" }}><InputForm /></Box>
          </Box>

          <BookGridDashboard/>
        </Container>
      </Box>
    </>
  )
}
