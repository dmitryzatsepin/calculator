# --- Этап 1: Установка зависимостей ---
FROM node:18-alpine AS deps
WORKDIR /app
RUN npm install -g pnpm

# Копируем workspace файлы
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/package.json

# Устанавливаем зависимости
RUN pnpm install --no-frozen-lockfile


# --- Этап 2: Сборка бэкенда ---
FROM node:18-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm prisma

# Копируем зависимости
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /app/backend/package.json ./backend/package.json

# Копируем только backend
COPY backend ./backend

# Генерация Prisma и сборка
RUN cd backend && pnpm install && pnpm prisma:generate && pnpm build


# --- Этап 3: Финальный образ ---
FROM node:18-alpine
WORKDIR /app

# Установка pnpm
RUN npm install -g pnpm

# Копируем production-зависимости
COPY --from=builder /app/backend/node_modules ./backend/node_modules

# Копируем скомпилированный код
COPY --from=builder /app/backend/dist ./backend/dist

# Копируем сгенерированные файлы Prisma
COPY --from=builder /app/backend/prisma ./backend/prisma

EXPOSE 5000

# Запуск
CMD ["node", "./backend/dist/src/server.js"]