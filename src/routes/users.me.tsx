import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  Avatar,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Typography
} from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import WorkIcon from '@mui/icons-material/Work'
import { Istituto, UserRole } from "@local/types/User"
import { fetchUserMe } from "@local/hooks/useUserProfiles"
import { ProtectedPage } from '@local/components/ProtectedPage'
import type { User } from "@local/types/User"

function SelfUserPage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function fetchUser() {
      setUser(await fetchUserMe())
    }

    void fetchUser()
  }, [])

  return (
    <>
    <Container maxWidth="md">
      <Card elevation={3}>
        <CardContent>
          <Grid container spacing={3} sx={{ alignItems: 'center' }} >
            <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  margin: 'auto',
                  bgcolor: 'primary.main'
                }}
              >
                {user?.nome[0]}{user?.cognome[0]}
              </Avatar>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="h4" gutterBottom>
                {user?.username}
              </Typography>
              <Typography variant="body2" gutterBottom>{user?.nome} {user?.cognome}</Typography>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Grid container spacing={1} sx={{ alignItems: 'center' }}>
                    <Grid>
                      <EmailIcon color="primary" />
                    </Grid>
                    <Grid>
                      <Typography>{user?.email}</Typography>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Grid container spacing={1} sx={{ alignItems: 'center' }}>
                    <Grid>
                      <WorkIcon color="primary" />
                    </Grid>
                    <Grid>
                      <Chip
                        label={user?.ruolo != null && user.ruolo in UserRole
                          ? UserRole[user.ruolo]
                          : 'Ruolo Sconosciuto'
                        }
                        color="primary"
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Institution Details
          </Typography>
          <Typography>
            Istituto: {user?.id_istituto != null && user.id_istituto in Istituto
              ? Istituto[user.id_istituto]
              : 'Non specificato'
            }
          </Typography>
        </CardContent>
      </Card>
    </Container>
    </>
  )
}

export const Route = createFileRoute('/users/me')({
  component: () => (
    <ProtectedPage levelOfProtection={1}>
      <SelfUserPage />
    </ProtectedPage>
  ),
})




