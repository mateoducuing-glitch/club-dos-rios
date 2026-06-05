import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png'],
      manifest: {
        name: 'Club Dos Ríos',
        short_name: 'Dos Ríos',
        description: 'Sumá puntos con cada compra en Dos Ríos Carnicería',
        theme_color: '#1a3a2a',
        background_color: '#f8f4ef',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'logo192.png', sizes: '192x192', type: 'image/png' },
          { src: 'logo512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'supabase-cache', expiration: { maxEntries: 50 } }
          }
        ]
      }
    })
  ],
  server: {
    port: 5174,
    host: true,
    proxy: {
      '/api': { target: 'http://localhost:3002', changeOrigin: true }
    }
  }
})
