import { Header } from '@local/components/Drawer/Header'
import { LoadingScreen } from '@local/components/LoadingScreen'
import { api, setActiveSession } from '@local/hooks/api'
import type { AuthState } from '@local/hooks/authContext'
import { NotFoundPage } from '@local/routes/-404'
import { ErrorPage } from '@local/routes/-error'
import theme from '@local/theme'
import { AppShell, MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { createRootRouteWithContext, HeadContent, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Suspense } from 'react'

export const Route = createRootRouteWithContext<{ auth: AuthState }>()({
  head: () => ({
    meta: [
      {
        name: 'description',
        content: 'Biblioteca digitale per IIS U. Midossi',
      },
      {
        title: 'Biblioteca Midossi',
      },
    ],
    links: [
      {
        rel: 'icon',
        href: '/assets/logos/midossi.png',
      },
    ],
  }),

  beforeLoad: async () => {
    try {
      const { data } = await api.get('/users/me')
      console.debug(data)
      setActiveSession(true)
      return { auth: { user: data, loading: false } }
    } catch {
      setActiveSession(false)
      return { auth: { user: null, loading: false } }
    }
  },

  notFoundComponent: () => <NotFoundPage />,

  errorComponent: ({ error }) => <ErrorPage error={error} />,

  shellComponent: (shell) => <RootLayout children={shell.children} />,
})

function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <HeadContent />
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <ModalsProvider>
          <Notifications />
          <AppShell header={{ height: 56 }}>
            <AppShell.Header>
              <Header />
            </AppShell.Header>

            <AppShell.Main>
              <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
            </AppShell.Main>
          </AppShell>
        </ModalsProvider>
      </MantineProvider>
      <Scripts />
    </>
  )
}
