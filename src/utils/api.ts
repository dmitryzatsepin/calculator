export const api = {
    // 📌 GET-запрос (получение данных)
    get: async <R>(url: string): Promise<R> => {
      const response = await fetch(`http://localhost:5000${url}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Ошибка запроса: ${response.statusText}`);
      }
  
      return response.json() as Promise<R>;
    },
  
    // 📌 POST-запрос (создание данных)
    post: async <T, R>(url: string, data: T): Promise<R> => {
      const response = await fetch(`http://localhost:5000${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error(`Ошибка запроса: ${response.statusText}`);
      }
  
      return response.json() as Promise<R>;
    },
  
    // 📌 PUT-запрос (обновление данных)
    put: async <T, R>(url: string, data: T): Promise<R> => {
      const response = await fetch(`http://localhost:5000${url}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error(`Ошибка запроса: ${response.statusText}`);
      }
  
      return response.json() as Promise<R>;
    },
  
    // 📌 DELETE-запрос (удаление данных)
    delete: async <R>(url: string): Promise<R> => {
      const response = await fetch(`http://localhost:5000${url}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Ошибка запроса: ${response.statusText}`);
      }
  
      return response.json() as Promise<R>;
    },
  };
  