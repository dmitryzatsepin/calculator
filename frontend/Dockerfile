# 1. Используем Node.js для сборки React-приложения
FROM node:18-alpine

# 2. Указываем рабочую директорию
WORKDIR /app

# 3. Копируем package.json и pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 4. Устанавливаем pnpm
RUN npm install -g pnpm

# 5. Устанавливаем зависимости
RUN pnpm install --frozen-lockfile

# 6. Копируем весь проект внутрь контейнера
COPY . .

# 7. Собираем проект
RUN pnpm build

# 8. Используем Nginx для раздачи статических файлов
FROM nginx:1.23

# 9. Копируем собранный проект в Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 10. ✅ Копируем наш кастомный конфиг в Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 11. Открываем порт 80
EXPOSE 80

# 12. Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]
