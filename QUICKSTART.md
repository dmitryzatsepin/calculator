# 🚀 Быстрый старт LED Calculator

## 1. Первый запуск (5 минут)

```bash
# Переходим в директорию проекта
cd /home/dimpin/calculator

# Делаем скрипты исполняемыми
chmod +x *.sh

# Проверяем конфигурацию
./check-config.sh

# Деплоим приложение
./deploy.sh all

# Запускаем backend
./pm2-manage.sh start

# Проверяем статус
./pm2-manage.sh status
```

## 2. Автоматический запуск (2 минуты)

```bash
# Простой автозапуск PM2
./setup-autostart.sh

# ИЛИ полная автоматизация (требует sudo)
sudo ./install-autostart.sh
```

## 3. Проверка работы

- **Frontend**: https://dimpin-app.store/apps/led-calculator/
- **Backend API**: http://localhost:5000
- **PM2 статус**: `./pm2-manage.sh status`
- **Логи**: `./pm2-manage.sh logs`

## 4. Обновление

```bash
# Обычное обновление
./deploy.sh all

# Перезапуск backend
./pm2-manage.sh restart
```

## 5. Полезные команды

```bash
# Статус всех сервисов
./check-config.sh

# Логи PM2
pm2 logs led-calculator-backend

# Логи Angie
tail -f /var/log/angie/access.log

# Статус автозапусков
systemctl status led-calculator-deploy.timer
```

## 🎯 Что происходит автоматически

- ✅ Backend запускается при загрузке системы
- ✅ Автоматический деплой каждые 6 часов
- ✅ Деплой при push в git
- ✅ Ежедневный деплой в 3:00
- ✅ Все операции логируются

## 🆘 Если что-то не работает

1. **Проверьте статус**: `./check-config.sh`
2. **Посмотрите логи**: `./pm2-manage.sh logs`
3. **Перезапустите**: `./pm2-manage.sh restart`
4. **Проверьте Angie**: `sudo systemctl status angie`

---

📖 **Подробная документация**: [DEPLOY.md](DEPLOY.md) 