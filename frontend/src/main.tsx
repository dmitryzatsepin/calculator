// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { MantineProvider } from '@mantine/core';
import "./styles/globalStyles.ts";
import "@mantine/core/styles.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// --- ИМПОРТИРУЕМ НОВЫЕ ПРОВАЙДЕРЫ ---
import { CalculatorFormProvider } from "./context/CalculatorFormProvider";
import { CalculatorDataProvider } from "./context/CalculatorDataProvider";
import { CalculationResultProvider } from "./context/CalculationResultProvider";

// --- Настройка QueryClient ---
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// --- Рендеринг приложения ---
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <CalculatorFormProvider>  {/* 1. Форма (самый внешний) */}
          <CalculatorDataProvider> {/* 2. Данные (внутри формы) */}
            <CalculationResultProvider> {/* 3. Результаты (внутри данных) */}
              <App />
            </CalculationResultProvider>
          </CalculatorDataProvider>
        </CalculatorFormProvider>
      </MantineProvider>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  </React.StrictMode>,
);