import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/apps/led-calculator/',
  plugins: [react()],
  server: {
    proxy: {
      // Это правило говорит:
      // "Любой запрос, который начинается с /api/local,
      // перенаправляй на http://localhost:5000"
      '/api/local': {
        target: 'http://localhost:5000', // Адрес вашего локального бэкенда
        changeOrigin: true, // Необходимо для корректной работы прокси

        // Эта строка убирает '/api/local' из пути перед отправкой на бэкенд,
        // чтобы на бэкенд приходил чистый путь, например, '/api/v1'
        rewrite: (path) => path.replace(/^\/api\/local/, ''),
      }
    }
  }
})