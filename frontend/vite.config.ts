import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/apps/led-calculator/',
  plugins: [react()],
  server: {
    proxy: {
      // Правило №1: Для API Центробанка (корректно)
      '/api/currency': {
        target: 'https://www.cbr-xml-daily.ru/daily_json.js',
        changeOrigin: true,
        rewrite: () => '',
      },
      // Правило №2: Для вашего локального бэкенда (теперь тоже корректно)
      '/api/v1': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})