# 1. Используем официальный образ Node.js с Alpine (лёгкий и быстрый)
FROM node:18-alpine

# 2. Указываем рабочую директорию внутри контейнера
WORKDIR /app

# 3. Устанавливаем pnpm глобально
RUN npm install -g pnpm

# 4. Копируем package.json и pnpm-lock.yaml перед установкой зависимостей
COPY package.json pnpm-lock.yaml ./

# 5. Устанавливаем зависимости
RUN pnpm install --frozen-lockfile

# 6. Копируем весь код проекта внутрь контейнера
COPY . .

# 7. Генерируем Prisma-клиент
RUN pnpm prisma:generate

# 8. Открываем порт 5000
EXPOSE 5000

# 9. Запускаем миграции и сидинг перед запуском сервера
CMD ["sh", "-c", "pnpm prisma:migrate && pnpm prisma:seed && pnpm dev"]