// src/components/CalculatorForm.tsx
import { useCallback, useEffect } from "react"; // Импорт useEffect присутствует
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
    isLoading: isLoadingInitial,
    isError: isErrorInitial,
    error: errorInitial,
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
    dollarRate,
    isCalculating,
    isLoadingDollarRate,
    widthMm,
    heightMm,
    cabinetQueryResult,
    optionsQueryResult,
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
    setDollarRate,
    performCalculation,
    setWidthMm,
    setHeightMm,
    screenTypeSegments,
    locationOptions,
    materialOptions,
    protectionOptions,
    brightnessOptions,
    refreshRateOptions,
    sensorOptions,
    controlTypeOptions,
    pitchOptions,
    moduleOptions,
    cabinetOptions,
    isFlexOptionAvailable,
    isCalculationReady,
  } = useCalculatorContext();

  const {
    isLoading: isLoadingCabinets,
    isError: isErrorCabinets,
    error: errorCabinets,
  } = cabinetQueryResult;
  const {
    data: optionsData,
    isLoading: isLoadingOptions,
    isError: isErrorOptions,
    error: errorOptions,
  } = optionsQueryResult;
  const cabinetScreenTypeCode = "cabinet";
  const showCabinetSection = selectedScreenTypeCode === cabinetScreenTypeCode;

  // --- ОТЛАДКА ОПЦИЙ ---
  useEffect(() => {
    if (selectedScreenTypeCode) {
      console.log("Options Debug:", {
        selectedScreenTypeCode,
        isLoadingOptions,
        isErrorOptions,
        errorOptions: errorOptions?.message,
        availableOptionsData: optionsData,
        isFlexOptionAvailable,
      });
    }
  }, [selectedScreenTypeCode, optionsQueryResult, isFlexOptionAvailable]);
  // ---------------------

  // --- Обработчики ---
  const handleScreenTypeChange = useCallback(
    (value: string | null) => {
      setSelectedScreenTypeCode(value);
    },
    [setSelectedScreenTypeCode]
  );
  const handleLocationChange = useCallback(
    (value: string | null) => {
      setSelectedLocationCode(value);
    },
    [setSelectedLocationCode]
  );
  const handleMaterialChange = useCallback(
    (value: string | null) => {
      setSelectedMaterialCode(value);
    },
    [setSelectedMaterialCode]
  );
  const handleProtectionChange = useCallback(
    (value: string | null) => {
      setSelectedProtectionCode(value);
    },
    [setSelectedProtectionCode]
  );
  const handleBrightnessChange = useCallback(
    (value: string | null) => {
      setSelectedBrightnessCode(value);
    },
    [setSelectedBrightnessCode]
  );
  const handleRefreshRateChange = useCallback(
    (value: string | null) => {
      setSelectedRefreshRateCode(value);
    },
    [setSelectedRefreshRateCode]
  );
  const handleSensorChange = useCallback(
    (value: string[]) => {
      setSelectedSensorCodes(value);
    },
    [setSelectedSensorCodes]
  );
  const handleControlTypeChange = useCallback(
    (value: string[]) => {
      setSelectedControlTypeCodes(value);
    },
    [setSelectedControlTypeCodes]
  );
  const handlePitchChange = useCallback(
    (value: string | null) => {
      setSelectedPitchCode(value);
    },
    [setSelectedPitchCode]
  );
  const handleModuleChange = useCallback(
    (value: string | null) => {
      setSelectedModuleCode(value);
    },
    [setSelectedModuleCode]
  );
  const handleCabinetChange = useCallback(
    (value: string | null) => {
      setSelectedCabinetCode(value);
    },
    [setSelectedCabinetCode]
  );
  const handleFlexChange = useCallback(
    (checked: boolean) => {
      setIsFlexSelected(checked);
    },
    [setIsFlexSelected]
  );
  const handleDollarRateChange = useCallback(
    (value: number | string) => {
      setDollarRate(value);
    },
    [setDollarRate]
  );
  const handleCalculateClick = useCallback(() => {
    performCalculation();
  }, [performCalculation]);

  // --- JSX ---
  return (
    <Stack gap="md">
      <LoadingOverlay
        visible={isLoadingInitial}
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{ children: <Loader /> }}
      />
      {isLoadingInitial && <Text ta="center">Загрузка конфигурации...</Text>}
      {!isLoadingInitial && isErrorInitial && (
        <Alert
          title="Ошибка загрузки данных"
          color="red"
          icon={<IconAlertCircle size={16} />}
          radius="sm"
        >
          {" "}
          {errorInitial?.message ?? "Не удалось загрузить данные."}{" "}
        </Alert>
      )}

      {!isLoadingInitial && !isErrorInitial && (
        <>
          <ScreenTypeSelector
            data={screenTypeSegments}
            value={selectedScreenTypeCode}
            onChange={handleScreenTypeChange}
            disabled={isLoadingInitial}
          />

          {/* Условный рендеринг опции Flex */}
          {isLoadingOptions && isFlexOptionAvailable && (
            <Loader size="xs" mt="sm" />
          )}
          {isErrorOptions && isFlexOptionAvailable && (
            <Text c="red" size="xs">
              Ошибка загрузки опций: {errorOptions?.message}
            </Text>
          )}
          {isFlexOptionAvailable && !isLoadingOptions && !isErrorOptions && (
            <FlexOptionSwitch
              checked={isFlexSelected}
              onChange={handleFlexChange}
              disabled={selectedScreenTypeCode === cabinetScreenTypeCode}
            />
          )}

          {/* --- СЕТКА С ПАРАМЕТРАМИ --- */}
          <Grid>
            {/* Размеры */}
            <DimensionInputs
              width={widthMm}
              height={heightMm}
              onWidthChange={setWidthMm}
              onHeightChange={setHeightMm}
              disabled={isLoadingInitial}
            />

            {/* --- ЛЕВАЯ КОЛОНКА --- */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                <LocationSelect
                  options={locationOptions}
                  value={selectedLocationCode}
                  onChange={handleLocationChange}
                  disabled={
                    isLoadingInitial ||
                    !selectedScreenTypeCode ||
                    locationOptions.length === 0
                  }
                  required
                />
                <IpProtectionSelect
                  options={protectionOptions}
                  value={selectedProtectionCode}
                  onChange={handleProtectionChange}
                  disabled={
                    isLoadingInitial ||
                    !selectedLocationCode ||
                    protectionOptions.length === 0
                  }
                  required
                />
              </Stack>
            </Grid.Col>

            {/* --- ПРАВАЯ КОЛОНКА --- */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Grid>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <SensorCheckboxGroup
                    options={sensorOptions}
                    value={selectedSensorCodes}
                    onChange={handleSensorChange}
                    disabled={true}
                    //disabled={isLoadingInitial || sensorOptions.length === 0}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 8 }}>
                  <ControlTypeCheckboxGroup
                    options={controlTypeOptions}
                    value={selectedControlTypeCodes}
                    onChange={handleControlTypeChange}
                    disabled={true}
                    // disabled={isLoadingInitial || controlTypeOptions.length === 0}
                  />
                </Grid.Col>
              </Grid>
            </Grid.Col>
            {/* --- ОСТАЛЬНЫЕ ПОЛЯ --- */}
            {/* УСЛОВНЫЙ РЕНДЕРИНГ МАТЕРИАЛА */}
            <Grid.Col span={12} mt="md">
              {showCabinetSection && (
                <MaterialSelect
                  options={materialOptions}
                  value={selectedMaterialCode}
                  onChange={handleMaterialChange}
                  disabled={
                    isLoadingInitial ||
                    !selectedLocationCode ||
                    materialOptions.length === 0
                  }
                  required
                />
              )}
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }} mt="md">
              <BrightnessSelect
                options={brightnessOptions}
                value={selectedBrightnessCode}
                onChange={handleBrightnessChange}
                disabled={
                  isLoadingInitial ||
                  !selectedProtectionCode ||
                  brightnessOptions.length === 0
                }
                required={false}
                placeholder="Авто / Выберите яркость"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }} mt="md">
              <RefreshRateSelect
                options={refreshRateOptions}
                value={selectedRefreshRateCode}
                onChange={handleRefreshRateChange}
                disabled={
                  isLoadingInitial ||
                  !selectedProtectionCode ||
                  refreshRateOptions.length === 0
                }
                required={false}
                placeholder="Авто / Выберите частоту"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }} mt="md">
              <PitchSelect
                options={pitchOptions}
                value={selectedPitchCode}
                onChange={handlePitchChange}
                disabled={
                  isLoadingInitial ||
                  !selectedLocationCode ||
                  !selectedProtectionCode ||
                  !selectedBrightnessCode ||
                  !selectedRefreshRateCode ||
                  pitchOptions.length === 0
                }
                required={true}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }} mt="md">
              <ModuleSelect
                options={moduleOptions}
                value={selectedModuleCode}
                onChange={handleModuleChange}
                disabled={
                  isLoadingInitial ||
                  !selectedLocationCode ||
                  !selectedBrightnessCode ||
                  !selectedRefreshRateCode ||
                  !selectedPitchCode ||
                  moduleOptions.length === 0
                }
                required={true}
              />
            </Grid.Col>

            {/* Правая колонка: либо Кабинет (если нужно), либо пустая */}
            {showCabinetSection ? (
              // Если кабинетный тип, показываем селект Кабинета
              <Grid.Col span={{ base: 12, md: 6 }} mt="md">
                <CabinetSelect
                  options={cabinetOptions}
                  value={selectedCabinetCode}
                  onChange={handleCabinetChange}
                  loading={isLoadingCabinets}
                  disabled={
                    !selectedLocationCode ||
                    !selectedMaterialCode ||
                    !selectedPitchCode ||
                    !selectedModuleCode ||
                    isLoadingCabinets
                  }
                  required={true}
                />
                {isErrorCabinets && (
                  <Text c="red" size="sm" mt="xs">
                    {" "}
                    Ошибка загрузки кабинетов:{" "}
                    {errorCabinets?.message ?? "Неизвестная ошибка"}{" "}
                  </Text>
                )}
              </Grid.Col>
            ) : (
              // Если НЕ кабинетный тип, рендерим пустую колонку для сохранения структуры
              <Grid.Col span={{ base: 0, md: 6 }} />
            )}
            <Grid.Col span={12} mt="md">
                      <Group grow preventGrowOverflow={false} align="flex-end" wrap="nowrap">
                          <DollarRateInput
                              value={dollarRate}
                              onChange={handleDollarRateChange}
                              disabled={isLoadingInitial}
                              loading={isLoadingDollarRate}
                              required={true}
                              size="sm" // Задаем размер
                              style={{ flexBasis: '150px', flexGrow: 0 }} // Ограничиваем ширину
                          />
                          <CalculateButton
                              onClick={handleCalculateClick}
                              loading={isCalculating}
                              disabled={!isCalculationReady}
                              size="sm" // Задаем ТОТ ЖЕ размер
                          />
                      </Group>
                  </Grid.Col>
          </Grid>
          {/* --- КОНЕЦ ОСНОВНОЙ СЕТКИ --- */}

          {/* --- Блок отладки --- */}
          {(selectedScreenTypeCode ||
            widthMm ||
            heightMm ||
            selectedLocationCode ||
            selectedMaterialCode ||
            selectedProtectionCode ||
            selectedBrightnessCode ||
            selectedRefreshRateCode ||
            selectedSensorCodes.length > 0 ||
            selectedControlTypeCodes.length > 0 ||
            selectedPitchCode ||
            selectedModuleCode ||
            (showCabinetSection && selectedCabinetCode) ||
            isFlexSelected ||
            dollarRate) && (
            <Stack
              gap={0}
              mt="xs"
              p="xs"
              style={{ border: "1px dashed #ccc", borderRadius: "4px" }}
            >
              <Text size="xs" c="dimmed">
                Отладка:
              </Text>
              {selectedScreenTypeCode && (
                <Text size="sm">Выбран тип: {selectedScreenTypeCode}</Text>
              )}
              {isFlexOptionAvailable && (
                <Text size="sm">
                  Гибкий экран: {isFlexSelected ? "Да" : "Нет"}
                </Text>
              )}
              {(widthMm || heightMm) && (
                <Text size="sm">
                  Размеры: {widthMm || "?"} x {heightMm || "?"} мм
                </Text>
              )}
              {selectedLocationCode && (
                <Text size="sm">Расположение: {selectedLocationCode}</Text>
              )}
              {selectedMaterialCode && showCabinetSection && (
                <Text size="sm">Материал: {selectedMaterialCode}</Text>
              )}{" "}
              {/* Показываем материал только для каб. */}
              {selectedProtectionCode && (
                <Text size="sm">Защита IP: {selectedProtectionCode}</Text>
              )}
              {selectedBrightnessCode && (
                <Text size="sm">
                  Яркость: {selectedBrightnessCode} (
                  {
                    brightnessOptions.find(
                      (o) => o.value === selectedBrightnessCode
                    )?.label
                  }
                  )
                </Text>
              )}
              {selectedRefreshRateCode && (
                <Text size="sm">
                  Частота: {selectedRefreshRateCode} (
                  {
                    refreshRateOptions.find(
                      (o) => o.value === selectedRefreshRateCode
                    )?.label
                  }
                  )
                </Text>
              )}
              {selectedSensorCodes.length > 0 && (
                <Text size="sm">Сенсоры: {selectedSensorCodes.join(", ")}</Text>
              )}
              {selectedControlTypeCodes.length > 0 && (
                <Text size="sm">
                  Типы управления: {selectedControlTypeCodes.join(", ")}
                </Text>
              )}
              {selectedPitchCode && (
                <Text size="sm">
                  Шаг пикселя: {selectedPitchCode} (
                  {
                    pitchOptions.find((o) => o.value === selectedPitchCode)
                      ?.label
                  }
                  )
                </Text>
              )}
              {selectedModuleCode && (
                <Text size="sm">
                  Модуль: {selectedModuleCode} (
                  {
                    moduleOptions.find((o) => o.value === selectedModuleCode)
                      ?.label
                  }
                  )
                </Text>
              )}
              {showCabinetSection && selectedCabinetCode && (
                <Text size="sm">
                  Кабинет: {selectedCabinetCode} (
                  {
                    cabinetOptions.find((o) => o.value === selectedCabinetCode)
                      ?.label
                  }
                  )
                </Text>
              )}
              <Text size="sm">Курс $: {dollarRate || "Не задан"}</Text>
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
          <Alert
            title="Критическая ошибка формы"
            color="red"
            radius="sm"
            withCloseButton
            onClose={resetErrorBoundary}
          >
            Произошла ошибка: {error?.message ?? "Неизвестная ошибка"}
            <Button
              onClick={resetErrorBoundary}
              variant="outline"
              color="red"
              size="xs"
              mt="sm"
            >
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
