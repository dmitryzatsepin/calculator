import { useCallback, useMemo, useEffect } from "react";
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

import DimensionInputs from "../inputs/DimensionInputs";
import ScreenTypeSelector from "../inputs/ScreenTypeSelector";
import LocationSelect from "../inputs/LocationSelect";
import MaterialSelect from "../inputs/MaterialSelect";
import IpProtectionSelect from "../inputs/IpProtectionSelect";
import SensorCheckboxGroup from "../inputs/SensorCheckboxGroup";
import ControlTypeCheckboxGroup from "../inputs/ControlTypeCheckboxGroup";
import PitchSelect from "../inputs/PitchSelect";
import CabinetSelect from "../inputs/CabinetSelect";
import FlexOptionSwitch from "../inputs/FlexOptionSwitch";
import DollarRateInput from "../inputs/DollarRateInput";
import CalculateButton from "../inputs/CalculateButton";
import ProVersionSwitch from "../inputs/ProVersionSwitch";

import { useCalculatorForm } from "../../context/CalculatorFormProvider";
import { useCalculatorData } from "../../context/CalculatorDataProvider";
import { useCalculationResult } from "../../context/CalculationResultProvider";

const CalculatorForm = () => {
  const {
    selectedScreenTypeCode,
    selectedLocationCode,
    selectedMaterialCode,
    selectedProtectionCode,
    selectedSensorCodes,
    selectedControlTypeCodes,
    selectedPitchCode,
    selectedCabinetCode,
    isFlexSelected,
    isProVersionSelected,
    widthMm,
    heightMm,
    localDollarRateInput,
    setSelectedScreenTypeCode,
    setSelectedLocationCode,
    setSelectedMaterialCode,
    setSelectedProtectionCode,
    setSelectedSensorCodes,
    setSelectedControlTypeCodes,
    setSelectedPitchCode,
    setSelectedCabinetCode,
    setIsFlexSelected,
    setIsProVersionSelected,
    setWidthMm,
    setHeightMm,
    setLocalDollarRateInput,
  } = useCalculatorForm();

  const {
    isLoadingInitialData,
    isErrorInitialData,
    errorInitialData,
    isLoadingPitches,
    isErrorPitches,
    errorPitches,
    isLoadingModules,
    isLoadingCabinets,
    isErrorCabinets,
    errorCabinets,
    isLoadingDollarRate,
    hasProOption,
    dollarRateValue,
    screenTypeSegments,
    locationSelectOptions,
    materialSelectOptions,
    protectionSelectOptions,
    sensorSelectOptions,
    controlTypeSelectOptions,
    pitchSelectOptions,
    cabinetSelectOptions,
    isFlexOptionAvailableForSelectedScreenType,
  } = useCalculatorData();

  const {
    isCalculating,
    isCalculationReady,
    performCalculation,
  } = useCalculationResult();

  useEffect(() => {
    if (typeof dollarRateValue === 'number' && dollarRateValue > 0) {
      setLocalDollarRateInput(dollarRateValue);
    }
  }, [dollarRateValue, setLocalDollarRateInput]);

  const areDimensionsEntered = useMemo(() => {
    return +widthMm > 0 && +heightMm > 0;
  }, [widthMm, heightMm]);

  const cabinetScreenTypeCode = "cabinet";
  const showCabinetSection = selectedScreenTypeCode === cabinetScreenTypeCode;

  const handleScreenTypeChange = useCallback((value: string | null) => setSelectedScreenTypeCode(value), [setSelectedScreenTypeCode]);
  const handleLocationChange = useCallback((value: string | null) => setSelectedLocationCode(value), [setSelectedLocationCode]);
  const handleMaterialChange = useCallback((value: string | null) => setSelectedMaterialCode(value), [setSelectedMaterialCode]);
  const handleProtectionChange = useCallback((value: string | null) => setSelectedProtectionCode(value), [setSelectedProtectionCode]);
  const handleSensorChange = useCallback((value: string[]) => setSelectedSensorCodes(value), [setSelectedSensorCodes]);
  const handleControlTypeChange = useCallback((value: string[]) => setSelectedControlTypeCodes(value), [setSelectedControlTypeCodes]);
  const handlePitchChange = useCallback((value: string | null) => setSelectedPitchCode(value), [setSelectedPitchCode]);
  const handleProVersionChange = useCallback((checked: boolean) => setIsProVersionSelected(checked), [setIsProVersionSelected]);
  const handleCabinetChange = useCallback((value: string | null) => setSelectedCabinetCode(value), [setSelectedCabinetCode]);
  const handleFlexChange = useCallback((checked: boolean) => setIsFlexSelected(checked), [setIsFlexSelected]);
  const handleDollarRateChange = useCallback((value: number | string) => setLocalDollarRateInput(value), [setLocalDollarRateInput]);
  const handleCalculateClick = useCallback(() => performCalculation(), [performCalculation]);

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
          {isFlexOptionAvailableForSelectedScreenType && (
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
                  disabled={
                    isLoadingInitialData ||
                    !selectedScreenTypeCode ||
                    !areDimensionsEntered || // <-- ВАШЕ НОВОЕ УСЛОВИЕ
                    locationSelectOptions.length === 0
                  }
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

            <Grid.Col span={12}>
              {/* Используем вложенную сетку для точного контроля пропорций и выравнивания */}
              <Grid mt="md" align="center" gutter="xl">
                <Grid.Col span={4}>
                  <PitchSelect
                    options={pitchSelectOptions}
                    value={selectedPitchCode}
                    onChange={handlePitchChange}
                    disabled={
                      isLoadingInitialData ||
                      !areDimensionsEntered ||
                      !selectedLocationCode ||
                      !selectedProtectionCode ||
                      (showCabinetSection && !selectedMaterialCode) ||
                      isLoadingPitches ||
                      pitchSelectOptions.length === 0
                    }
                    loading={isLoadingPitches}
                    required={true}
                    placeholder={!selectedLocationCode ? "Сначала выберите расположение" : isLoadingPitches ? "Загрузка..." : "Выберите шаг пикселя"}
                  />
                </Grid.Col>

                <Grid.Col
                  span={2}
                  style={{
                    marginTop: '20px'
                  }}
                >
                  <ProVersionSwitch
                    checked={isProVersionSelected}
                    onChange={handleProVersionChange}
                    disabled={!hasProOption || isLoadingModules}
                  />
                </Grid.Col>

                {showCabinetSection && (
                  <Grid.Col span={6}>
                    <CabinetSelect
                      options={cabinetSelectOptions}
                      value={selectedCabinetCode}
                      onChange={handleCabinetChange}
                      loading={isLoadingModules || isLoadingCabinets}
                      disabled={!selectedPitchCode || isLoadingModules || isLoadingCabinets}
                      required={true}
                    />
                  </Grid.Col>
                )}
              </Grid>
              {isErrorPitches && (<Text c="red" size="sm" mt="xs"> Ошибка загрузки шагов пикселя: {errorPitches?.message ?? "Неизвестная ошибка"} </Text>)}
              {isErrorCabinets && (<Text c="red" size="sm" mt="xs"> Ошибка загрузки кабинетов: {errorCabinets?.message ?? "Неизвестная ошибка"} </Text>)}
            </Grid.Col>

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