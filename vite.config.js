import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001' // use localhost for local proxy
    },
    allowedHosts: ['louishu.zapto.org'] // accept domain name
  }
})
