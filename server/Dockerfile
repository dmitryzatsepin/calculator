# 1. Используем официальный образ Node.js
FROM node:18-alpine

# 2. Указываем рабочую директорию внутри контейнера
WORKDIR /app

# 3. Копируем package.json и pnpm-lock.yaml перед установкой зависимостей
COPY package.json pnpm-lock.yaml ./

# 4. Устанавливаем pnpm
RUN npm install -g pnpm

# 5. Устанавливаем зависимости
RUN pnpm install --frozen-lockfile

# 6. Копируем весь код проекта внутрь контейнера
COPY . .

# 7. Генерируем Prisma-клиент
RUN pnpm prisma generate

# 8. Открываем порт 5000 (чтобы контейнер мог принимать запросы)
EXPOSE 5000

# 9. Запускаем сервер
CMD ["pnpm", "dev"]
