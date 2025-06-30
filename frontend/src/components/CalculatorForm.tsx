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

// --- Импорт НОВЫХ Контекстов/Хуков ---
import { useCalculatorForm } from "../context/CalculatorFormProvider";
import { useCalculatorData } from "../context/CalculatorDataProvider";
import { useCalculationResult } from "../context/CalculationResultProvider";

// --- КОМПОНЕНТ ---
const CalculatorForm = () => {
  // 1. Получаем все, что касается полей формы и их сеттеров
  const {
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
    localDollarRateInput,
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
    setLocalDollarRateInput,
  } = useCalculatorForm();

  // 2. Получаем все данные, загруженные с сервера, и их статусы
  const {
    isLoadingInitialData,
    isErrorInitialData,
    errorInitialData,
    screenTypeOptions,
    isLoadingScreenTypeOptions,
    isErrorScreenTypeOptions,
    errorScreenTypeOptions,
    isLoadingPitches,
    isErrorPitches,
    errorPitches,
    isLoadingRefreshRates,
    isErrorRefreshRates,
    errorRefreshRates,
    isLoadingBrightnesses,
    isErrorBrightnesses,
    errorBrightnesses,
    isLoadingModules,
    isErrorModules,
    errorModules,
    isLoadingCabinets,
    isErrorCabinets,
    errorCabinets,
    isLoadingDollarRate,
    // Мемоизированные опции для селектов
    screenTypeSegments,
    locationSelectOptions,
    materialSelectOptions,
    protectionSelectOptions,
    brightnessSelectOptions,
    refreshRateSelectOptions,
    sensorSelectOptions,
    controlTypeSelectOptions,
    pitchSelectOptions,
    moduleSelectOptions,
    cabinetSelectOptions,
    isFlexOptionAvailableForSelectedScreenType,
  } = useCalculatorData();

  // 3. Получаем все, что связано с выполнением и результатами расчетов
  const {
    isCalculating,
    isCalculationReady,
    performCalculation,
  } = useCalculationResult();


  const cabinetScreenTypeCode = "cabinet";
  const showCabinetSection = selectedScreenTypeCode === cabinetScreenTypeCode;

  // --- ОТЛАДКА ОПЦИЙ ---
  useEffect(() => {
    if (selectedScreenTypeCode) {
      console.log("Options Debug:", {
        selectedScreenTypeCode,
        isLoadingOptions: isLoadingScreenTypeOptions,
        isErrorOptions: isErrorScreenTypeOptions,
        errorOptions: errorScreenTypeOptions?.message,
        availableOptionsData: screenTypeOptions,
        isFlexOptionAvailable: isFlexOptionAvailableForSelectedScreenType,
      });
    }
  }, [selectedScreenTypeCode, screenTypeOptions, isLoadingScreenTypeOptions, isErrorScreenTypeOptions, errorScreenTypeOptions, isFlexOptionAvailableForSelectedScreenType]);

  // --- Обработчики ---
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
  const handleDollarRateChange = useCallback((value: number | string) => setLocalDollarRateInput(value), [setLocalDollarRateInput]);
  const handleCalculateClick = useCallback(() => performCalculation(), [performCalculation]);

  // --- JSX (остается без изменений) ---
  return (
    <Stack gap="md">
      <LoadingOverlay
        visible={isLoadingInitialData}
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{ children: <Loader /> }}
      />
      {isLoadingInitialData && <Text ta="center">Загрузка конфигурации...</Text>}
      {!isLoadingInitialData && isErrorInitialData && (
        <Alert
          title="Ошибка загрузки данных"
          color="red"
          icon={<IconAlertCircle size={16} />}
          radius="sm"
        >
          {errorInitialData?.message ?? "Не удалось загрузить данные."}
        </Alert>
      )}

      {!isLoadingInitialData && !isErrorInitialData && (
        <>
          <ScreenTypeSelector
            data={screenTypeSegments}
            value={selectedScreenTypeCode}
            onChange={handleScreenTypeChange}
            disabled={isLoadingInitialData}
          />

          {/* Условный рендеринг опции Flex */}
          {isLoadingScreenTypeOptions && selectedScreenTypeCode === cabinetScreenTypeCode && (
            <Loader size="xs" mt="sm" />
          )}
          {isErrorScreenTypeOptions && selectedScreenTypeCode === cabinetScreenTypeCode && (
            <Text c="red" size="xs">
              Ошибка загрузки специфичных опций: {errorScreenTypeOptions?.message}
            </Text>
          )}
          {isFlexOptionAvailableForSelectedScreenType && !isLoadingScreenTypeOptions && !isErrorScreenTypeOptions && (
            <FlexOptionSwitch
              checked={isFlexSelected}
              onChange={handleFlexChange}
            />
          )}

          <Grid>
            <DimensionInputs
              width={widthMm}
              height={heightMm}
              onWidthChange={setWidthMm}
              onHeightChange={setHeightMm}
              disabled={isLoadingInitialData}
            />
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                <LocationSelect
                  options={locationSelectOptions}
                  value={selectedLocationCode}
                  onChange={handleLocationChange}
                  disabled={isLoadingInitialData || !selectedScreenTypeCode || locationSelectOptions.length === 0}
                  required
                />
                <IpProtectionSelect
                  options={protectionSelectOptions}
                  value={selectedProtectionCode}
                  onChange={handleProtectionChange}
                  disabled={isLoadingInitialData || !selectedLocationCode || protectionSelectOptions.length === 0}
                  required
                />
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Grid>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <SensorCheckboxGroup
                    options={sensorSelectOptions}
                    value={selectedSensorCodes}
                    onChange={handleSensorChange}
                    disabled={true}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 8 }}>
                  <ControlTypeCheckboxGroup
                    options={controlTypeSelectOptions}
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
                  options={materialSelectOptions}
                  value={selectedMaterialCode}
                  onChange={handleMaterialChange}
                  disabled={isLoadingInitialData || !selectedLocationCode || materialSelectOptions.length === 0}
                  required
                />
              )}
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }} mt="md">
              <PitchSelect
                options={pitchSelectOptions}
                value={selectedPitchCode}
                onChange={handlePitchChange}
                disabled={
                  isLoadingInitialData || !selectedLocationCode || !selectedProtectionCode ||
                  (showCabinetSection && !selectedMaterialCode) ||
                  isLoadingPitches || pitchSelectOptions.length === 0
                }
                loading={isLoadingPitches}
                required={true}
                placeholder={!selectedLocationCode ? "Сначала выберите расположение" : isLoadingPitches ? "Загрузка..." : "Выберите шаг пикселя"}
              />
              {isErrorPitches && (<Text c="red" size="sm" mt="xs"> Ошибка загрузки шагов пикселя: {errorPitches?.message ?? "Неизвестная ошибка"} </Text>)}
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }} mt="md">
              <RefreshRateSelect
                options={refreshRateSelectOptions}
                value={selectedRefreshRateCode}
                onChange={handleRefreshRateChange}
                disabled={isLoadingInitialData || !selectedPitchCode || isLoadingRefreshRates}
                loading={isLoadingRefreshRates}
                required={false}
                placeholder={!selectedPitchCode ? "Выберите шаг пикселя" : (isLoadingRefreshRates ? "Загрузка..." : "Авто / Выберите частоту")}
              />
              {isErrorRefreshRates && (<Text c="red" size="sm" mt="xs">Ошибка загрузки частоты: {errorRefreshRates?.message}</Text>)}
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }} mt="md">
              <BrightnessSelect
                options={brightnessSelectOptions}
                value={selectedBrightnessCode}
                onChange={handleBrightnessChange}
                disabled={isLoadingInitialData || !selectedPitchCode || isLoadingBrightnesses}
                loading={isLoadingBrightnesses}
                required={false}
                placeholder={!selectedPitchCode ? "Выберите шаг пикселя" : (isLoadingBrightnesses ? "Загрузка..." : "Авто / Выберите яркость")}
              />
              {isErrorBrightnesses && (<Text c="red" size="sm" mt="xs">Ошибка загрузки яркости: {errorBrightnesses?.message}</Text>)}
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }} mt="md">
              <ModuleSelect
                options={moduleSelectOptions}
                value={selectedModuleCode}
                onChange={handleModuleChange}
                disabled={isLoadingInitialData || !selectedLocationCode || !selectedPitchCode || !selectedBrightnessCode || !selectedRefreshRateCode || isLoadingModules || moduleSelectOptions.length === 0}
                loading={isLoadingModules}
                required={true}
              />
              {isErrorModules && (<Text c="red" size="sm" mt="xs"> Ошибка загрузки модулей: {errorModules?.message ?? "Неизвестная ошибка"} </Text>)}
            </Grid.Col>
            {showCabinetSection ? (
              <Grid.Col span={{ base: 12, md: 6 }} mt="md">
                <CabinetSelect
                  options={cabinetSelectOptions}
                  value={selectedCabinetCode}
                  onChange={handleCabinetChange}
                  loading={isLoadingCabinets}
                  disabled={!selectedLocationCode || !selectedMaterialCode || !selectedPitchCode || !selectedModuleCode || isLoadingCabinets}
                  required={true}
                />
                {isErrorCabinets && (<Text c="red" size="sm" mt="xs"> Ошибка загрузки кабинетов: {errorCabinets?.message ?? "Неизвестная ошибка"} </Text>)}
              </Grid.Col>
            ) : (
              <Grid.Col span={{ base: 0, md: 6 }} />
            )}
            <Grid.Col span={12} mt="md">
              <Group grow preventGrowOverflow={false} align="flex-end" wrap="nowrap">
                <DollarRateInput
                  value={localDollarRateInput}
                  onChange={handleDollarRateChange}
                  disabled={isLoadingInitialData}
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
        </>
      )}
    </Stack>
  );
};


// Компонент-обертка остается без изменений
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