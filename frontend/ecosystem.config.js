module.exports = {
  apps: [
    {
      name: 'led-calculator-frontend',
      script: 'npm',
      args: 'run dev',
      cwd: '/home/dimpin/calculator/frontend',
      watch: ['src/**/*'],
      ignore_watch: ['node_modules', 'dist'],
      env: {
        NODE_ENV: 'development',
        PORT: 5173
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G'
    },
    {
      name: 'led-calculator-deploy',
      script: 'npm',
      args: 'run deploy',
      cwd: '/home/dimpin/calculator/frontend',
      instances: 1,
      autorestart: false,
      max_memory_restart: '1G',
      cron_restart: '0 */6 * * *' // Перезапуск каждые 6 часов
    }
  ]
}; 