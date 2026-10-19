import '@local/index.css'
import '@mantine/core/styles.layer.css'
import '@mantine/notifications/styles.layer.css'
import 'mantine-datatable/styles.layer.css'
import '@fontsource/varela-round/400.css'
import { api, setLogoutCallback } from '@local/hooks/api'
import { defaultAuthState } from '@local/hooks/authContext'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { routeTree } from './routeTree.gen'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  context: {
    auth: defaultAuthState,
  },
})

setLogoutCallback(async () => {
  await api.post('/auth/logout').catch((err) => {
    console.log('setLogoutCallback error:', err)
  })
  router.invalidate()
})

const appElement = document.getElementById('app')
if (appElement && !appElement.innerHTML) {
  const app = ReactDOM.createRoot(appElement)
  app.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  )
}
