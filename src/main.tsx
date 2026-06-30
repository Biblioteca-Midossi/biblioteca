import '@local/index.css'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@fontsource/varela-round/400.css'
import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { defaultAuthState } from '@local/hooks/authContext'
import { api, setLogoutCallback } from '@local/hooks/api'
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
    console.log("setLogoutCallback error:", err)
  })
  router.invalidate()
})

const appElement = document.getElementById('app')!
if (!appElement.innerHTML) {
  const app = ReactDOM.createRoot(appElement)
  app.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
