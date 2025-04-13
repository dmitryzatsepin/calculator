// src/components/CalculatorForm.tsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Stack, Grid, LoadingOverlay, Alert, Text, Button } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { apiClient } from "../services/apiClient";
import { useQuery, QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

// --- Компоненты ---
import DimensionInputs from "./DimensionInputs";
import ScreenTypeSelector from "./ScreenTypeSelector";
import DependencySelectors from "./DependencySelectors";
import PitchControl from "./PitchControl";
import CabinetSelector from "./CabinetSelector";

// --- Импорты типов ---
import type {
  ScreenTypeLocationRelation, LocationMaterialRelation, PitchTypePitchRelation, ScreenTypePitchRelation,
  LocationPitchRelation, LocationCabinetRelation, MaterialCabinetRelation,
} from "../types/api";
import { ScreenType, Location, Material, IpProtection, Pitch, Cabinet } from "../types/api";

// --- Функции-запросы ---
const fetchScreenTypes = async (): Promise<ScreenType[]> => { const data = await apiClient.get<ScreenType[]>("/screen-types"); if (!Array.isArray(data)) throw new Error("Inv F: ST"); return data; };
const fetchIpProtections = async (): Promise<IpProtection[]> => { const data = await apiClient.get<IpProtection[]>("/ip-protection"); if (!Array.isArray(data)) throw new Error("Inv F: IP"); return data; };
const fetchPitches = async (): Promise<Pitch[]> => { const data = await apiClient.get<Pitch[]>("/pitches"); if (!Array.isArray(data)) throw new Error("Inv F: P"); return data; };
const fetchCabinets = async (): Promise<Cabinet[]> => { const data = await apiClient.get<Cabinet[]>("/cabinets"); if (!Array.isArray(data)) throw new Error("Inv F: C"); return data; };
const fetchStlRelations = async (): Promise<ScreenTypeLocationRelation[]> => { const data = await apiClient.get<ScreenTypeLocationRelation[]>("/screen-type-locations"); if (!Array.isArray(data)) throw new Error("Inv F: STLR"); return data; };
const fetchLmRelations = async (): Promise<LocationMaterialRelation[]> => { const data = await apiClient.get<LocationMaterialRelation[]>("/location-materials"); if (!Array.isArray(data)) throw new Error("Inv F: LMR"); return data; };
const fetchPtpRelations = async (): Promise<PitchTypePitchRelation[]> => { const data = await apiClient.get<PitchTypePitchRelation[]>("/pitch-type-pitches"); if (!Array.isArray(data)) throw new Error("Inv F: PTPR"); return data; };
const fetchStpRelations = async (): Promise<ScreenTypePitchRelation[]> => { const data = await apiClient.get<ScreenTypePitchRelation[]>("/screen-type-pitches"); if (!Array.isArray(data)) throw new Error("Inv F: STPR"); return data; };
const fetchLpRelations = async (): Promise<LocationPitchRelation[]> => { const data = await apiClient.get<LocationPitchRelation[]>("/location-pitches"); if (!Array.isArray(data)) throw new Error("Inv F: LPR"); return data; };
const fetchLcRelations = async (): Promise<LocationCabinetRelation[]> => { const data = await apiClient.get<LocationCabinetRelation[]>("/location-cabinets"); if (!Array.isArray(data)) throw new Error("Inv F: LCR"); return data; };
const fetchMcRelations = async (): Promise<MaterialCabinetRelation[]> => { const data = await apiClient.get<MaterialCabinetRelation[]>("/material-cabinets"); if (!Array.isArray(data)) throw new Error("Inv F: MCR"); return data; };

// --- ЧИСТЫЕ ФУНКЦИИ ФИЛЬТРАЦИИ ---
const filterLocations = (screenTypeCode: string | null, relations: ScreenTypeLocationRelation[]): Location[] => { if (!screenTypeCode) return []; try { const screenTypeCodeLower = screenTypeCode.toLowerCase(); const relatedLocations = relations.filter(rel => rel.screenType?.code?.toLowerCase() === screenTypeCodeLower && rel.location).map(rel => rel.location!); return Array.from(new Map(relatedLocations.map(loc => [loc.id, loc])).values()); } catch (error) { console.error("Error filtering locations:", error); return []; } };
const filterMaterials = (locationCode: string | null, relations: LocationMaterialRelation[]): Material[] => { if (!locationCode) return []; try { const locationCodeLower = locationCode.toLowerCase(); const relatedMaterials = relations.filter(rel => rel.location?.code?.toLowerCase() === locationCodeLower && rel.material).map(rel => rel.material!); return Array.from(new Map(relatedMaterials.map(mat => [mat.id, mat])).values()); } catch (error) { console.error("Error filtering materials:", error); return []; } };
const filterPitches = (screenTypeCode: string | null, locationCode: string | null, isPro: boolean, allPitches: Pitch[], ptpRelations: PitchTypePitchRelation[], stpRelations: ScreenTypePitchRelation[], lpRelations: LocationPitchRelation[]): Pitch[] => { if (!screenTypeCode || !locationCode || !allPitches || !ptpRelations || !stpRelations || !lpRelations) { return []; } try { const targetPitchTypeName = (isPro ? "pro" : "eco").toLowerCase(); const selScreenTypeLower = screenTypeCode.toLowerCase(); const selLocationLower = locationCode.toLowerCase(); const allowedByScreenType = new Set(stpRelations.filter(rel => rel.screenType?.code?.toLowerCase() === selScreenTypeLower && rel.pitch?.code).map(rel => rel.pitch!.code!.toLowerCase())); if (allowedByScreenType.size === 0) return []; const allowedByLocation = new Set(lpRelations.filter(rel => rel.location?.code?.toLowerCase() === selLocationLower && rel.pitch?.code).map(rel => rel.pitch!.code!.toLowerCase())); if (allowedByLocation.size === 0) return []; const allowedByPitchType = new Set(ptpRelations.filter(rel => rel.pitchTypeName?.toLowerCase() === targetPitchTypeName && rel.pitch?.code).map(rel => rel.pitch!.code!.toLowerCase())); if (allowedByPitchType.size === 0) return []; return allPitches.filter((pitch) => { const pitchCodeLower = pitch.code?.toLowerCase(); if (!pitchCodeLower) return false; return (allowedByScreenType.has(pitchCodeLower) && allowedByLocation.has(pitchCodeLower) && allowedByPitchType.has(pitchCodeLower)); }); } catch (error) { console.error("Error filtering pitches:", error); return []; } };
const filterCabinets = (locationCode: string | null, materialCode: string | null, allCabinets: Cabinet[], lcRelations: LocationCabinetRelation[], mcRelations: MaterialCabinetRelation[]): Cabinet[] => { if (!locationCode || !materialCode || !allCabinets || !lcRelations || !mcRelations) { return []; } try { const locationLower = locationCode.toLowerCase(); const materialLower = materialCode.toLowerCase(); const cabinetsByLocation = new Set<string>(); lcRelations.forEach(rel => { if (rel.location?.code?.toLowerCase() === locationLower && rel.cabinet?.sku) cabinetsByLocation.add(rel.cabinet.sku.toLowerCase()); }); if (cabinetsByLocation.size === 0) { return []; } const cabinetsByMaterial = new Set<string>(); mcRelations.forEach(rel => { if (rel.material?.code?.toLowerCase() === materialLower && rel.cabinet?.sku) cabinetsByMaterial.add(rel.cabinet.sku.toLowerCase()); }); if (cabinetsByMaterial.size === 0) { return []; } const finalCabinetSkus = new Set<string>(); cabinetsByLocation.forEach(cabinetSku => { if (cabinetsByMaterial.has(cabinetSku)) finalCabinetSkus.add(cabinetSku); }); return allCabinets.filter(cabinet => cabinet.sku && finalCabinetSkus.has(cabinet.sku.toLowerCase())); } catch (error) { console.error("Error filtering cabinets:", error); return []; } };


// --- КОМПОНЕНТ ---
const CalculatorForm = () => {
  // --- Состояния размеров ---
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");

  // --- Запросы ---
  const { data: screenTypes = [], isLoading: isLoadingScreenTypes, isError: isErrorScreenTypes, error: errorScreenTypes } = useQuery<ScreenType[], Error>({ queryKey: ['screenTypes'], queryFn: fetchScreenTypes });
  const { data: ipProtections = [], isLoading: isLoadingIpProtections, isError: isErrorIpProtections, error: errorIpProtections } = useQuery<IpProtection[], Error>({ queryKey: ['ipProtections'], queryFn: fetchIpProtections });
  const { data: allPitches = [], isLoading: isLoadingPitches, isError: isErrorPitches, error: errorPitches } = useQuery<Pitch[], Error>({ queryKey: ['pitches'], queryFn: fetchPitches });
  const { data: allCabinets = [], isLoading: isLoadingCabinets, isError: isErrorCabinets, error: errorCabinets } = useQuery<Cabinet[], Error>({ queryKey: ['cabinets'], queryFn: fetchCabinets });
  const { data: stlRelations = [], isLoading: isLoadingStlRelations, isError: isErrorStlRelations, error: errorStlRelations } = useQuery<ScreenTypeLocationRelation[], Error>({ queryKey: ['stlRelations'], queryFn: fetchStlRelations });
  const { data: lmRelations = [], isLoading: isLoadingLmRelations, isError: isErrorLmRelations, error: errorLmRelations } = useQuery<LocationMaterialRelation[], Error>({ queryKey: ['lmRelations'], queryFn: fetchLmRelations });
  const { data: ptpRelations = [], isLoading: isLoadingPtpRelations, isError: isErrorPtpRelations, error: errorPtpRelations } = useQuery<PitchTypePitchRelation[], Error>({ queryKey: ['ptpRelations'], queryFn: fetchPtpRelations });
  const { data: stpRelations = [], isLoading: isLoadingStpRelations, isError: isErrorStpRelations, error: errorStpRelations } = useQuery<ScreenTypePitchRelation[], Error>({ queryKey: ['stpRelations'], queryFn: fetchStpRelations });
  const { data: lpRelations = [], isLoading: isLoadingLpRelations, isError: isErrorLpRelations, error: errorLpRelations } = useQuery<LocationPitchRelation[], Error>({ queryKey: ['lpRelations'], queryFn: fetchLpRelations });
  const { data: lcRelations = [], isLoading: isLoadingLcRelations, isError: isErrorLcRelations, error: errorLcRelations } = useQuery<LocationCabinetRelation[], Error>({ queryKey: ['lcRelations'], queryFn: fetchLcRelations });
  const { data: mcRelations = [], isLoading: isLoadingMcRelations, isError: isErrorMcRelations, error: errorMcRelations } = useQuery<MaterialCabinetRelation[], Error>({ queryKey: ['mcRelations'], queryFn: fetchMcRelations });

  // --- Состояния для выбранных значений ---
  const [selectedScreenTypeCode, setSelectedScreenTypeCode] = useState<string | null>(null);
  const [selectedLocationCode, setSelectedLocationCode] = useState<string | null>(null);
  const [selectedMaterialCode, setSelectedMaterialCode] = useState<string | null>(null);
  const [selectedProtectionCode, setSelectedProtectionCode] = useState<string | null>(null);
  const [isProPitchType, setIsProPitchType] = useState<boolean>(false);
  const [selectedPitchCode, setSelectedPitchCode] = useState<string | null>(null);
  const [selectedCabinetSku, setSelectedCabinetSku] = useState<string | null>(null);

  // --- Состояния для расчетных полей ---
  const [selectedRefreshRate, setSelectedRefreshRate] = useState<number | null>(null);
  const [selectedBrightness, setSelectedBrightness] = useState<number | null>(null);

  // --- Удаляем состояния ошибок фильтрации ---
  // const [locationError, setLocationError] = useState<string | null>(null);
  // const [materialError, setMaterialError] = useState<string | null>(null);
  // const [cabinetsFilterError, setCabinetsFilterError] = useState<string | null>(null); // <-- УДАЛЕНО

  // --- Вспомогательные рефы ---
  const prevIsPitchControlDisabledRef = useRef<boolean | undefined>(undefined);
  const didInitialize = useRef(false);

  // --- Вычисляем общие состояния загрузки/ошибки ---
  const isOverallLoading = isLoadingScreenTypes || isLoadingIpProtections || isLoadingPitches || isLoadingCabinets || isLoadingStlRelations || isLoadingLmRelations || isLoadingPtpRelations || isLoadingStpRelations || isLoadingLpRelations || isLoadingLcRelations || isLoadingMcRelations;
  const allErrors = [ errorScreenTypes, errorIpProtections, errorPitches, errorCabinets, errorStlRelations, errorLmRelations, errorPtpRelations, errorStpRelations, errorLpRelations, errorLcRelations, errorMcRelations ].filter((e): e is Error => e != null);
  const hasOverallError = isErrorScreenTypes || isErrorIpProtections || isErrorPitches || isErrorCabinets || isErrorStlRelations || isErrorLmRelations || isErrorPtpRelations || isErrorStpRelations || isErrorLpRelations || isErrorLcRelations || isErrorMcRelations;
  const overallErrorString = allErrors.length > 0 ? "Ошибки загрузки данных: " + allErrors.map(e => e.message).join('; ') : null;
  const isUIBlocked = isOverallLoading || hasOverallError;

  // --- Вычисление производных данных (доступные опции) ---
  const availableLocations = useMemo(() : Location[] => {
      return filterLocations(selectedScreenTypeCode, stlRelations);
  }, [selectedScreenTypeCode, stlRelations]);

  const availableMaterials = useMemo(() : Material[] => {
      return filterMaterials(selectedLocationCode, lmRelations);
  }, [selectedLocationCode, lmRelations]);


  // --- Инициализация значений по умолчанию (один раз после загрузки) ---
  useEffect(() => {
    if (!isOverallLoading && !didInitialize.current) {
      didInitialize.current = true;

      let initialScreenType = selectedScreenTypeCode;
      let initialLocation: string | null = null;
      let initialMaterial: string | null = null;
      let initialProtection: string | null = null;

      // 1. Определить и установить ScreenType
      if (!initialScreenType && screenTypes.length > 0) {
        const defaultScreenTypeCode = 'cabinet';
        const defaultScreenType = screenTypes.find(st => st.code?.toLowerCase() === defaultScreenTypeCode.toLowerCase());
        if (defaultScreenType) { initialScreenType = defaultScreenType.code; }
        else { console.warn(`Default ST code '${defaultScreenTypeCode}' not found.`); }
        setSelectedScreenTypeCode(initialScreenType);
      }

      // 2. Вычислить availableLocations и определить Location
      const initialAvailableLocations = filterLocations(initialScreenType, stlRelations);
      if (initialAvailableLocations.length === 1) {
          initialLocation = initialAvailableLocations[0].code;
          setSelectedLocationCode(initialLocation);
      }

      // 3. Вычислить availableMaterials и определить Material
      const initialAvailableMaterials = filterMaterials(initialLocation, lmRelations);
      if (initialAvailableMaterials.length === 1) {
          initialMaterial = initialAvailableMaterials[0].code;
          setSelectedMaterialCode(initialMaterial);
      }

      // 4. Определить и установить Protection
      if (initialLocation) {
        const locationCodeLower = initialLocation.toLowerCase();
        if (locationCodeLower === "indoor") initialProtection = "IP30";
        else if (locationCodeLower === "outdoor") initialProtection = "IP65";
        const protectionExists = ipProtections.some(p => p.code === initialProtection);
        if (!protectionExists) initialProtection = null;
        setSelectedProtectionCode(initialProtection);
      }
    }
  }, [isOverallLoading, screenTypes, stlRelations, lmRelations, ipProtections]);


  // --- Установка Protection (при РУЧНОМ изменении Location) ---
  useEffect(() => {
    if (isOverallLoading || didInitialize.current === false || isLoadingIpProtections || !selectedLocationCode) {
        if (!selectedLocationCode && selectedProtectionCode !== null && !isOverallLoading && didInitialize.current === true) {
             setSelectedProtectionCode(null);
        }
        return;
    }
    let newProtectionCode: string | null = null;
    const locationCodeLower = selectedLocationCode.toLowerCase();
    if (locationCodeLower === "indoor") newProtectionCode = "IP30"; else if (locationCodeLower === "outdoor") newProtectionCode = "IP65";
    const protectionExists = ipProtections.some(p => p.code === newProtectionCode);
    if (!protectionExists) newProtectionCode = null;
    if (selectedProtectionCode !== newProtectionCode) { setSelectedProtectionCode(newProtectionCode); }
  }, [selectedLocationCode, ipProtections, isLoadingIpProtections, isOverallLoading, selectedProtectionCode]);


  // --- Вычисление disabled статусов ---
  const hasValidDimensions = width.trim() !== "" && parseFloat(width) > 0 && height.trim() !== "" && parseFloat(height) > 0;
  const isLocationSelectDisabled = isUIBlocked || !selectedScreenTypeCode || !hasValidDimensions;
  const isMaterialSelectDisabled = isLocationSelectDisabled || !selectedLocationCode;
  const isProtectionSelectDisabled = isLocationSelectDisabled || !selectedLocationCode || isLoadingIpProtections || isErrorIpProtections;
  const isPitchControlDisabled = isMaterialSelectDisabled || !selectedMaterialCode || isProtectionSelectDisabled || !selectedProtectionCode;


  // --- МЕМОИЗИРОВАННЫЙ ФИЛЬТР ПИТЧЕЙ ---
  const filteredPitches = useMemo(() => {
      return filterPitches(selectedScreenTypeCode, selectedLocationCode, isProPitchType, allPitches, ptpRelations, stpRelations, lpRelations);
  }, [selectedScreenTypeCode, selectedLocationCode, isProPitchType, allPitches, ptpRelations, stpRelations, lpRelations]);

  const filteredPitchOptions = useMemo(() => {
      const controlDisabled = isMaterialSelectDisabled || !selectedMaterialCode || isProtectionSelectDisabled || !selectedProtectionCode;
      if (controlDisabled || isUIBlocked) return [];
      return filteredPitches.map((p) => ({ value: p.code, label: p.code }));
  }, [filteredPitches, isMaterialSelectDisabled, selectedMaterialCode, isProtectionSelectDisabled, selectedProtectionCode, isUIBlocked]);

  // Удаляем isPitchSelectDisabled
  // const isPitchSelectDisabled = isPitchControlDisabled || isUIBlocked || filteredPitchOptions.length === 0;


  // --- МЕМОИЗАЦИЯ: ФИЛЬТРАЦИЯ ДОСТУПНЫХ КАБИНЕТОВ ---
  const availableCabinets = useMemo((): Cabinet[] => {
      return filterCabinets(selectedLocationCode, selectedMaterialCode, allCabinets, lcRelations, mcRelations);
  }, [selectedLocationCode, selectedMaterialCode, allCabinets, lcRelations, mcRelations]);

  const cabinetOptions = useMemo(() => availableCabinets.map(cab => ({ value: cab.sku, label: (cab.name && cab.name.trim() !== '') ? cab.name : cab.sku })), [availableCabinets]);
  // Удаляем isCabinetSelectDisabledFinal
  // const isCabinetSelectDisabledFinal = isPitchControlDisabled || !selectedPitchCode || isUIBlocked || /* !!cabinetsFilterError || */ (!isOverallLoading && availableCabinets.length === 0);


  // --- Установка/Сброс Rate/Brightness --- (без изменений)
  useEffect(() => {
    const wasDisabled = prevIsPitchControlDisabledRef.current; const isDisabledNow = isPitchControlDisabled;
    if (!isOverallLoading) { if (wasDisabled === true && isDisabledNow === false) { const rate = isProPitchType ? 3840 : 1920; const bright = isProPitchType ? 6000 : 800; setSelectedRefreshRate(rate); setSelectedBrightness(bright); } else if (isDisabledNow === true && wasDisabled === false) { setSelectedRefreshRate(null); setSelectedBrightness(null); } }
    prevIsPitchControlDisabledRef.current = isDisabledNow;
  }, [isPitchControlDisabled, isProPitchType, isOverallLoading]);

  // --- Обновление Rate/Brightness --- (без изменений)
  useEffect(() => {
    if (!isPitchControlDisabled && !isOverallLoading) { const rate = isProPitchType ? 3840 : 1920; const bright = isProPitchType ? 6000 : 800; if (selectedRefreshRate !== rate) setSelectedRefreshRate(rate); if (selectedBrightness !== bright) setSelectedBrightness(bright); }
  }, [isProPitchType, isPitchControlDisabled, isOverallLoading, selectedRefreshRate, selectedBrightness]);


  // --- Обработчики (useCallback) ---
  // Убираем вызовы set...Error
  const handleScreenTypeChange = useCallback((value: string | null) => {
      setSelectedScreenTypeCode(value);
      setSelectedLocationCode(null); setSelectedMaterialCode(null); setSelectedProtectionCode(null);
      setIsProPitchType(false); setSelectedPitchCode(null); setSelectedCabinetSku(null);
      setSelectedRefreshRate(null); setSelectedBrightness(null);
  }, []);

  const handleLocationChange = useCallback((value: string | null) => {
      setSelectedLocationCode(value);
      setSelectedMaterialCode(null); setSelectedProtectionCode(null);
      setIsProPitchType(false); setSelectedPitchCode(null); setSelectedCabinetSku(null);
  }, []);

  const handleMaterialChange = useCallback((value: string | null) => {
      setSelectedMaterialCode(value);
      setIsProPitchType(false); setSelectedPitchCode(null); setSelectedCabinetSku(null);
   }, []);

   const handleProtectionChange = useCallback((value: string | null) => {
      setSelectedProtectionCode(value);
      setIsProPitchType(false); setSelectedPitchCode(null); setSelectedCabinetSku(null);
   }, []);

   const handlePitchTypeSwitchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
       setIsProPitchType(event.currentTarget.checked);
       setSelectedPitchCode(null); setSelectedCabinetSku(null);
   }, []);

   const handlePitchChange = useCallback((value: string | null) => {
       setSelectedPitchCode(value);
       setSelectedCabinetSku(null);
   }, []);

   const handleCabinetChange = useCallback((value: string | null) => { setSelectedCabinetSku(value); }, []);


  // --- Подготовка данных для Select --- (без изменений)
  const screenTypeSegments = useMemo(() => screenTypes.map((st) => ({ value: st.code, label: st.name })), [screenTypes]);
  const locationOptions = useMemo(() => availableLocations.map((loc) => ({ value: loc.code, label: loc.name })), [availableLocations]);
  const materialOptions = useMemo(() => availableMaterials.map((mat) => ({ value: mat.code, label: mat.name })), [availableMaterials]);
  const protectionOptions = useMemo(() => ipProtections.map((ip) => ({ value: ip.code, label: ip.code })), [ipProtections]);

  // --- JSX ---
  return (
    <Stack gap="md">
      <LoadingOverlay visible={isOverallLoading} overlayProps={{ radius: "sm", blur: 2 }} />
      {isOverallLoading && <Text ta="center" mb="xl">Загрузка конфигурации...</Text>}
      {!isOverallLoading && hasOverallError && (<Alert title="Ошибка загрузки данных" color="red" icon={<IconAlertCircle size={16} />} radius="sm" mb="xl">{overallErrorString}</Alert>)}
      {!isOverallLoading && !hasOverallError && (<ScreenTypeSelector data={screenTypeSegments} value={selectedScreenTypeCode} onChange={handleScreenTypeChange} disabled={isUIBlocked}/>)}
      <Grid>
        <DimensionInputs width={width} height={height} onWidthChange={setWidth} onHeightChange={setHeight} disabled={isOverallLoading} />
        {/* Передаем DependencySelectors без locationError, materialError */}
        <DependencySelectors
          isUIBlocked={isUIBlocked}
          isLoadingIpProtections={isLoadingIpProtections}
          isErrorIpProtections={isErrorIpProtections}
          hasValidDimensions={hasValidDimensions}
          selectedScreenTypeCode={selectedScreenTypeCode}
          // selectedLocationCode НЕ ПЕРЕДАЕМ
          currentLocationCode={selectedLocationCode}
          currentMaterialCode={selectedMaterialCode}
          currentProtectionCode={selectedProtectionCode}
          locationOptions={locationOptions}
          materialOptions={materialOptions}
          protectionOptions={protectionOptions}
          locationError={null} materialError={null} // Убрали
          onLocationChange={handleLocationChange}
          onMaterialChange={handleMaterialChange}
          onProtectionChange={handleProtectionChange}
        />
         {/* Передаем PitchControl без isPitchSelectDisabled */}
        <PitchControl
          isUIBlocked={isUIBlocked}
          selectedMaterialCode={selectedMaterialCode}
          selectedProtectionCode={selectedProtectionCode}
          isProPitchType={isProPitchType}
          selectedPitchCode={selectedPitchCode}
          selectedRefreshRate={selectedRefreshRate}
          selectedBrightness={selectedBrightness}
          pitchOptions={filteredPitchOptions}
          onPitchTypeChange={handlePitchTypeSwitchChange}
          onPitchChange={handlePitchChange}
        />
        {/* Передаем CabinetSelector без disabled и filterError */}
        <CabinetSelector
           isUIBlocked={isUIBlocked}
           overallErrorString={overallErrorString}
           selectedPitchCode={selectedPitchCode}
           selectedMaterialCode={selectedMaterialCode}
           value={selectedCabinetSku}
           options={cabinetOptions}
           filterError={null} // Убрали
           onChange={handleCabinetChange}
        />
      </Grid>
    </Stack>
  );
};

// Обертка с ErrorBoundary (ТОЧНО ИСПРАВЛЕНА!)
const CalculatorFormWrapper = () => (
  <QueryErrorResetBoundary>
    {( { reset } ) => ( // ПРАВИЛЬНЫЙ СИНТАКСИС RENDER PROP
      <ErrorBoundary
        onReset={reset}
        fallbackRender={({ error, resetErrorBoundary }: FallbackProps) => (
          <Alert title="Критическая ошибка формы" color="red" radius="sm" withCloseButton onClose={resetErrorBoundary}>
            Произошла ошибка: {error.message}
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