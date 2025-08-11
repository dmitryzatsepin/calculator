# 🚀 Deployment LED Calculator

## ⚠️ **ВАЖНО: Удаленная база данных Neon**

Это приложение использует **Neon PostgreSQL** в облаке. Локальная база данных не требуется.

## Варианты развертывания

### 1. Docker Compose (Рекомендуется)

Самый простой способ развернуть все приложение:

```bash
# Клонируй репозиторий
git clone <your-repo>
cd calculator

# Сделай скрипт исполняемым
chmod +x deploy.sh

# Запусти deployment
./deploy.sh
```

**Что происходит:**
- Проверяется подключение к Neon базе данных
- Собирается и запускается backend API
- Собирается и запускается frontend
- Настраивается Nginx reverse proxy
- Все сервисы запускаются в Docker контейнерах

### 2. PM2 (Без Docker)

Для серверов без Docker:

```bash
# Сделай скрипт исполняемым
chmod +x deploy-pm2.sh

# Запусти deployment
./deploy-pm2.sh
```

**Что происходит:**
- Проверяется подключение к Neon базе данных
- Backend запускается с PM2
- Frontend собирается в статические файлы
- Требуется ручная настройка Nginx

## 🔧 Настройка

### Переменные окружения

Создай `.env` файл в корне проекта:

```env
# Database Configuration (Neon PostgreSQL)
DATABASE_URL="postgresql://neondb_owner:npg_x6fPlUYykhj8@ep-tight-smoke-a2js53cj-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=10"

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Environment
NODE_ENV=production
PORT=5000
```

**⚠️ ВАЖНО:** 
- Не меняй `DATABASE_URL` - это твоя Neon база
- Измени только `JWT_SECRET` на свой секретный ключ

### SSL сертификаты

Для production замени self-signed сертификаты в `nginx/ssl/` на реальные.

## 📊 Мониторинг

### Docker Compose
```bash
# Статус сервисов
docker-compose ps

# Логи
docker-compose logs -f

# Перезапуск
docker-compose restart
```

### PM2
```bash
# Статус процессов
pm2 status

# Логи
pm2 logs

# Мониторинг
pm2 monit
```

## 🌐 Доступ

После deployment:

- **Frontend**: http://localhost (или твой домен)
- **Backend API**: http://localhost:5000
- **База данных**: Neon PostgreSQL (удаленная)

## 🔍 Troubleshooting

### Проверка подключения к базе данных
```bash
# Проверь что Neon база доступна
curl -s "https://api.neon.tech/v2/projects" \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Accept: application/json"
```

### Проверка health checks
```bash
# Backend
curl http://localhost:5000/health

# Nginx
curl http://localhost/health
```

### Логи ошибок
```bash
# Docker
docker-compose logs backend

# PM2
pm2 logs led-calculator-backend
```

### Пересборка
```bash
# Docker
docker-compose down
docker-compose up --build -d

# PM2
pm2 restart led-calculator-backend
```

## 📝 Обновление

Для обновления приложения:

```bash
# Останови сервисы
docker-compose down  # или pm2 stop led-calculator-backend

# Получи обновления
git pull origin main

# Пересобери и запусти
./deploy.sh  # или ./deploy-pm2.sh
```

## 🔒 Безопасность

- **НЕ ИЗМЕНЯЙ** `DATABASE_URL` - это твоя Neon база
- Измени `JWT_SECRET` на свой секретный ключ
- Используй HTTPS в production
- Настрой firewall
- Регулярно обновляй зависимости
- Мониторь логи на подозрительную активность

## 🗄️ **Neon PostgreSQL особенности**

- База данных автоматически масштабируется
- SSL соединение обязательно (`sslmode=require`)
- Connection pooling включен
- Автоматические бэкапы
- Мониторинг через Neon Dashboard 