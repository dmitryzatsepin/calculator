// src/components/CalculatorForm.tsx
import { useState, useEffect } from 'react';
import {
  Stack,
  Grid,
  TextInput,
  Select,
  //Checkbox, // Оставляем, т.к. может понадобиться
  //Button,   // Оставляем, т.к. может понадобиться
  LoadingOverlay,
  //Text,     // Оставляем, т.к. может понадобиться
  Alert,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { apiClient } from '../services/apiClient';
// Импортируем нужные типы из нашего файла api.ts
import { ScreenTypeFromApi, ScreenTypeListApiResponse } from '../types/api'; 

const CalculatorForm = () => {
  // --- Состояния для данных формы ---
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');

  // --- Состояния для загруженных справочников ---
  // Используем тип ScreenTypeFromApi, так как API возвращает данные в этом формате
  const [screenTypes, setScreenTypes] = useState<ScreenTypeFromApi[]>([]); 

  // --- Состояния для выбранных значений ---
  const [selectedScreenTypeId, setSelectedScreenTypeId] = useState<number | null>(null);
  // TODO: Добавить состояния для materialId, protectionId, pixelStepId, cabinetId, options...

  // --- Состояния загрузки ---
  const [loadingScreenTypes, setLoadingScreenTypes] = useState<boolean>(false);
  // TODO: Добавить состояния загрузки для других данных

  // --- Состояния ошибок ---
  const [screenTypeError, setScreenTypeError] = useState<string | null>(null);
  // TODO: Добавить состояния ошибок для других данных

  // --- Общее состояние загрузки для оверлея ---
  const isLoading = loadingScreenTypes; // Пока зависит только от ScreenTypes

  // --- Загрузка Типов Экранов (ScreenType) при монтировании ---
  useEffect(() => {
    const fetchScreenTypes = async () => {
      setLoadingScreenTypes(true);
      setScreenTypeError(null); // Сбрасываем предыдущую ошибку
      console.log('Запрос /screen-types...'); // Лог начала запроса
      try {
        // Указываем, что ожидаем объект типа ScreenTypeListApiResponse
        const response = await apiClient.get<ScreenTypeListApiResponse>('/screen-types');
        console.log('ПОЛУЧЕНЫ ДАННЫЕ /screen-types:', response); 

        // Извлекаем массив из поля 'data' ответа
        const dataArray = response?.data; 

        // Проверяем, что dataArray действительно массив
        if (!Array.isArray(dataArray)) {
           console.error("ОШИБКА: Поле 'data' в ответе НЕ является массивом!", response);
           setScreenTypes([]); // Устанавливаем пустой массив в случае ошибки формата
           setScreenTypeError('Некорректный формат ответа от сервера для типов экранов');
        } else {
           setScreenTypes(dataArray); // Обновляем состояние МАССИВОМ
           // Очищаем ошибку, если данные успешно загружены и обработаны
           setScreenTypeError(null); 
        }
      } catch (error) {
        console.error("❌ Ошибка загрузки ScreenTypes:", error);
        setScreenTypeError(error instanceof Error ? error.message : 'Не удалось загрузить типы экранов');
        setScreenTypes([]); // Устанавливаем пустой массив при ошибке загрузки
      } finally {
        setLoadingScreenTypes(false);
      }
    };

    fetchScreenTypes();
  }, []); // Пустой массив зависимостей - выполнить один раз при монтировании

  // --- Обработчики изменений ---
  const handleScreenTypeChange = (value: string | null) => {
    // value приходит из Select как строка (ID) или null
    const newId = value ? parseInt(value, 10) : null;
    // Проверяем, не является ли newId NaN после parseInt
    const finalId = Number.isNaN(newId) ? null : newId; 
    console.log('Выбран ScreenType ID:', finalId);
    setSelectedScreenTypeId(finalId);
    // TODO: Сбрасывать зависимые поля (материал, опции, шаг, кабинет) при смене типа экрана
    // setSelectedMaterialId(null);
    // setSelectedProtectionId(null);
    // setSelectedOptions([]);
    // setSelectedPixelStepId(null);
    // setSelectedCabinetId(null);
  };

  // --- Подготовка данных для Select ---
  // Теперь screenTypes гарантированно массив (пустой или с данными)
  const screenTypeOptions = screenTypes.map((st) => ({
    value: st.id.toString(), // ID в value
    label: st.name,          // name в label
  }));

  return (
    <Stack gap="md">
      <LoadingOverlay visible={isLoading} overlayProps={{ radius: 'sm', blur: 2 }} />

      <Grid>
        {/* Поля ввода Ширина/Высота */}
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

        {/* Выбор Типа Экрана */}
        <Grid.Col span={{ base: 12, sm: 4 }}>
          {/* Отображение ошибки загрузки, если она есть */}
          {screenTypeError && (
            <Alert title="Ошибка загрузки" color="red" icon={<IconAlertCircle size={16}/>} mb="sm" radius="sm">
              {screenTypeError}
            </Alert>
          )}
          <Select
            label="Тип экрана"
            placeholder={loadingScreenTypes ? "Загрузка..." : "Выберите тип"}
            data={screenTypeOptions}
            value={selectedScreenTypeId !== null ? selectedScreenTypeId.toString() : null}
            onChange={handleScreenTypeChange}
            disabled={loadingScreenTypes || screenTypeError !== null} // Блокируем при загрузке или ошибке
            searchable
            clearable // Позволяет очистить выбор
            required
          />
        </Grid.Col>

        {/* TODO: Добавить выбор Материала (Grid.Col) */}
        {/* Будет зависеть от selectedScreenTypeId */}
        
        {/* TODO: Добавить выбор Степени Защиты (Grid.Col) */}
        {/* Будет загружать /ip-protection */}

        {/* TODO: Добавить выбор Доп. Опций (Grid.Col, Checkbox.Group или несколько Checkbox) */}
        {/* Будет зависеть от selectedScreenTypeId */}

        {/* TODO: Добавить выбор Шага Пикселя (Grid.Col, Select) */}
        {/* Будет зависеть от selectedScreenTypeId и, возможно, опций */}
        
        {/* TODO: Добавить выбор Кабинета (Grid.Col, Select) */}
        {/* Будет зависеть от selectedScreenTypeId, selectedPixelStepId и, возможно, материала */}

      </Grid>

      {/* TODO: Добавить ввод Курса Валют */}
      {/* TODO: Добавить кнопку Рассчитать */}
      {/* TODO: Подключить компонент CalculationResultDisplay */}
      
    </Stack>
  );
};

export default CalculatorForm;