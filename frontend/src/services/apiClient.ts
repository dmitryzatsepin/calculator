
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// --- Вспомогательная функция для обработки ответа ---
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorData;
    try {
      // Пытаемся прочитать тело ошибки как JSON (там может быть поле message)
      errorData = await response.json();
    } catch (e) {
      // Если тело не JSON или пустое, используем статус текст
      errorData = { message: response.statusText };
    }
    // Создаем объект ошибки
    const error = new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    // Можно добавить сам объект ответа к ошибке для доп. информации
    // (error as any).response = response; 
    // (error as any).errorData = errorData;
    console.error("API Error:", errorData); // Логируем детали ошибки
    throw error;
  }
  
  // Если статус ОК, парсим тело ответа как JSON
  // Если тело ответа пустое (например, для статуса 204 No Content), возвращаем null или пустой объект
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return await response.json() as T;
  } else {
    // Если ответ не JSON, возвращаем null или обрабатываем иначе по необходимости
    return null as T; 
  }
};

// --- Основные методы API клиента ---

/**
 * Выполняет GET запрос к API.
 * @param endpoint - Путь к ресурсу API (например, '/users', '/materials')
 * @param options - Дополнительные опции для fetch (например, headers)
 * @returns Promise с данными ответа типа T
 */
const get = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`[API GET]: ${url}`); // Логируем запрос
  
  // TODO: Добавить логику получения токена и добавления заголовка Authorization
  // const token = localStorage.getItem('authToken'); 
  // const headers = {
  //   'Content-Type': 'application/json',
  //   ...(token && { 'Authorization': `Bearer ${token}` }),
  //   ...options?.headers,
  // };

  const headers = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  const response = await fetch(url, {
    ...options,
    method: 'GET',
    headers: headers,
  });
  return handleResponse<T>(response);
};

// TODO: Добавить методы post, put, patch, delete по аналогии, когда понадобятся

// --- Экспортируем методы клиента ---
export const apiClient = {
  get,
  // post,
  // put,
  // delete,
};

// Просто для удобства, если где-то нужен только базовый URL
export const getApiBaseUrl = () => API_BASE_URL; 