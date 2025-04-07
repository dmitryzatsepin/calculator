// src/components/CalculatorForm.tsx
import { useState, useEffect } from 'react'; 
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
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react'; 
import { apiClient } from '../services/apiClient'; 
import { 
    ScreenType, Location, ScreenTypeLocationRelation, 
    Material, LocationMaterialRelation, IpProtection, IpProtectionListApiResponse 
} from '../types/api'; 

const CalculatorForm = () => {
  // --- Состояния ---
  const [width, setWidth] = useState<string>(''); 
  const [height, setHeight] = useState<string>(''); 
  const [screenTypes, setScreenTypes] = useState<ScreenType[]>([]); 
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]); 
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]); 
  const [ipProtections, setIpProtections] = useState<IpProtection[]>([]); 

  // --- Выбранные значения ---
  const [selectedScreenTypeCode, setSelectedScreenTypeCode] = useState<string | null>(null); 
  const [selectedLocationCode, setSelectedLocationCode] = useState<string | null>(null); 
  const [selectedMaterialCode, setSelectedMaterialCode] = useState<string | null>(null); 
  const [selectedProtectionCode, setSelectedProtectionCode] = useState<string | null>(null); 

  // --- Состояния загрузки ---
  const [loadingScreenTypes, setLoadingScreenTypes] = useState<boolean>(true); 
  const [loadingLocations, setLoadingLocations] = useState<boolean>(false);
  const [loadingMaterials, setLoadingMaterials] = useState<boolean>(false); 
  const [loadingProtections, setLoadingProtections] = useState<boolean>(true); 

  // --- Состояния ошибок ---
  const [screenTypeError, setScreenTypeError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [materialError, setMaterialError] = useState<string | null>(null); 
  const [protectionError, setProtectionError] = useState<string | null>(null); 

  const [initialBaseLoadComplete, setInitialBaseLoadComplete] = useState<boolean>(false); 
  
  // --- Флаги загрузки ---
  const isInitialLoading = loadingScreenTypes || loadingProtections; 
  // Определяем, идет ли какая-либо ЗАВИСИМАЯ загрузка
  //const isLoadingDependencies = loadingLocations || loadingMaterials; 

  // --- Загрузка ScreenType ---
  useEffect(() => {
    let isMounted = true;
    const fetchScreenTypes = async () => {
      setLoadingScreenTypes(true);
      setScreenTypeError(null);   
      try {
          const data = await apiClient.get<ScreenType[]>('/screen-types');
          if (!isMounted) return;
          if (!Array.isArray(data)) {
              setScreenTypes([]); 
              setScreenTypeError('Некорректный формат ответа от сервера для типов экранов');
          } else {
              setScreenTypes(data); 
              setScreenTypeError(null); 
              if (data.length > 0 && data[0].code && !selectedScreenTypeCode) {
                  setSelectedScreenTypeCode(data[0].code);
              }
          }
      } catch (error) { 
          if (!isMounted) return;
          setScreenTypeError(error instanceof Error ? error.message : 'Не удалось загрузить типы экранов');
          setScreenTypes([]); 
      } finally { 
          if (isMounted) setLoadingScreenTypes(false);
      }
    };
    fetchScreenTypes();
    return () => { isMounted = false; };
  }, [selectedScreenTypeCode]); 

  // --- Загрузка IpProtection ---
  useEffect(() => {
    let isMounted = true;
    const fetchIpProtections = async () => {
        setLoadingProtections(true);
        setProtectionError(null);
        console.log('Запрос /ip-protection...');
        try {
            // --- 👇 ОЖИДАЕМ ОБЪЕКТ IpProtectionListApiResponse 👇 ---
            const response = await apiClient.get<IpProtectionListApiResponse>('/ip-protection'); 
            if (!isMounted) return;
            console.log('ПОЛУЧЕНЫ ДАННЫЕ /ip-protection:', response);

             // --- 👇 ИЗВЛЕКАЕМ МАССИВ ИЗ ПОЛЯ 'data' 👇 ---
            const dataArray = response?.data;

            if (!Array.isArray(dataArray)) { 
                console.error("ОШИБКА: Поле 'data' в ответе /ip-protection НЕ является массивом!", response);
                setIpProtections([]);
                setProtectionError('Некорректный формат ответа от сервера для степеней защиты');
            } else {
                setIpProtections(dataArray); // Обновляем состояние МАССИВОМ
                setProtectionError(null);
            }
        } catch (error) {
            if (!isMounted) return;
            console.error("❌ Ошибка загрузки IpProtection:", error);
            setProtectionError(error instanceof Error ? error.message : 'Не удалось загрузить степени защиты');
            setIpProtections([]);
        } finally {
            if (isMounted) {
                setLoadingProtections(false);
                if (!loadingScreenTypes) setInitialBaseLoadComplete(true); // Обновляем флаг, если ScreenTypes уже загружены
             }
        }
    };
    fetchIpProtections();
    return () => { isMounted = false; };
}, [loadingScreenTypes]); // Зависим от loadingScreenTypes для установки initialBaseLoadComplete

    // --- Отслеживание завершения начальной загрузки ---
    useEffect(() => {
        // Устанавливаем в true, только если обе загрузки завершились
        if (!loadingScreenTypes && !loadingProtections) {
            setInitialBaseLoadComplete(true);
            console.log("Начальная загрузка (ScreenTypes, IpProtections) завершена.");
        }
    }, [loadingScreenTypes, loadingProtections]);


  // --- Загрузка Locations ---
  useEffect(() => {
     let isMounted = true;
    if (!initialBaseLoadComplete || !selectedScreenTypeCode) {
      setAvailableLocations([]);
      setSelectedLocationCode(null); 
      setAvailableMaterials([]); 
      setSelectedMaterialCode(null); 
      setSelectedProtectionCode(null); 
      setLocationError(null);
      setMaterialError(null);
      return;
    }
    const fetchLocationsForScreenType = async () => {
        setLoadingLocations(true);
        setLocationError(null);
        setSelectedLocationCode(null); 
        try {
            const relations = await apiClient.get<ScreenTypeLocationRelation[]>('/screen-type-locations');
             if (!isMounted) return;
            if (!Array.isArray(relations)) {
                 setAvailableLocations([]);
                 setLocationError('Некорректный формат ответа от сервера для связей локаций');
                 return;
            }
            const relatedLocations = relations
              .filter(rel => rel.screenType?.code?.toLowerCase() === selectedScreenTypeCode?.toLowerCase() && rel.location)
              .map(rel => rel.location); 
            const uniqueLocations = Array.from(new Map(relatedLocations.map(loc => [loc.id, loc])).values());
            setAvailableLocations(uniqueLocations);
            setLocationError(null); 
            if (uniqueLocations.length === 1 && uniqueLocations[0].code) {
                setSelectedLocationCode(uniqueLocations[0].code);
            }
        } catch (error) { 
             if (!isMounted) return;
            setLocationError(error instanceof Error ? error.message : 'Не удалось загрузить доступные места установки');
            setAvailableLocations([]);
        } 
        finally { if (isMounted) setLoadingLocations(false); }
    };
    fetchLocationsForScreenType();
    return () => { isMounted = false; };
  }, [selectedScreenTypeCode, initialBaseLoadComplete]); 

  // --- Загрузка Materials ---
  useEffect(() => {
    if (!selectedLocationCode) { 
        setAvailableMaterials([]);
        setSelectedMaterialCode(null);
        setMaterialError(null);
        return; 
    }
    let isMounted = true;
    const fetchMaterialsForLocation = async () => {
        setLoadingMaterials(true);
        setMaterialError(null);
        setSelectedMaterialCode(null); 
        try {
            const relations = await apiClient.get<LocationMaterialRelation[]>('/location-materials'); 
             if (!isMounted) return;
            if (!Array.isArray(relations)) { 
                 setAvailableMaterials([]);
                 setMaterialError('Некорректный формат ответа от сервера для связей материалов');
                 return; 
            }
            const relatedMaterials = relations
              .filter(rel => rel.location?.code?.toLowerCase() === selectedLocationCode?.toLowerCase() && rel.material)
              .map(rel => rel.material);
            const uniqueMaterials = Array.from(new Map(relatedMaterials.map(mat => [mat.id, mat])).values());
            setAvailableMaterials(uniqueMaterials);
            setMaterialError(null);
            if (uniqueMaterials.length === 1 && uniqueMaterials[0].code) {
                setSelectedMaterialCode(uniqueMaterials[0].code);
            }
        } catch (error) { 
             if (!isMounted) return;
            setMaterialError(error instanceof Error ? error.message : 'Не удалось загрузить доступные материалы');
            setAvailableMaterials([]);
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
      } else {
           console.warn(`Код защиты по умолчанию '${defaultProtectionCode}' не найден в списке.`);
           setSelectedProtectionCode(null); 
      }
  }, [selectedLocationCode, ipProtections, loadingProtections]); 

  // --- Обработчики ---
  const handleScreenTypeChange = (value: string) => { setSelectedScreenTypeCode(value); };
  const handleLocationChange = (value: string | null) => { setSelectedLocationCode(value); setSelectedMaterialCode(null); };
  const handleMaterialChange = (value: string | null) => { setSelectedMaterialCode(value); };
  const handleProtectionChange = (value: string | null) => { setSelectedProtectionCode(value); };

  // --- Подготовка данных ---
  const screenTypeSegments = screenTypes.map((st) => ({ value: st.code, label: st.name }));
  const locationOptions = availableLocations.map((loc) => ({ value: loc.code, label: loc.name }));
  const materialOptions = availableMaterials.map((mat) => ({ value: mat.code, label: mat.name })); 
  const protectionOptions = ipProtections.map((ip) => ({ value: ip.code, label: ip.code })); 

  const showFormDetails = initialBaseLoadComplete && !screenTypeError && !protectionError; // Добавили !protectionError

  return (
    <Stack gap="md">
      <LoadingOverlay 
        visible={loadingScreenTypes || loadingProtections || loadingLocations || loadingMaterials} 
        overlayProps={{ radius: 'sm', blur: 2 }} 
      />

      {/* Выбор Типа Экрана */}
      {isInitialLoading && <Text ta="center" mb="xl">Загрузка конфигурации...</Text>} 
      {!isInitialLoading && (screenTypeError || protectionError) && ( 
        <Alert title="Ошибка начальной загрузки" color="red" icon={<IconAlertCircle size={16}/>} radius="sm" mb="xl">
           {screenTypeError || protectionError}
        </Alert> 
      )}
      {!isInitialLoading && !screenTypeError && !protectionError && screenTypes.length > 0 && ( 
        <SegmentedControl
            fullWidth
            data={screenTypeSegments}
            value={selectedScreenTypeCode ?? ''} 
            onChange={handleScreenTypeChange} 
            mb="xl" 
            color="blue" 
            radius="md"
        /> 
      )}
      {!isInitialLoading && !screenTypeError && !protectionError && screenTypes.length === 0 && ( 
         <Text c="dimmed" ta="center" mb="xl">Типы экранов не найдены.</Text> 
      )}
      
      {/* Условный Рендеринг Остальной Формы */}
      {showFormDetails && selectedScreenTypeCode && ( // Уточнили условие
          <Box> 
              <Grid>
                 <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Ширина экрана (мм)"
                    type="number"
                    min="0"
                    value={width} 
                    onChange={(e) => setWidth(e.currentTarget.value)} 
                    placeholder="Введите ширину"
                    required
                  />
                 </Grid.Col>
                 <Grid.Col span={{ base: 12, sm: 6 }}>
                   <TextInput
                    label="Высота экрана (мм)"
                    type="number"
                    min="0"
                    value={height} 
                    onChange={(e) => setHeight(e.currentTarget.value)} 
                    placeholder="Введите высоту"
                    required
                  />
                 </Grid.Col> 
                 
                {/* ВЫБОР МЕСТА УСТАНОВКИ */}
                <Grid.Col span={{ base: 12, sm: 4 }}>
                   {locationError && ( 
                       <Alert title="Ошибка загрузки локаций" color="red" icon={<IconAlertCircle size={16}/>} mb="sm" radius="sm">
                         {locationError}
                       </Alert> 
                    )}
                   <Select
                       label="Место установки"
                       placeholder={loadingLocations ? "Загрузка..." : (availableLocations.length === 0 ? "Нет доступных" : "Выберите место")}
                       data={locationOptions}
                       value={selectedLocationCode}
                       onChange={handleLocationChange} 
                       disabled={loadingLocations || locationError !== null || availableLocations.length === 0} 
                       searchable
                       clearable 
                       required
                   />
                </Grid.Col>

                {/* ВЫБОР МАТЕРИАЛА */}
                <Grid.Col span={{ base: 12, sm: 4 }}>
                    {materialError && (
                       <Alert title="Ошибка загрузки материалов" color="red" icon={<IconAlertCircle size={16}/>} mb="sm" radius="sm">
                         {materialError}
                       </Alert>
                   )}
                   <Select
                       label="Материал"
                       placeholder={loadingMaterials ? "Загрузка..." : (availableMaterials.length === 0 ? "Нет доступных" : "Выберите материал")}
                       data={materialOptions}
                       value={selectedMaterialCode} 
                       onChange={handleMaterialChange} 
                       disabled={!selectedLocationCode || loadingMaterials || materialError !== null || availableMaterials.length === 0} 
                       searchable
                       clearable 
                       required
                   />
                </Grid.Col>
                
                 {/* ВЫБОР СТЕПЕНИ ЗАЩИТЫ */}
                 <Grid.Col span={{ base: 12, sm: 4 }}>
                   {/* Ошибку показываем выше */}
                   <Select
                       label="Степень защиты"
                       placeholder={loadingProtections ? "Загрузка..." : (ipProtections.length === 0 ? "Нет данных" : "Выберите степень")}
                       data={protectionOptions} 
                       value={selectedProtectionCode} 
                       onChange={handleProtectionChange} 
                       disabled={!selectedLocationCode || loadingProtections || protectionError !== null} 
                       searchable
                       clearable 
                       required
                   />
                 </Grid.Col>

                 {/* TODO: Остальные поля */}

              </Grid>
              {/* ... TODO: остальное ... */}
          </Box>
      )}
    </Stack>
  );
};

export default CalculatorForm;