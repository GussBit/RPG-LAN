import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Importante para testar em desenvolvimento (npm run dev)
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'RPG-LAN Tabletop',
        short_name: 'RPG-LAN',
        description: 'Gerenciador de Mesa de RPG Local',
        theme_color: '#09090b',
        background_color: '#09090b',
        display: 'fullscreen', // 'standalone' remove a barra de navegação. Use 'fullscreen' para forçar tela cheia total.
        orientation: 'landscape',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})