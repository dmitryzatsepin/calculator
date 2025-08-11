#!/bin/bash

# LED Calculator Deployment Script
echo "🚀 Starting LED Calculator deployment..."

# Переходим в папку проекта
cd /home/dimpin/calculator/frontend

# Очищаем предыдущую сборку
echo "🧹 Cleaning previous build..."
npm run clean

# Устанавливаем зависимости (если нужно)
echo "📦 Installing dependencies..."
npm install

# Собираем приложение
echo "🔨 Building application..."
npm run build

# Проверяем, что сборка прошла успешно
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Копируем файлы в production
    echo "📁 Copying files to production..."
    rsync -av --delete dist/ /var/www/dimpin-app.store/apps/led-calculator/
    
    if [ $? -eq 0 ]; then
        echo "✅ Deployment completed successfully!"
        echo "🌐 Application available at: https://dimpin-app.store/apps/led-calculator/"
        
        # Перезагружаем Angie (если нужно)
        echo "🔄 Reloading Angie..."
        sudo systemctl reload angie
        
        echo "🎉 All done! Your LED Calculator is now live!"
    else
        echo "❌ Failed to copy files to production"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi 