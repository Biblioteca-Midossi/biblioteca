import * as path from "path"
import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react-swc"
import tanstackRouter from "@tanstack/router-plugin/vite"

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@local': path.resolve(__dirname, './src'),
    }
  },

  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    react()
  ],

  // Developement server
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
})
