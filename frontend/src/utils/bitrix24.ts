// Утилиты для работы с Битрикс24 CRM

export interface Bitrix24Params {
  dealId: string;
  userId: string;
  domain: string;
  authId: string;
  memberId: string;
}

/**
 * Получает параметры из URL для CRM слайдера
 */
export function getBitrix24Params(): Bitrix24Params | null {
  const urlParams = new URLSearchParams(window.location.search);
  
  const dealId = urlParams.get('dealId');
  const userId = urlParams.get('userId');
  const domain = urlParams.get('domain');
  const authId = urlParams.get('authId');
  const memberId = urlParams.get('memberId');
  
  if (!dealId || !domain || !authId || !memberId) {
    return null;
  }
  
  return {
    dealId,
    userId: userId || 'current',
    domain,
    authId,
    memberId
  };
}

/**
 * Сохраняет параметры в localStorage для дальнейшего использования
 */
export function saveBitrix24Params(params: Bitrix24Params): void {
  localStorage.setItem('bitrix24_params', JSON.stringify(params));
  localStorage.setItem('bitrix24_timestamp', Date.now().toString());
}

/**
 * Получает сохраненные параметры из localStorage
 */
export function getSavedBitrix24Params(): Bitrix24Params | null {
  const saved = localStorage.getItem('bitrix24_params');
  const timestamp = localStorage.getItem('bitrix24_timestamp');
  
  if (!saved || !timestamp) {
    return null;
  }
  
  // Проверяем что параметры не устарели (24 часа)
  const age = Date.now() - parseInt(timestamp);
  if (age > 24 * 60 * 60 * 1000) {
    localStorage.removeItem('bitrix24_params');
    localStorage.removeItem('bitrix24_timestamp');
    return null;
  }
  
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

/**
 * Проверяет что приложение запущено в CRM слайдере
 */
export function isInBitrix24Slider(): boolean {
  return window.location.search.includes('dealId=') && 
         window.location.search.includes('authId=');
}

/**
 * Получает заголовки для API запросов с авторизацией Битрикс24
 */
export function getBitrix24Headers(): Record<string, string> {
  const params = getSavedBitrix24Params();
  
  if (!params) {
    return {};
  }
  
  return {
    'X-Bitrix24-Deal-Id': params.dealId,
    'X-Bitrix24-User-Id': params.userId,
    'X-Bitrix24-Domain': params.domain,
    'X-Bitrix24-Auth-Id': params.authId,
    'X-Bitrix24-Member-Id': params.memberId,
  };
} 