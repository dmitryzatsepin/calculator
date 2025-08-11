import { useState, useEffect } from 'react';
import { 
  getBitrix24Params, 
  getSavedBitrix24Params, 
  isInBitrix24Slider,
  Bitrix24Params 
} from '../utils/bitrix24';

export function useBitrix24() {
  const [params, setParams] = useState<Bitrix24Params | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInSlider, setIsInSlider] = useState(false);

  useEffect(() => {
    // Проверяем что мы в CRM слайдере
    const inSlider = isInBitrix24Slider();
    setIsInSlider(inSlider);

    if (inSlider) {
      // Пытаемся получить параметры из URL
      const urlParams = getBitrix24Params();
      
      if (urlParams) {
        setParams(urlParams);
        setIsLoading(false);
      } else {
        // Пытаемся получить сохраненные параметры
        const savedParams = getSavedBitrix24Params();
        setParams(savedParams);
        setIsLoading(false);
      }
    } else {
      // Не в слайдере - загружаем сохраненные параметры если есть
      const savedParams = getSavedBitrix24Params();
      setParams(savedParams);
      setIsLoading(false);
    }
  }, []);

  return {
    params,
    isLoading,
    isInSlider,
    hasParams: !!params,
    dealId: params?.dealId,
    userId: params?.userId,
    domain: params?.domain,
    authId: params?.authId,
    memberId: params?.memberId,
  };
} 