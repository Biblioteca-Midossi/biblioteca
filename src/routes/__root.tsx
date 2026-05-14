import '@fontsource/varela-round'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { createRootRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { AuthProvider } from '@local/contexts/AuthContext'
import { LoadingScreen } from '@local/components/LoadingScreen'
import { AppBarDrawer } from "@local/components/Drawer/AppBarDrawer"
import theme from '@local/theme'
import type { ReactNode } from 'react'

export const Route = createRootRoute({
  shellComponent: (shell) => (
    <AuthProvider>
      <RootLayout children={shell.children} />
    </AuthProvider>
  ),
})

function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ThemeProvider theme={theme} defaultMode="system" disableTransitionOnChange>
      <CssBaseline />
      <AppBarDrawer />
      <Suspense fallback={<LoadingScreen />}>
        {children}
      </Suspense>
    </ThemeProvider>
  )
}



