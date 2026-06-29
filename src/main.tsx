import '@local/index.css'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@fontsource/varela-round/400.css'
import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
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
