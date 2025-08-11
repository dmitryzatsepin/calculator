#!/bin/bash

# Скрипт для deployment LED Calculator на сервер
set -e

echo "🚀 Начинаем deployment LED Calculator..."

# Проверяем наличие Docker и Docker Compose
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен"
    exit 1
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
if ! docker run --rm --env-file .env postgres:15-alpine psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Не удается подключиться к базе данных. Проверь DATABASE_URL в .env файле"
    exit 1
fi
echo "✅ Подключение к базе данных успешно!"

# Останавливаем существующие контейнеры
echo "🛑 Останавливаем существующие контейнеры..."
docker-compose down --remove-orphans

# Удаляем старые образы
echo "🧹 Удаляем старые образы..."
docker system prune -f

# Собираем и запускаем
echo "🔨 Собираем и запускаем приложение..."
docker-compose up --build -d

# Ждем запуска сервисов
echo "⏳ Ждем запуска сервисов..."
sleep 30

# Проверяем статус
echo "📊 Проверяем статус сервисов..."
docker-compose ps

# Проверяем health checks
echo "🏥 Проверяем health checks..."
docker-compose exec -T backend curl -f http://localhost:5000/health || echo "❌ Backend health check failed"
docker-compose exec -T nginx curl -f http://localhost/health || echo "❌ Nginx health check failed"

echo "✅ Deployment завершен!"
echo "🌐 Frontend доступен по адресу: http://localhost"
echo "🔌 Backend API доступен по адресу: http://localhost:5000"
echo "🗄️  База данных: Neon PostgreSQL (удаленная)"

# Показываем логи
echo "📋 Показываем логи..."
docker-compose logs --tail=20 