// import React from 'react'
import ReactDOM from 'react-dom/client'
import { StrictMode } from "react"
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'
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
      <InitColorSchemeScript defaultMode="system" attribute="data-mui-color-scheme" />
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
