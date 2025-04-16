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
import BrightnessSelect from './inputs/BrightnessSelect';
import RefreshRateSelect from './inputs/RefreshRateSelect';
import SensorCheckboxGroup from './inputs/SensorCheckboxGroup';
import ControlTypeCheckboxGroup from './inputs/ControlTypeCheckboxGroup';
import ModuleSelect from './inputs/ModuleSelect';

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
    selectedBrightnessCode,
    selectedRefreshRateCode,
    selectedSensorCodes,
    selectedControlTypeCodes,
    selectedModuleCode,
    widthMm,
    heightMm,
    // Функции для обновления
    setSelectedScreenTypeCode,
    setSelectedLocationCode,
    setSelectedMaterialCode,
    setSelectedProtectionCode,
    setSelectedBrightnessCode,
    setSelectedRefreshRateCode,
    setSelectedSensorCodes,
    setSelectedControlTypeCodes,
    setSelectedModuleCode,
    setWidthMm,
    setHeightMm,
    // Подготовленные данные для UI
    screenTypeSegments,
    locationOptions,
    materialOptions,
    protectionOptions,
    brightnessOptions,
    refreshRateOptions,
    sensorOptions,
    controlTypeOptions,
    moduleOptions,
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

  const handleBrightnessChange = useCallback((value: string | null) => {
    setSelectedBrightnessCode(value);
  }, [setSelectedBrightnessCode]);

  const handleRefreshRateChange = useCallback((value: string | null) => {
    setSelectedRefreshRateCode(value);
  }, [setSelectedRefreshRateCode]);

  const handleSensorChange = useCallback((value: string[]) => {
    setSelectedSensorCodes(value);
  }, [setSelectedSensorCodes]);

  const handleControlTypeChange = useCallback((value: string[]) => {
    setSelectedControlTypeCodes(value);
  }, [setSelectedControlTypeCodes]);

  const handleModuleChange = useCallback((value: string | null) => {
    setSelectedModuleCode(value);
  }, [setSelectedModuleCode]);

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
                  <Grid.Col span={{ base: 12, md: 6 }}>
                       <BrightnessSelect
                           options={brightnessOptions}
                           value={selectedBrightnessCode}
                           onChange={handleBrightnessChange}
                           // Блокируем, пока не выбрана IP защита (или пока нет опций)
                           disabled={isLoading || !selectedProtectionCode || brightnessOptions.length === 0}
                           // Поля пока не обязательные
                           required={false}
                           placeholder="Авто / Выберите яркость" // Можно указать, что есть автовыбор
                       />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                       <RefreshRateSelect
                           options={refreshRateOptions}
                           value={selectedRefreshRateCode}
                           onChange={handleRefreshRateChange}
                           // Блокируем, пока не выбрана IP защита (или пока нет опций)
                           disabled={isLoading || !selectedProtectionCode || refreshRateOptions.length === 0}
                           // Поля пока не обязательные
                           required={false}
                           placeholder="Авто / Выберите частоту" // Можно указать, что есть автовыбор
                       />
                  </Grid.Col>
                  <Grid.Col span={12} mt="sm"> {/* Занимает всю ширину, небольшой отступ сверху */}
                       <SensorCheckboxGroup
                           options={sensorOptions}
                           value={selectedSensorCodes}
                           onChange={handleSensorChange}
                           // Блокируем только во время общей загрузки или если опций нет
                           disabled={isLoading || sensorOptions.length === 0}
                       />
                  </Grid.Col>
                  <Grid.Col span={12} mt="sm"> {/* Занимает всю ширину, небольшой отступ */}
                       <ControlTypeCheckboxGroup
                           options={controlTypeOptions}
                           value={selectedControlTypeCodes}
                           onChange={handleControlTypeChange}
                           // Блокируем только во время общей загрузки или если опций нет
                           disabled={isLoading || controlTypeOptions.length === 0}
                       />
                  </Grid.Col>
                  <Grid.Col span={12} mt="md"> {/* Отступ побольше перед основным выбором */}
                       <ModuleSelect
                           options={moduleOptions}
                           value={selectedModuleCode}
                           onChange={handleModuleChange}
                           // Блокируем, пока не выбраны типы управления (или пока нет опций)
                           // TODO: Усложнить логику disabled, когда будут все зависимые поля (питч и т.д.)
                           disabled={
                            isLoading ||
                            !selectedLocationCode ||
                            !selectedBrightnessCode ||
                            !selectedRefreshRateCode ||
                            moduleOptions.length === 0
                        }
                           required={true} // Выбор модуля обязателен
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
                        {selectedBrightnessCode && (<Text size="sm">Яркость: {selectedBrightnessCode} ({brightnessOptions.find(o => o.value === selectedBrightnessCode)?.label})</Text>)}
                        {selectedRefreshRateCode && (<Text size="sm">Частота: {selectedRefreshRateCode} ({refreshRateOptions.find(o => o.value === selectedRefreshRateCode)?.label})</Text>)}
                        {selectedSensorCodes.length > 0 && (<Text size="sm">Сенсоры: {selectedSensorCodes.join(', ')}</Text>)}
                        {selectedControlTypeCodes.length > 0 && (<Text size="sm">Типы управления: {selectedControlTypeCodes.join(', ')}</Text>)}
                        {selectedModuleCode && (<Text size="sm">Модуль: {selectedModuleCode} ({moduleOptions.find(o => o.value === selectedModuleCode)?.label})</Text>)}
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