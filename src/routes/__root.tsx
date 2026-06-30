import { AppShell, MantineProvider } from '@mantine/core'
import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { Suspense } from 'react'
import { LoadingScreen } from '@local/components/LoadingScreen'
import { api, setActiveSession } from '@local/hooks/api'
import theme from '@local/theme'
import { Header } from '@local/components/Drawer/Header'
import { NotFoundPage } from "@local/routes/-404"
import { ErrorPage } from "@local/routes/-error"
import { Notifications } from "@mantine/notifications"
import { ModalsProvider } from "@mantine/modals"
import type { ReactNode } from 'react'
import type { AuthState } from '@local/hooks/authContext'

export const Route = createRootRouteWithContext<{ auth: AuthState }>()({
  head: () => ({
    meta: [
      {
        name: 'description',
        content: 'Biblioteca digitale per IIS U. Midossi'
      },
      {
        title: 'Biblioteca Midossi'
      }
    ],
    links: [
      {
        rel: 'icon',
        href: '/assets/logos/midossi.png'
      },
    ]
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

  notFoundComponent: () => <NotFoundPage/>,

  errorComponent: ({ error }) => (
    <ErrorPage error={error}/>
  ),

  shellComponent: (shell) => (
    <RootLayout children={shell.children} />
  ),
})

function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <HeadContent />
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <ModalsProvider>
          <Notifications/>
          <AppShell header={{ height: 56 }}>
            <AppShell.Header>
              <Header />
            </AppShell.Header>

            <AppShell.Main>
              <Suspense fallback={<LoadingScreen />}>
                {children}
              </Suspense>
            </AppShell.Main>
          </AppShell>
        </ModalsProvider>
      </MantineProvider>
      <Scripts />
    </>
  )
}
