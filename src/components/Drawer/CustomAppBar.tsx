import { AppBar, Avatar, Grid, IconButton, Link, Toolbar } from "@mui/material"
import { HomeRounded, MenuRounded } from "@mui/icons-material"
import { DarkModeSwitch } from "@local/components/Switches/DarkModeSwitch"
import { useTheme } from '@mui/material/styles'
import { useState } from "react"
import { useAuth } from "@local/contexts/AuthContext"
import { useNavigate } from "@tanstack/react-router"
import { AvatarMenu } from "@local/components/Drawer/AvatarMenu"
import type { MouseEvent } from "react"

interface CustomAppBarProps {
  handleDrawerToggle: () => void
}

export function CustomAppBar({ handleDrawerToggle }: CustomAppBarProps) {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  function handleOpen(event: MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget)
  }

  return (
    <>
      <AppBar>
        <Toolbar
          sx={{
            backgroundColor: theme.palette.mode === 'dark' ? 'midossiblue.dark' : 'midossiblue.main',
            display: 'flex',
          }}
        >
          <Grid
            container
            sx={{
              flexGrow: 1,
              alignItems: 'center',
              justifyContent: 'space-evenly' // Align items with space between them
            }}
          >
            <Grid
              size={4}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                paddingLeft: '1rem'
              }}
            >
              <IconButton
                onClick={handleDrawerToggle}
                sx={{
                  padding: 1,
                  color: 'white'
                }}
              >
                <MenuRounded />
              </IconButton>
              <IconButton
                sx={{
                  padding: 1,
                  color: 'white'
                }}
               onClick={() => {
                 navigate({ to: '/' })
               }}
               >
                 <HomeRounded />
              </IconButton>
            </Grid>

            <Grid
              size={4}
              sx={{
                display: 'flex',
                placeContent: 'center',
              }}
            >
              <Link href={'https://midossi.edu.it'}>
                <Avatar
                  variant={'circular'}
                  alt={'Midossi Logo'}
                  src={'/assets/logos/midossi.png'}
                  sx={{
                    height: '50px',
                    width: '50px',
                  }}
                />
              </Link>
            </Grid>

            <Grid
              size={4}
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                '& .MuiIconButton-root': {
                  aspectRatio: '1',
                },
                alignItems: 'center',
                paddingRight: '1rem',
              }}
            >
              <DarkModeSwitch />

              <IconButton
                onClick={handleOpen}
                size={'small'}
                aria-controls={anchorEl ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={anchorEl ? 'true' : undefined}
              >
                <Avatar sx={{ color: 'white' }}>{user?.username.charAt(0).toUpperCase()}</Avatar>
              </IconButton>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>

      <AvatarMenu anchorEl={anchorEl} setAnchorEl={setAnchorEl} user={user}/>
    </>
  )
}