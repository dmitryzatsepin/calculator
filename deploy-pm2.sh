#!/bin/bash

# Скрипт для deployment LED Calculator с PM2 (без Docker)
set -e

echo "🚀 Начинаем deployment LED Calculator с PM2..."

# Проверяем наличие Node.js и PM2
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен"
    exit 1
fi

if ! command -v pm2 &> /dev/null; then
    echo "📦 Устанавливаем PM2..."
    npm install -g pm2
fi

# Создаем .env файл если его нет
if [ ! -f .env ]; then
    echo "📝 Создаем .env файл..."
    cat > .env << EOF
# Database Configuration (Neon PostgreSQL)
DATABASE_URL="postgresql://neondb_owner:npg_x6fPlUYykhj8@ep-tight-smoke-a2js53cj-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=10"

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Environment
NODE_ENV=production
PORT=5000
EOF
    echo "⚠️  Отредактируй .env файл с реальными значениями!"
    exit 1
fi

# Проверяем подключение к базе данных
echo "🔍 Проверяем подключение к Neon базе данных..."
if ! node -e "
const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL);
client.connect()
  .then(() => client.query('SELECT 1'))
  .then(() => { console.log('✅ Подключение к базе данных успешно!'); process.exit(0); })
  .catch(err => { console.error('❌ Ошибка подключения к БД:', err.message); process.exit(1); })
  .finally(() => client.end());
" 2>/dev/null; then
    echo "❌ Не удается подключиться к базе данных. Проверь DATABASE_URL в .env файле"
    exit 1
fi

# Останавливаем существующие процессы
echo "🛑 Останавливаем существующие процессы..."
pm2 stop led-calculator-backend || true
pm2 delete led-calculator-backend || true

# Переходим в backend директорию
cd backend

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
pnpm install --frozen-lockfile

# Генерируем Prisma клиент
echo "🔧 Генерируем Prisma клиент..."
pnpm prisma:generate

# Собираем приложение
echo "🔨 Собираем приложение..."
pnpm build

# Создаем директорию для логов
mkdir -p logs

# Запускаем с PM2
echo "🚀 Запускаем с PM2..."
pm2 start ecosystem.config.cjs

# Сохраняем PM2 конфигурацию
pm2 save

# Возвращаемся в корневую директорию
cd ..

# Переходим в frontend директорию
cd frontend

# Устанавливаем зависимости
echo "📦 Устанавливаем frontend зависимости..."
pnpm install --frozen-lockfile

# Собираем frontend
echo "🔨 Собираем frontend..."
pnpm build

# Возвращаемся в корневую директорию
cd ..

echo "✅ Deployment завершен!"
echo "🔌 Backend запущен с PM2 на порту 5000"
echo "🌐 Frontend собран в frontend/dist"
echo "🗄️  База данных: Neon PostgreSQL (удаленная)"
echo "📊 Проверь статус: pm2 status"

# Показываем статус PM2
pm2 status 