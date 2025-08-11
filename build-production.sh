#!/bin/bash

# Скрипт для production build LED Calculator
set -e

echo "🔨 Начинаем production build..."

# Проверяем наличие pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm не установлен. Устанавливаем..."
    npm install -g pnpm
fi

# Backend build
echo "🔧 Собираем backend..."
cd backend

# Устанавливаем зависимости
echo "📦 Устанавливаем backend зависимости..."
pnpm install --frozen-lockfile

# Генерируем Prisma клиент
echo "🔧 Генерируем Prisma клиент..."
pnpm prisma:generate

# Собираем TypeScript
echo "🔨 Собираем TypeScript..."
pnpm build

echo "✅ Backend собран успешно!"
cd ..

# Frontend build
echo "🔧 Собираем frontend..."
cd frontend

# Устанавливаем зависимости
echo "📦 Устанавливаем frontend зависимости..."
pnpm install --frozen-lockfile

# Собираем production версию
echo "🔨 Собираем production версию..."
NODE_ENV=production pnpm build

echo "✅ Frontend собран успешно!"
cd ..

echo "🎉 Production build завершен!"
echo ""
echo "📁 Результаты:"
echo "   Backend: backend/dist/"
echo "   Frontend: frontend/dist/"
echo ""
echo "🚀 Для запуска используй:"
echo "   Docker: ./deploy.sh"
echo "   PM2: ./deploy-pm2.sh" 