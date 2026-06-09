import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/zakaz-api': {
        target: 'https://api.zakaz.ua',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/zakaz-api/, ''),
      },
    },
  },
})
