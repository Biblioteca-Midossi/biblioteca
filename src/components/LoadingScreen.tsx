import { Box, CircularProgress, Typography } from '@mui/material'

export function LoadingScreen() {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
        <Typography
          variant="h6"
          sx={{
            marginTop: '1rem'
          }}
        >
          Loading...
        </Typography>
      </Box>
    </>
  )
}
