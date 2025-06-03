// frontend/src/components/CalculatorForm.tsx
import { useCallback, useEffect } from "react";
import {
  Stack,
  LoadingOverlay,
  Grid,
  Group,
  Alert,
  Text,
  Button,
  Loader,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

// --- Импорт Компонентов ---
import DimensionInputs from "./inputs/DimensionInputs";
import ScreenTypeSelector from "./inputs/ScreenTypeSelector";
import LocationSelect from "./inputs/LocationSelect";
import MaterialSelect from "./inputs/MaterialSelect";
import IpProtectionSelect from "./inputs/IpProtectionSelect";
import BrightnessSelect from "./inputs/BrightnessSelect";
import RefreshRateSelect from "./inputs/RefreshRateSelect";
import SensorCheckboxGroup from "./inputs/SensorCheckboxGroup";
import ControlTypeCheckboxGroup from "./inputs/ControlTypeCheckboxGroup";
import PitchSelect from "./inputs/PitchSelect";
import ModuleSelect from "./inputs/ModuleSelect";
import CabinetSelect from "./inputs/CabinetSelect";
import FlexOptionSwitch from "./inputs/FlexOptionSwitch";
import DollarRateInput from "./inputs/DollarRateInput";
import CalculateButton from "./inputs/CalculateButton";

// --- Импорт Контекста ---
import { useCalculatorContext } from "../context/CalculatorContext";

// --- КОМПОНЕНТ ---
const CalculatorForm = () => {
  // --- Получаем данные из контекста ---
  const {
    // Статусы загрузки для начальных данных
    isLoadingInitialData, // ИЗМЕНЕНО (было isLoading)
    isErrorInitialData,   // ИЗМЕНЕНО (было isError)
    errorInitialData,     // ИЗМЕНЕНО (было error)

    // Данные и статусы для опций типа экрана (из хука useScreenTypeOptions)
    screenTypeOptions, // Массив опций (было optionsQueryResult.data)
    isLoadingScreenTypeOptions,
    isErrorScreenTypeOptions,
    errorScreenTypeOptions,

    // Данные и статусы для питчей (из хука usePitchOptions)
    isLoadingPitches,
    isErrorPitches,
    errorPitches,

    // Данные и статусы для частоты обновления (из хука useFilteredRefreshRates)
    isLoadingRefreshRates,
    isErrorRefreshRates,
    errorRefreshRates,

    // Данные и статусы для яркости (из хука useFilteredBrightnesses)
    isLoadingBrightnesses,
    isErrorBrightnesses,
    errorBrightnesses,

    // Данные и статусы для модулей (из хука useModuleOptions)
    isLoadingModules,
    isErrorModules,
    errorModules,

    // Данные и статусы для кабинетов (из хука useCabinetOptions)
    isLoadingCabinets,
    isErrorCabinets,
    errorCabinets,
    
    // Курс доллара
    localDollarRateInput, // ИЗМЕНЕНО (было dollarRate) - для инпута
    setLocalDollarRateInput, // ИЗМЕНЕНО (было setDollarRate) - для инпута
    isLoadingDollarRate, // Статус загрузки курса

    // Состояние формы (имена не изменились)
    selectedScreenTypeCode,
    selectedLocationCode,
    selectedMaterialCode,
    selectedProtectionCode,
    selectedBrightnessCode,
    selectedRefreshRateCode,
    selectedSensorCodes,
    selectedControlTypeCodes,
    selectedPitchCode,
    selectedModuleCode,
    selectedCabinetCode,
    isFlexSelected,
    widthMm,
    heightMm,
    
    // Статусы и результаты расчета (имена не изменились)
    isCalculating,
    isCalculationReady, // Убедитесь, что это поле есть и его логика в контексте корректна
    
    // Сеттеры состояния формы (имена не изменились)
    setSelectedScreenTypeCode,
    setSelectedLocationCode,
    setSelectedMaterialCode,
    setSelectedProtectionCode,
    setSelectedBrightnessCode,
    setSelectedRefreshRateCode,
    setSelectedSensorCodes,
    setSelectedControlTypeCodes,
    setSelectedPitchCode,
    setSelectedModuleCode,
    setSelectedCabinetCode,
    setIsFlexSelected,
    setWidthMm,
    setHeightMm,
    performCalculation, // Функция расчета

    // Мемоизированные опции для селектов (новые имена)
    screenTypeSegments,
    locationSelectOptions,    // ИЗМЕНЕНО (было locationOptions)
    materialSelectOptions,  // ИЗМЕНЕНО (было materialOptions)
    protectionSelectOptions, // ИЗМЕНЕНО (было protectionOptions)
    brightnessSelectOptions, // ИЗМЕНЕНО (было brightnessOptions)
    refreshRateSelectOptions,// ИЗМЕНЕНО (было refreshRateOptions)
    sensorSelectOptions,      // ИЗМЕНЕНО (было sensorOptions)
    controlTypeSelectOptions, // ИЗМЕНЕНО (было controlTypeOptions)
    pitchSelectOptions,       // ИЗМЕНЕНО (было pitchOptions)
    moduleSelectOptions,      // ИЗМЕНЕНО (было moduleOptions)
    cabinetSelectOptions,     // ИЗМЕНЕНО (было cabinetOptions)
    isFlexOptionAvailableForSelectedScreenType, // ИЗМЕНЕНО (было isFlexOptionAvailable)

  } = useCalculatorContext();

  // cabinetScreenTypeCode и showCabinetSection остаются как есть
  const cabinetScreenTypeCode = "cabinet";
  const showCabinetSection = selectedScreenTypeCode === cabinetScreenTypeCode;

  // --- ОТЛАДКА ОПЦИЙ (адаптируем к новым именам) ---
  useEffect(() => {
    if (selectedScreenTypeCode) {
      console.log("Options Debug:", {
        selectedScreenTypeCode,
        isLoadingOptions: isLoadingScreenTypeOptions, // ИЗМЕНЕНО
        isErrorOptions: isErrorScreenTypeOptions,     // ИЗМЕНЕНО
        errorOptions: errorScreenTypeOptions?.message, // ИЗМЕНЕНО
        availableOptionsData: screenTypeOptions,       // ИЗМЕНЕНО
        isFlexOptionAvailable: isFlexOptionAvailableForSelectedScreenType, // ИЗМЕНЕНО
      });
    }
  }, [selectedScreenTypeCode, screenTypeOptions, isLoadingScreenTypeOptions, isErrorScreenTypeOptions, errorScreenTypeOptions, isFlexOptionAvailableForSelectedScreenType]);
  // ---------------------

  // --- Обработчики (остаются как есть, так как имена сеттеров не менялись) ---
  const handleScreenTypeChange = useCallback((value: string | null) => setSelectedScreenTypeCode(value), [setSelectedScreenTypeCode]);
  const handleLocationChange = useCallback((value: string | null) => setSelectedLocationCode(value), [setSelectedLocationCode]);
  const handleMaterialChange = useCallback((value: string | null) => setSelectedMaterialCode(value), [setSelectedMaterialCode]);
  const handleProtectionChange = useCallback((value: string | null) => setSelectedProtectionCode(value), [setSelectedProtectionCode]);
  const handleBrightnessChange = useCallback((value: string | null) => setSelectedBrightnessCode(value), [setSelectedBrightnessCode]);
  const handleRefreshRateChange = useCallback((value: string | null) => setSelectedRefreshRateCode(value), [setSelectedRefreshRateCode]);
  const handleSensorChange = useCallback((value: string[]) => setSelectedSensorCodes(value), [setSelectedSensorCodes]);
  const handleControlTypeChange = useCallback((value: string[]) => setSelectedControlTypeCodes(value), [setSelectedControlTypeCodes]);
  const handlePitchChange = useCallback((value: string | null) => setSelectedPitchCode(value), [setSelectedPitchCode]);
  const handleModuleChange = useCallback((value: string | null) => setSelectedModuleCode(value), [setSelectedModuleCode]);
  const handleCabinetChange = useCallback((value: string | null) => setSelectedCabinetCode(value), [setSelectedCabinetCode]);
  const handleFlexChange = useCallback((checked: boolean) => setIsFlexSelected(checked), [setIsFlexSelected]);
  const handleDollarRateChange = useCallback((value: number | string) => setLocalDollarRateInput(value), [setLocalDollarRateInput]); // ИЗМЕНЕНО
  const handleCalculateClick = useCallback(() => performCalculation(), [performCalculation]);

  // --- JSX (адаптируем к новым именам) ---
  return (
    <Stack gap="md">
      <LoadingOverlay
        visible={isLoadingInitialData} // ИЗМЕНЕНО
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{ children: <Loader /> }}
      />
      {isLoadingInitialData && <Text ta="center">Загрузка конфигурации...</Text>} {/* ИЗМЕНЕНО */}
      {!isLoadingInitialData && isErrorInitialData && ( // ИЗМЕНЕНО
        <Alert
          title="Ошибка загрузки данных"
          color="red"
          icon={<IconAlertCircle size={16} />}
          radius="sm"
        >
          {errorInitialData?.message ?? "Не удалось загрузить данные."} {/* ИЗМЕНЕНО */}
        </Alert>
      )}

      {!isLoadingInitialData && !isErrorInitialData && ( // ИЗМЕНЕНО
        <>
          <ScreenTypeSelector
            data={screenTypeSegments}
            value={selectedScreenTypeCode}
            onChange={handleScreenTypeChange}
            disabled={isLoadingInitialData} // ИЗМЕНЕНО
          />

          {/* Условный рендеринг опции Flex */}
          {isLoadingScreenTypeOptions && isFlexOptionAvailableForSelectedScreenType && ( // ИЗМЕНЕНО
            <Loader size="xs" mt="sm" />
          )}
          {isErrorScreenTypeOptions && isFlexOptionAvailableForSelectedScreenType && ( // ИЗМЕНЕНО
            <Text c="red" size="xs">
              Ошибка загрузки опций: {errorScreenTypeOptions?.message} {/* ИЗМЕНЕНО */}
            </Text>
          )}
          {isFlexOptionAvailableForSelectedScreenType && !isLoadingScreenTypeOptions && !isErrorScreenTypeOptions && ( // ИЗМЕНЕНО
            <FlexOptionSwitch
              checked={isFlexSelected}
              onChange={handleFlexChange}
              disabled={selectedScreenTypeCode === cabinetScreenTypeCode}
            />
          )}

          <Grid>
            <DimensionInputs
              width={widthMm}
              height={heightMm}
              onWidthChange={setWidthMm}
              onHeightChange={setHeightMm}
              disabled={isLoadingInitialData} // ИЗМЕНЕНО
            />
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                <LocationSelect
                  options={locationSelectOptions} // ИЗМЕНЕНО
                  value={selectedLocationCode}
                  onChange={handleLocationChange}
                  disabled={isLoadingInitialData || !selectedScreenTypeCode || locationSelectOptions.length === 0} // ИЗМЕНЕНО
                  required
                />
                <IpProtectionSelect
                  options={protectionSelectOptions} // ИЗМЕНЕНО
                  value={selectedProtectionCode}
                  onChange={handleProtectionChange}
                  disabled={isLoadingInitialData || !selectedLocationCode || protectionSelectOptions.length === 0} // ИЗМЕНЕНО
                  required
                />
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Grid>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <SensorCheckboxGroup
                    options={sensorSelectOptions} // ИЗМЕНЕНО
                    value={selectedSensorCodes}
                    onChange={handleSensorChange}
                    disabled={true}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 8 }}>
                  <ControlTypeCheckboxGroup
                    options={controlTypeSelectOptions} // ИЗМЕНЕНО
                    value={selectedControlTypeCodes}
                    onChange={handleControlTypeChange}
                    disabled={true}
                  />
                </Grid.Col>
              </Grid>
            </Grid.Col>
            <Grid.Col span={12} mt="md">
              {showCabinetSection && (
                <MaterialSelect
                  options={materialSelectOptions} // ИЗМЕНЕНО
                  value={selectedMaterialCode}
                  onChange={handleMaterialChange}
                  disabled={isLoadingInitialData || !selectedLocationCode || materialSelectOptions.length === 0} // ИЗМЕНЕНО
                  required
                />
              )}
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }} mt="md">
              <PitchSelect
                options={pitchSelectOptions} // ИЗМЕНЕНО
                value={selectedPitchCode}
                onChange={handlePitchChange}
                disabled={
                  isLoadingInitialData || !selectedLocationCode || !selectedProtectionCode ||
                  (showCabinetSection && !selectedMaterialCode) ||
                  isLoadingPitches || pitchSelectOptions.length === 0 // ИЗМЕНЕНО
                }
                loading={isLoadingPitches}
                required={true}
                placeholder={!selectedLocationCode ? "Сначала выберите расположение" : isLoadingPitches ? "Загрузка..." : "Выберите шаг пикселя"}
              />
              {isErrorPitches && ( <Text c="red" size="sm" mt="xs"> Ошибка загрузки шагов пикселя: {errorPitches?.message ?? "Неизвестная ошибка"} </Text> )}
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }} mt="md">
              <RefreshRateSelect
                options={refreshRateSelectOptions} // ИЗМЕНЕНО
                value={selectedRefreshRateCode}
                onChange={handleRefreshRateChange}
                disabled={isLoadingInitialData || !selectedPitchCode || isLoadingRefreshRates}
                loading={isLoadingRefreshRates}
                required={false}
                placeholder={!selectedPitchCode ? "Выберите шаг пикселя" : (isLoadingRefreshRates ? "Загрузка..." : "Авто / Выберите частоту")}
              />
              {isErrorRefreshRates && ( <Text c="red" size="sm" mt="xs">Ошибка загрузки частоты: {errorRefreshRates?.message}</Text> )}
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }} mt="md">
              <BrightnessSelect
                options={brightnessSelectOptions} // ИЗМЕНЕНО
                value={selectedBrightnessCode}
                onChange={handleBrightnessChange}
                disabled={isLoadingInitialData || !selectedPitchCode || isLoadingBrightnesses}
                loading={isLoadingBrightnesses}
                required={false}
                placeholder={!selectedPitchCode ? "Выберите шаг пикселя" : (isLoadingBrightnesses ? "Загрузка..." : "Авто / Выберите яркость")}
              />
              {isErrorBrightnesses && ( <Text c="red" size="sm" mt="xs">Ошибка загрузки яркости: {errorBrightnesses?.message}</Text> )}
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }} mt="md">
              <ModuleSelect
                options={moduleSelectOptions} // ИЗМЕНЕНО
                value={selectedModuleCode}
                onChange={handleModuleChange}
                disabled={ isLoadingInitialData || !selectedLocationCode || !selectedPitchCode || !selectedBrightnessCode || !selectedRefreshRateCode || isLoadingModules || moduleSelectOptions.length === 0 } // ИЗМЕНЕНО
                loading={isLoadingModules}
                required={true}
              />
              {isErrorModules && ( <Text c="red" size="sm" mt="xs"> Ошибка загрузки модулей: {errorModules?.message ?? "Неизвестная ошибка"} </Text> )}
            </Grid.Col>
            {showCabinetSection ? (
              <Grid.Col span={{ base: 12, md: 6 }} mt="md">
                <CabinetSelect
                  options={cabinetSelectOptions} // ИЗМЕНЕНО
                  value={selectedCabinetCode}
                  onChange={handleCabinetChange}
                  loading={isLoadingCabinets}
                  disabled={ !selectedLocationCode || !selectedMaterialCode || !selectedPitchCode || !selectedModuleCode || isLoadingCabinets }
                  required={true}
                />
                {isErrorCabinets && ( <Text c="red" size="sm" mt="xs"> Ошибка загрузки кабинетов: {errorCabinets?.message ?? "Неизвестная ошибка"} </Text> )}
              </Grid.Col>
            ) : (
              <Grid.Col span={{ base: 0, md: 6 }} />
            )}
            <Grid.Col span={12} mt="md">
              <Group grow preventGrowOverflow={false} align="flex-end" wrap="nowrap">
                <DollarRateInput
                  value={localDollarRateInput} // ИЗМЕНЕНО
                  onChange={handleDollarRateChange}
                  disabled={isLoadingInitialData} // ИЗМЕНЕНО
                  loading={isLoadingDollarRate}
                  required={true}
                  size="sm"
                  style={{ flexBasis: "150px", flexGrow: 0 }}
                />
                <CalculateButton
                  onClick={handleCalculateClick}
                  loading={isCalculating}
                  disabled={!isCalculationReady}
                  size="sm"
                />
              </Group>
            </Grid.Col>
          </Grid>
          
          {/* Блок отладки - нужно будет адаптировать имена переменных, если раскомментируете */}
          {/* ... ваш закомментированный блок отладки ... */}
        </>
      )}
    </Stack>
  );
};

const CalculatorFormWrapper = () => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary
        onReset={reset}
        fallbackRender={({ error, resetErrorBoundary }: FallbackProps) => (
          <Alert title="Критическая ошибка формы" color="red" radius="sm" withCloseButton onClose={resetErrorBoundary}>
            Произошла ошибка: {error?.message ?? "Неизвестная ошибка"}
            <Button onClick={resetErrorBoundary} variant="outline" color="red" size="xs" mt="sm">
              Попробовать снова
            </Button>
          </Alert>
        )}
      >
        <CalculatorForm />
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
);

export default CalculatorFormWrapper;