import React, { useEffect } from 'react';
import { getBitrix24Params, saveBitrix24Params, isInBitrix24Slider } from '../utils/bitrix24';

interface Bitrix24InitializerProps {
  children: React.ReactNode;
  onParamsLoaded?: (params: any) => void;
}

export const Bitrix24Initializer: React.FC<Bitrix24InitializerProps> = ({ 
  children, 
  onParamsLoaded 
}) => {
  useEffect(() => {
    // Проверяем что мы в CRM слайдере
    if (isInBitrix24Slider()) {
      const params = getBitrix24Params();
      
      if (params) {
        // Сохраняем параметры
        saveBitrix24Params(params);
        
        // Уведомляем родительский компонент
        if (onParamsLoaded) {
          onParamsLoaded(params);
        }
        
        console.log('✅ Битрикс24 параметры загружены:', params);
      } else {
        console.warn('⚠️ Не удалось получить параметры Битрикс24');
      }
    } else {
      console.log('ℹ️ Приложение запущено не в CRM слайдере');
    }
  }, [onParamsLoaded]);

  return <>{children}</>;
}; 