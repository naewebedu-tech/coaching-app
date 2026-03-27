// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png', 'og-image.png'],
      manifest: {
        name: 'CoachingApp — Institute Manager',
        short_name: 'CoachingApp',
        description: 'Manage students, attendance, fees and exams',
        theme_color: '#4f46e5',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable any' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable any' },
        ],
        shortcuts: [
          { name: 'Attendance',  url: '/?view=attendance', icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }] },
          { name: 'Fees',        url: '/?view=fees',       icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }] },
          { name: 'Students',    url: '/?view=students',   icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/capi\.coachingapp\.in\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 }, // 1hr
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /^https:\/\/capi\.coachingapp\.in\/media\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'media-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 }, // 7 days
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          react:    ['react', 'react-dom'],
          query:    ['@tanstack/react-query'],
          lucide:   ['lucide-react'],
        },
      },
    },
  },
})