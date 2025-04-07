// src/components/CalculatorForm.tsx
import { useState, useEffect, useMemo } from 'react'; 
import {
  Stack,
  Grid,
  TextInput, 
  Select,
  LoadingOverlay,
  Alert,     
  SegmentedControl, 
  Box, 
  Text,      
  Switch,
  SimpleGrid, 
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react'; 
import { apiClient } from '../services/apiClient'; 
import { 
    ScreenType, Location, ScreenTypeLocationRelation, 
    Material, LocationMaterialRelation, IpProtection,
    PitchType, Pitch, 
    PitchTypePitchRelation, ScreenTypePitchRelation, LocationPitchRelation 
} from '../types/api'; 

const CalculatorForm = () => {
  // --- Состояния ---
  const [width, setWidth] = useState<string>(''); 
  const [height, setHeight] = useState<string>(''); 
  const [screenTypes, setScreenTypes] = useState<ScreenType[]>([]); 
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]); 
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]); 
  const [ipProtections, setIpProtections] = useState<IpProtection[]>([]); 
  const [allPitches, setAllPitches] = useState<Pitch[]>([]);         
  const [pitchTypePitchRelations, setPitchTypePitchRelations] = useState<PitchTypePitchRelation[]>([]); 
  const [screenTypePitchRelations, setScreenTypePitchRelations] = useState<ScreenTypePitchRelation[]>([]); 
  const [locationPitchRelations, setLocationPitchRelations] = useState<LocationPitchRelation[]>([]);     

  // --- Выбранные значения ---
  const [selectedScreenTypeCode, setSelectedScreenTypeCode] = useState<string | null>(null); 
  const [selectedLocationCode, setSelectedLocationCode] = useState<string | null>(null); 
  const [selectedMaterialCode, setSelectedMaterialCode] = useState<string | null>(null); 
  const [selectedProtectionCode, setSelectedProtectionCode] = useState<string | null>(null); 
  const [isProPitchType, setIsProPitchType] = useState<boolean>(false); // true = pro, false = eco
  const [selectedPitchCode, setSelectedPitchCode] = useState<string | null>(null);       
  const [selectedRefreshRate, setSelectedRefreshRate] = useState<number | null>(null); 
  const [selectedBrightness, setSelectedBrightness] = useState<number | null>(null);   

  // --- Состояния загрузки ---
  const [loadingScreenTypes, setLoadingScreenTypes] = useState<boolean>(true); 
  const [loadingLocations, setLoadingLocations] = useState<boolean>(false);
  const [loadingMaterials, setLoadingMaterials] = useState<boolean>(false); 
  const [loadingProtections, setLoadingProtections] = useState<boolean>(true); 
  const [loadingPitchesAndRelations, setLoadingPitchesAndRelations] = useState<boolean>(true); 
  
  // --- Состояния ошибок ---
  const [screenTypeError, setScreenTypeError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [materialError, setMaterialError] = useState<string | null>(null); 
  const [protectionError, setProtectionError] = useState<string | null>(null); 
  const [pitchTypeError, setPitchTypeError] = useState<string | null>(null);       
  const [pitchError, setPitchError] = useState<string | null>(null);               
  
  const [initialBaseLoadComplete, setInitialBaseLoadComplete] = useState<boolean>(false); 
  
  // Флаги загрузки
  const isInitialLoading = loadingScreenTypes || loadingProtections || loadingPitchesAndRelations; 

  // --- Загрузка ВСЕХ НЕЗАВИСИМЫХ справочников и связей Pitch ---
  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
        setLoadingScreenTypes(true); setLoadingProtections(true); setLoadingPitchesAndRelations(true);
        setInitialBaseLoadComplete(false); 
        try {
            const [ screenTypeRes, ipProtectionRes, pitchTypeRes, pitchRes, 
                    ptpRelationsRes, stpRelationsRes, lpRelationsRes 
            ] = await Promise.all([
                apiClient.get<ScreenType[]>('/screen-types'),
                apiClient.get<IpProtection[]>('/ip-protection'),
                apiClient.get<PitchType[]>('/pitch-types'),
                apiClient.get<Pitch[]>('/pitches'), 
                apiClient.get<PitchTypePitchRelation[]>('/pitch-type-pitches'),   
                apiClient.get<ScreenTypePitchRelation[]>('/screen-type-pitches'), 
                apiClient.get<LocationPitchRelation[]>('/location-pitches')     
            ]);
            if (!isMounted) return; 

            if (Array.isArray(screenTypeRes)) { setScreenTypes(screenTypeRes); if (!selectedScreenTypeCode && screenTypeRes[0]?.code) setSelectedScreenTypeCode(screenTypeRes[0].code); } 
            else { setScreenTypeError('Format Error (ScreenType)'); }

            if (Array.isArray(ipProtectionRes)) { setIpProtections(ipProtectionRes); } 
            else { setProtectionError('Format Error (IpProtection)'); }

            if (!Array.isArray(pitchTypeRes)) { setPitchTypeError('Format Error (PitchType)'); }

            if (Array.isArray(pitchRes)) { setAllPitches(pitchRes); } 
            else { setPitchError('Format Error (Pitch)'); }

            if (Array.isArray(ptpRelationsRes)) { setPitchTypePitchRelations(ptpRelationsRes); } 
            else { setPitchError(pitchError || 'Format Error (PTP Relations)'); }
            if (Array.isArray(stpRelationsRes)) { setScreenTypePitchRelations(stpRelationsRes); } 
            else { setPitchError(pitchError || 'Format Error (STP Relations)'); }
            if (Array.isArray(lpRelationsRes)) { setLocationPitchRelations(lpRelationsRes); } 
            else { setPitchError(pitchError || 'Format Error (LP Relations)'); }

        } catch (error: any) { 
            if (!isMounted) return;
             setScreenTypeError(error.message); setProtectionError(error.message);
             setPitchTypeError(error.message); setPitchError(error.message);
        } 
        finally {
            if (isMounted) {
                setLoadingScreenTypes(false); setLoadingProtections(false); setLoadingPitchesAndRelations(false);
                setInitialBaseLoadComplete(true); 
            }
        }
    };
    loadInitialData();
    return () => { isMounted = false; };
  }, []); 

  // --- Загрузка Locations ---
  useEffect(() => {
     let isMounted = true;
    if (!initialBaseLoadComplete || !selectedScreenTypeCode) {
        setAvailableLocations([]); setSelectedLocationCode(null); 
        setAvailableMaterials([]); setSelectedMaterialCode(null); 
        setSelectedProtectionCode(null); 
        setIsProPitchType(false); setSelectedPitchCode(null); // Сброс питчей
        setLocationError(null); setMaterialError(null);
        return;
    }
    const fetchLocationsForScreenType = async () => {
        setLoadingLocations(true); setLocationError(null); setSelectedLocationCode(null); 
        try {
            const relations = await apiClient.get<ScreenTypeLocationRelation[]>('/screen-type-locations');
             if (!isMounted) return;
            if (!Array.isArray(relations)) { setAvailableLocations([]); setLocationError('Format Error (ST->L)'); return; }
            const relatedLocations = relations
              .filter(rel => rel.screenType?.code?.toLowerCase() === selectedScreenTypeCode?.toLowerCase() && rel.location)
              .map(rel => rel.location); 
            const uniqueLocations = Array.from(new Map(relatedLocations.map(loc => [loc.id, loc])).values());
            setAvailableLocations(uniqueLocations); setLocationError(null); 
            if (uniqueLocations.length === 1 && uniqueLocations[0].code) { setSelectedLocationCode(uniqueLocations[0].code); }
        } catch (error) { 
             if (!isMounted) return;
            setLocationError(error instanceof Error ? error.message : 'Failed to load locations'); setAvailableLocations([]);
        } 
        finally { if (isMounted) setLoadingLocations(false); }
    };
    fetchLocationsForScreenType();
    return () => { isMounted = false; };
  }, [selectedScreenTypeCode, initialBaseLoadComplete]); 

  // --- Загрузка Materials ---
  useEffect(() => {
    if (!selectedLocationCode) { 
        setAvailableMaterials([]); setSelectedMaterialCode(null); setMaterialError(null);
        return; 
    }
    let isMounted = true;
    const fetchMaterialsForLocation = async () => {
        setLoadingMaterials(true); setMaterialError(null); setSelectedMaterialCode(null); 
        try {
            const relations = await apiClient.get<LocationMaterialRelation[]>('/location-materials'); 
             if (!isMounted) return;
            if (!Array.isArray(relations)) { setAvailableMaterials([]); setMaterialError('Format Error (L->M)'); return; }
            const relatedMaterials = relations
              .filter(rel => rel.location?.code?.toLowerCase() === selectedLocationCode?.toLowerCase() && rel.material)
              .map(rel => rel.material);
            const uniqueMaterials = Array.from(new Map(relatedMaterials.map(mat => [mat.id, mat])).values());
            setAvailableMaterials(uniqueMaterials); setMaterialError(null);
            if (uniqueMaterials.length === 1 && uniqueMaterials[0].code) { setSelectedMaterialCode(uniqueMaterials[0].code); }
        } catch (error) { 
             if (!isMounted) return;
            setMaterialError(error instanceof Error ? error.message : 'Failed to load materials'); setAvailableMaterials([]);
        } 
        finally { if (isMounted) setLoadingMaterials(false); }
    };
    fetchMaterialsForLocation();
    return () => { isMounted = false; };
  }, [selectedLocationCode]); 

  // --- Установка защиты по умолчанию ---
  useEffect(() => {
      if (loadingProtections || !selectedLocationCode || ipProtections.length === 0) {
          if (!selectedLocationCode && !loadingProtections) setSelectedProtectionCode(null); 
          return; 
      }
      let defaultProtectionCode: string | null = null;
      const locationCodeLower = selectedLocationCode.toLowerCase(); 
      if (locationCodeLower === 'indoor') { defaultProtectionCode = 'IP30'; } 
      else if (locationCodeLower === 'outdoor') { defaultProtectionCode = 'IP65'; } 
      if (defaultProtectionCode && ipProtections.some(p => p.code === defaultProtectionCode)) {
          setSelectedProtectionCode(defaultProtectionCode);
      } else { setSelectedProtectionCode(null); }
  }, [selectedLocationCode, ipProtections, loadingProtections]); 

  // --- Установка RefreshRate и Brightness ---
  useEffect(() => {
      if (isProPitchType) { setSelectedRefreshRate(3840); setSelectedBrightness(6000); } 
      else { setSelectedRefreshRate(1920); setSelectedBrightness(800); } 
  }, [isProPitchType]); 

  // --- Обработчики ---
  const handleScreenTypeChange = (value: string) => { 
      setSelectedScreenTypeCode(value); 
      setSelectedLocationCode(null); setSelectedMaterialCode(null); setSelectedProtectionCode(null); 
      setIsProPitchType(false); setSelectedPitchCode(null); 
      setSelectedRefreshRate(null); setSelectedBrightness(null); 
  };
  const handleLocationChange = (value: string | null) => { 
      setSelectedLocationCode(value); setSelectedMaterialCode(null); 
      setIsProPitchType(false); setSelectedPitchCode(null); 
      setSelectedRefreshRate(null); setSelectedBrightness(null); 
  };
  const handleMaterialChange = (value: string | null) => { 
      setSelectedMaterialCode(value);
      setIsProPitchType(false); setSelectedPitchCode(null); 
      setSelectedRefreshRate(null); setSelectedBrightness(null); 
  };
  const handleProtectionChange = (value: string | null) => { 
      setSelectedProtectionCode(value);
      setIsProPitchType(false); setSelectedPitchCode(null); 
      setSelectedRefreshRate(null); setSelectedBrightness(null); 
  };
  const handlePitchTypeSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = event.currentTarget.checked;
      setIsProPitchType(isChecked);
      setSelectedPitchCode(null); 
  };
  const handlePitchChange = (value: string | null) => { setSelectedPitchCode(value); };
  
  // --- Подготовка данных ---
  const screenTypeSegments = screenTypes.map((st) => ({ value: st.code, label: st.name }));
  const locationOptions = availableLocations.map((loc) => ({ value: loc.code, label: loc.name }));
  const materialOptions = availableMaterials.map((mat) => ({ value: mat.code, label: mat.name })); 
  const protectionOptions = ipProtections.map((ip) => ({ value: ip.code, label: ip.code })); 
  // pitchTypeRadios больше не нужен

  // --- МЕМОИЗИРОВАННЫЙ ФИЛЬТР ПИТЧЕЙ ---
  const filteredPitchOptions = useMemo(() => {
      const targetPitchTypeName = (isProPitchType ? 'pro' : 'eco').toLowerCase(); 
      if (loadingPitchesAndRelations || !selectedScreenTypeCode || !selectedLocationCode || !targetPitchTypeName) {
          return [];
      }
      const selScreenTypeLower = selectedScreenTypeCode.toLowerCase();
      const selLocationLower = selectedLocationCode.toLowerCase();
      
      const allowedByScreenType = new Set(
          screenTypePitchRelations.filter(rel => rel.screenType?.code?.toLowerCase() === selScreenTypeLower)
              .map(rel => rel.pitchCode?.toLowerCase()).filter(Boolean) as string[]
      );
      const allowedByLocation = new Set(
           locationPitchRelations.filter(rel => rel.location?.code?.toLowerCase() === selLocationLower)
               .map(rel => rel.pitchCode?.toLowerCase()).filter(Boolean) as string[]
       );
        const allowedByPitchType = new Set(
            pitchTypePitchRelations.filter(rel => rel.pitchTypeName?.toLowerCase() === targetPitchTypeName)
                .map(rel => rel.pitchCode?.toLowerCase()).filter(Boolean) as string[]
        );
        
      const filteredPitches = allPitches.filter(pitch => {
          const pitchCodeLower = pitch.code?.toLowerCase();
          if (!pitchCodeLower) return false; 
          return allowedByScreenType.has(pitchCodeLower) &&
                 allowedByLocation.has(pitchCodeLower) &&
                 allowedByPitchType.has(pitchCodeLower);
      });
      return filteredPitches.map(p => ({ value: p.code, label: p.code }));
  }, [
      allPitches, pitchTypePitchRelations, screenTypePitchRelations, locationPitchRelations, 
      selectedScreenTypeCode, selectedLocationCode, isProPitchType, // Зависим от флага
      loadingPitchesAndRelations 
  ]);

  // --- Условия отображения ---
  const showBaseForm = initialBaseLoadComplete && !screenTypeError && !protectionError && !pitchTypeError && !pitchError; 
  const hasValidDimensions = width.trim() !== '' && height.trim() !== '';
  const showDependentForm = showBaseForm && selectedScreenTypeCode && hasValidDimensions; 
  const showMaterialAndProtection = showDependentForm && selectedLocationCode;
  const showPitchFields = showMaterialAndProtection && selectedMaterialCode && selectedProtectionCode; 

  return (
    <Stack gap="md">
      <LoadingOverlay 
        visible={loadingScreenTypes || loadingProtections || loadingPitchesAndRelations || loadingLocations || loadingMaterials} 
        overlayProps={{ radius: 'sm', blur: 2 }} 
      />

      {/* Выбор Типа Экрана */}
      {isInitialLoading && <Text ta="center" mb="xl">Загрузка конфигурации...</Text>} 
      {!isInitialLoading && (screenTypeError || protectionError || pitchTypeError || pitchError) && ( 
        <Alert title="Ошибка начальной загрузки" color="red" icon={<IconAlertCircle size={16}/>} radius="sm" mb="xl">
           {screenTypeError || protectionError || pitchTypeError || pitchError }
        </Alert> 
      )}
      {!isInitialLoading && showBaseForm && screenTypes.length > 0 && ( 
        <SegmentedControl
            fullWidth data={screenTypeSegments} value={selectedScreenTypeCode ?? ''} 
            onChange={handleScreenTypeChange} mb="xl" color="blue" radius="md"
        /> 
      )}
      {!isInitialLoading && showBaseForm && screenTypes.length === 0 && ( 
         <Text c="dimmed" ta="center" mb="xl">Типы экранов не найдены.</Text> 
      )}
      
      {/* Поля ввода Ширина/Высота - всегда активны */}
      {showBaseForm && (
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput 
              label="Ширина экрана (мм)" 
              value={width} 
              onChange={(e) => setWidth(e.currentTarget.value)} 
              required 
              placeholder="Введите ширину"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput 
              label="Высота экрана (мм)" 
              value={height} 
              onChange={(e) => setHeight(e.currentTarget.value)} 
              required 
              placeholder="Введите высоту"
            />
          </Grid.Col>
        </Grid>
      )}
      
      {/* Условный Рендеринг Остальной Формы */}
      {showDependentForm && (
          <Box> 
              <Grid>
                {/* ВЫБОР МЕСТА УСТАНОВКИ */}
                <Grid.Col span={{ base: 12, sm: 4 }}>
                   {locationError && ( <Alert title="Ошибка локаций" color="red" icon={<IconAlertCircle size={16}/>} mb="sm" radius="sm">{locationError}</Alert> )}
                   <Select
                       label="Место установки"
                       placeholder={loadingLocations ? "Загрузка..." : (availableLocations.length === 0 ? "Нет доступных" : "Выберите место")}
                       data={locationOptions} value={selectedLocationCode} onChange={handleLocationChange} 
                       disabled={loadingLocations || !!locationError || availableLocations.length === 0} 
                       searchable clearable required
                   />
                </Grid.Col>

                {/* ВЫБОР МАТЕРИАЛА */}
                <Grid.Col span={{ base: 12, sm: 4 }}>
                    {materialError && ( <Alert title="Ошибка материалов" color="red" icon={<IconAlertCircle size={16}/>} mb="sm" radius="sm">{materialError}</Alert> )}
                   <Select
                       label="Материал"
                       placeholder={loadingMaterials ? "Загрузка..." : (availableMaterials.length === 0 ? "Нет доступных" : "Выберите материал")}
                       data={materialOptions} value={selectedMaterialCode} 
                       onChange={handleMaterialChange} 
                       disabled={!selectedLocationCode || loadingMaterials || !!materialError || availableMaterials.length === 0} 
                       searchable clearable required
                   />
                </Grid.Col>
                
                {/* ВЫБОР СТЕПЕНИ ЗАЩИТЫ */}
                 <Grid.Col span={{ base: 12, sm: 4 }}>
                   <Select
                       label="Степень защиты"
                       placeholder={loadingProtections ? "Загрузка..." : (ipProtections.length === 0 ? "Нет данных" : "Выберите степень")}
                       data={protectionOptions} value={selectedProtectionCode} 
                       onChange={handleProtectionChange} 
                       disabled={!selectedLocationCode || loadingProtections || !!protectionError} 
                       searchable clearable required
                   />
                 </Grid.Col>

                {/* БЛОК ПИТЧА */}
                {showPitchFields && (
                     <Grid.Col span={12}>
                         {pitchTypeError && ( <Alert title="Ошибка типов питчей" color="red" icon={<IconAlertCircle size={16}/>} mb="sm" radius="sm">{pitchTypeError}</Alert> )}
                         {pitchError && ( <Alert title="Ошибка питчей/связей" color="red" icon={<IconAlertCircle size={16}/>} mb="sm" radius="sm">{pitchError}</Alert> )}
                         
                         <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="md" mb="md">
                             {/* 1. Тип шага пикселя (Switch) */}
                             <Box> 
                                  <Text size="sm" fw={500} mb={7}>Тип шага</Text>
                                 <Switch
                                     checked={isProPitchType}
                                     onChange={handlePitchTypeSwitchChange}
                                     onLabel="PRO" 
                                     offLabel="ECO" 
                                     size="md" 
                                     disabled={loadingPitchesAndRelations || !!pitchTypeError} // Блокируем при загрузке/ошибке типов
                                 />
                             </Box>

                             {/* 2. Шаг пикселя (Select) */}
                              <Box>
                                 <Select
                                     label="Шаг пикселя"
                                     placeholder={loadingPitchesAndRelations ? "Загрузка..." : (filteredPitchOptions.length === 0 ? "Нет доступных" : "Выберите шаг")}
                                     data={filteredPitchOptions} 
                                     value={selectedPitchCode}
                                     onChange={handlePitchChange}
                                     disabled={loadingPitchesAndRelations || !!pitchError || filteredPitchOptions.length === 0}
                                     searchable clearable required
                                 />
                             </Box>

                             {/* 3. Частота обновления */}
                             <Box>
                                 <TextInput
                                     readOnly 
                                     label="Частота, Гц"
                                     value={selectedRefreshRate !== null ? selectedRefreshRate.toString() : '---'} 
                                     placeholder="---"
                                 />
                             </Box>

                             {/* 4. Яркость */}
                             <Box>
                                 <TextInput
                                     readOnly 
                                     label="Яркость, кд/м²"
                                     value={selectedBrightness !== null ? selectedBrightness.toString() : '---'}
                                     placeholder="---"
                                 />
                             </Box>
                         </SimpleGrid>
                     </Grid.Col>
                )}
                 {/* КОНЕЦ БЛОКА ПИТЧА */}

                 {/* TODO: Добавить выбор Кабинета */}
                 {/* disabled={!selectedPitchCode || ...} */}

              </Grid>
          </Box>
      )}
    </Stack>
  );
};

export default CalculatorForm;