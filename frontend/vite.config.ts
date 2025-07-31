import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/apps/led-calculator/',
  plugins: [react()],
  server: {
    proxy: {
      // Правило №1: Для API Центробанка
      '/api/currency': {
        target: 'https://www.cbr-xml-daily.ru/daily_json.js',
        changeOrigin: true,
        // 👇 Убираем параметр, так как он не нужен 👇
        rewrite: () => '',
      },
      // Правило №2: Для твоего локального бэкенда
      '/api/local': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => {
          console.log(`Rewriting path: ${path} to /api/v1`);
          return '/api/v1';
        }
      }
    }
  }
})
