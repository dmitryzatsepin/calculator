// src/components/CalculatorForm.tsx
import { useCallback } from "react";
import { Stack, LoadingOverlay, Grid, Alert, Text, Button } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

// --- Импорт Компонентов ---
import DimensionInputs from "./inputs/DimensionInputs";
import ScreenTypeSelector from "./inputs/ScreenTypeSelector";
import LocationSelect from "./inputs/LocationSelect";
import MaterialSelect from "./inputs/MaterialSelect";
import IpProtectionSelect from "./inputs/IpProtectionSelect";

// --- Импорт Контекста ---
import { useCalculatorContext } from '../context/CalculatorContext';

// --- КОМПОНЕНТ ---
const CalculatorForm = () => {
    // --- Получаем данные из контекста ---
  const {
    // Статусы
    isLoading,
    isError,
    error,
    // Состояния выбора
    selectedScreenTypeCode,
    selectedLocationCode,
    selectedMaterialCode,
    selectedProtectionCode,
    widthMm,
    heightMm,
    // Функции для обновления
    setSelectedScreenTypeCode,
    setSelectedLocationCode,
    setSelectedMaterialCode,
    setSelectedProtectionCode,
    setWidthMm,
    setHeightMm,
    // Подготовленные данные для UI
    screenTypeSegments,
    locationOptions,
    materialOptions,
    protectionOptions,
  } = useCalculatorContext();

  // --- Обработчики (вызывают функции из контекста) ---
  const handleScreenTypeChange = useCallback((value: string) => {
    setSelectedScreenTypeCode(value);
  }, [setSelectedScreenTypeCode]);

  const handleLocationChange = useCallback((value: string | null) => {
    setSelectedLocationCode(value);
  }, [setSelectedLocationCode]);

  const handleMaterialChange = useCallback((value: string | null) => {
    setSelectedMaterialCode(value);
  }, [setSelectedMaterialCode]);

  const handleProtectionChange = useCallback((value: string | null) => {
    setSelectedProtectionCode(value);
  }, [setSelectedProtectionCode]);

  // --- JSX ---
  return (
    <Stack gap="md">
      <LoadingOverlay visible={isLoading} overlayProps={{ radius: "sm", blur: 2 }} />
      {isLoading && <Text ta="center">Загрузка конфигурации...</Text>}
      {!isLoading && isError && ( <Alert title="Ошибка загрузки данных" color="red" icon={<IconAlertCircle size={16} />} radius="sm"> {error?.message ?? "Не удалось загрузить данные."} </Alert> )}

      {/* Отображаем форму только после загрузки и без ошибок */}
      {!isLoading && !isError && (
          <>
              {/* --- Используем дочерние компоненты --- */}
              <ScreenTypeSelector
                  data={screenTypeSegments}
                  value={selectedScreenTypeCode}
                  onChange={handleScreenTypeChange}
                  disabled={isLoading}
              />

              <Grid>
                  <DimensionInputs
                      width={widthMm}
                      height={heightMm}
                      onWidthChange={setWidthMm}
                      onHeightChange={setHeightMm}
                      disabled={isLoading}
                  />
                  <Grid.Col span={{ base: 12, md: 6 }}>
                       <LocationSelect
                           options={locationOptions}
                           value={selectedLocationCode}
                           onChange={handleLocationChange}
                           disabled={isLoading || !selectedScreenTypeCode || locationOptions.length === 0}
                           required
                       />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                      <MaterialSelect
                          options={materialOptions}
                          value={selectedMaterialCode}
                          onChange={handleMaterialChange}
                          disabled={isLoading || !selectedLocationCode || materialOptions.length === 0}
                          required
                      />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                       <IpProtectionSelect
                           options={protectionOptions}
                           value={selectedProtectionCode}
                           onChange={handleProtectionChange}
                           // IP зависит от локации, так что блокируем, пока локация не выбрана
                           disabled={isLoading || !selectedLocationCode || protectionOptions.length === 0}
                           // Возможно, не required, т.к. может быть авто-выбор
                           required
                       />
                  </Grid.Col>
              </Grid>

               {/* Блок отладки (использует значения из контекста) */}
               {(selectedScreenTypeCode || widthMm || heightMm || selectedLocationCode || selectedMaterialCode) && (
                    <Stack gap={0} mt="xs" p="xs" style={{ border: '1px dashed #ccc', borderRadius: '4px' }}>
                        <Text size="xs" c="dimmed">Отладка:</Text>
                        {selectedScreenTypeCode && (<Text size="sm">Выбран тип: {selectedScreenTypeCode}</Text>)}
                        {(widthMm || heightMm) && (<Text size="sm">Размеры: {widthMm || '?'} x {heightMm || '?'} мм</Text>)}
                        {selectedLocationCode && (<Text size="sm">Расположение: {selectedLocationCode}</Text>)}
                        {selectedMaterialCode && (<Text size="sm">Материал: {selectedMaterialCode}</Text>)}
                        {selectedProtectionCode && (<Text size="sm">Защита IP: {selectedProtectionCode}</Text>)}
                    </Stack>
               )}
          </>
      )}
    </Stack>
  );
};

// --- Обертка с ErrorBoundary ---
const CalculatorFormWrapper = () => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary
        onReset={reset}
        fallbackRender={({ error, resetErrorBoundary }: FallbackProps) => (
          <Alert title="Критическая ошибка формы" color="red" radius="sm" withCloseButton onClose={resetErrorBoundary}>
            Произошла ошибка: {error?.message ?? 'Неизвестная ошибка'}
            <Button onClick={resetErrorBoundary} variant="outline" color="red" size="xs" mt="sm">
                Попробовать снова
            </Button>
          </Alert>
        )}
      >
        {/* CalculatorForm сам получит все из контекста, т.к. он внутри Provider'а (в main.tsx) */}
        <CalculatorForm />
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
);

export default CalculatorFormWrapper;