import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- Импорт наших новых провайдеров контекста ---
import { CalculatorFormProvider } from './context/CalculatorFormProvider';
import { CalculatorDataProvider } from './context/CalculatorDataProvider';
import { CalculationResultProvider } from './context/CalculationResultProvider';

// --- Импорт страниц ---
import DisplayCalculator from "./pages/DisplayCalculator";
import NotFound from "./pages/NotFound";

// Создаем экземпляр клиента для React Query
const queryClient = new QueryClient();

const App = () => {
  return (
    // 1. Провайдер для React Query (самый внешний)
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={{}}>
        {/* 2. Провайдер для состояния формы */}
        <CalculatorFormProvider>
          {/* 3. Провайдер для данных (зависит от формы) */}
          <CalculatorDataProvider>

            <CalculationResultProvider>
              <BrowserRouter>
                <Routes>
                  {/* Теперь DisplayCalculator имеет доступ ко всем трем контекстам */}
                  <Route path="/" element={<DisplayCalculator />} />
                  <Route path="*" element={<NotFound />} />
                  {/* Здесь можно будет добавить другие роуты, например, для логина */}
                </Routes>
              </BrowserRouter>
            </CalculationResultProvider>
          </CalculatorDataProvider>
        </CalculatorFormProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
};

export default App;