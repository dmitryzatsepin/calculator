# --- ЭТАП 1: Сборка (Builder) ---
# Используем образ Node.js с pnpm для установки зависимостей и сборки TypeScript
FROM node:18-alpine AS builder

# Устанавливаем pnpm глобально
RUN npm install -g pnpm

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем файлы конфигурации pnpm и package.json
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/

# Устанавливаем ТОЛЬКО зависимости для бэкенда
# Флаг --prod говорит pnpm устанавливать только production зависимости, что уменьшает размер
RUN pnpm install --filter backend --prod

# Копируем весь исходный код бэкенда
COPY backend/ ./backend/

# Компилируем TypeScript в JavaScript
# Код будет в папке /app/backend/dist
RUN pnpm --filter backend run build


# --- ЭТАП 2: Запуск (Runner) ---
# Используем "чистый" и легкий образ Node.js для запуска
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем ТОЛЬКО скомпилированный код и production зависимости из этапа "builder"
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/node_modules ./backend/node_modules

# Копируем Prisma схему для генерации клиента
COPY backend/prisma ./backend/prisma

# Генерируем Prisma Client внутри production-окружения
# Это важно, так как бинарные файлы могут зависеть от ОС
RUN npx prisma generate --schema=./backend/prisma/schema.prisma

# Указываем порт, который будет слушать наше приложение внутри контейнера
EXPOSE 5000

# Команда для запуска нашего приложения
# Запускаем скомпилированный server.js
CMD ["node", "backend/dist/server.js"]