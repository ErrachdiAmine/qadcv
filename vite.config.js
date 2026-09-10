import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  root: '.',
  build: {
    outDir: 'dist'
  },
  server: {
    port: 5175,
    host: '0.0.0.0'
  }
})
