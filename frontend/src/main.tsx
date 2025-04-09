import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { MantineProvider } from '@mantine/core';
import "./styles/globalStyles.ts";
import "@mantine/core/styles.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Данные будут считаться "свежими" в течение 5 минут
      refetchOnWindowFocus: false, // Не перезапрашивать данные при фокусировке окна
      retry: 1, // Количество попыток повторного запроса в случае ошибки
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Задержка между попытками (максимум 30 секунд)
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <App />
      </MantineProvider>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" /> 
    </QueryClientProvider>
  </React.StrictMode>,
);