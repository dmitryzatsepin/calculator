module.exports = {
  apps: [{
    name: "led-calculator-backend",
    script: "./dist/server.js", // Путь к вашему скомпилированному файлу
    env: {
      NODE_ENV: "production",
    },
    // Указываем PM2 загружать переменные из .env файла
    // перед запуском скрипта.
    env_file: ".env"
  }]
}