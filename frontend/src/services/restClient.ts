const API_BASE_URL = import.meta.env.VITE_REST_API_URL || 'http://localhost:5000/api/v1/rest';

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText };
    }
    const error = new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    console.error("REST API Error:", errorData);
    throw error;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return null as T;
};

const createRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  body?: unknown
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem("token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);
  return handleResponse<T>(response);
};

export const restClient = {
  get: <T>(endpoint: string): Promise<T> => {
    return createRequest<T>('GET', endpoint);
  },

  post: <T, R>(endpoint: string, data: T): Promise<R> => {
    return createRequest<R>('POST', endpoint, data);
  },

  put: <T, R>(endpoint: string, data: T): Promise<R> => {
    return createRequest<R>('PUT', endpoint, data);
  },

  delete: <T>(endpoint: string): Promise<T> => {
    return createRequest<T>('DELETE', endpoint);
  },
};