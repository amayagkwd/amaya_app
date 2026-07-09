import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      includeAssets: ['favicon.svg', '192.png', '512.png'],
      manifest: {
        name: 'Tracker',
        short_name: 'Tracker',
        description: 'Tracker - Your personal finance and productivity app',
        start_url: '/',
        scope: '/',
        theme_color: '#4f46e5',
        background_color: '#f9f9f7',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.openweathermap\.org\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'weather-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 3600
              }
            }
          }
        ]
      }
    })
  ]
})
