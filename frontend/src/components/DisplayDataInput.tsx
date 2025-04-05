import { useState, useEffect, useMemo } from "react";
import {
  Select,
  Stack,
  TextInput,
  Grid,
  Button,
  Checkbox,
  LoadingOverlay,
  Text,
} from "@mantine/core";
import classes from "../styles/DisplayParameters.module.scss";
import CalculationResults from "./CalculationResults";

// --- Типы ---
type ScreenTypeData = { name: string; material: string[]; option: string[] };
type ProtectionOption = { code: string };
type PixelStep = {
  id: number;
  name: string;        // Есть, строка
  type: string | null; // Может быть null? Сделай nullable
  width: number;       // Есть, число
  height: number;      // Есть, число
  brightness: number;  // Есть, число
  refreshFreq: number; // Есть, число
  location: string | null; // ВСЕГДА строка (имя ScreenType) или null, если связи нет
  options: string[];   // Есть, массив строк
  ipCode: string | null; // Есть, строка (код IP) или null
  priceUsd: string | number | null; // Приходит как строка из Decimal, может быть null
  screenTypeId: number; // Добавляем
  ipCodeId: number | null; // Добавляем
  createdAt: string; // Добавляем
  updatedAt: string; // Добавляем
};
type CabinetType = {
  id: number;
  name: string;
  location: string;
  width: number;
  height: number;
  pixelStep: string[];
  material: string[];
  modulesQ: number;
  powerUnitQ: number;
  receiver: number;
};

// Интерфейсы для ответа API ЦБ РФ
interface CbrValuteEntry {
  ID: string;
  NumCode: string;
  CharCode: string;
  Nominal: number;
  Name: string;
  Value: number;
  Previous: number;
}
interface CbrApiResponse {
  Date: string;
  PreviousDate: string;
  PreviousURL: string;
  Timestamp: string;
  Valute: { [key: string]: CbrValuteEntry };
}
// ---

const DisplayParameters = () => {
  // --- Состояние ---
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [screenTypes, setScreenTypes] = useState<ScreenTypeData[]>([]);
  const [protectionOptionsAll, setProtectionOptionsAll] = useState<
    ProtectionOption[]
  >([]);
  const [pixelStepsAll, setPixelStepsAll] = useState<PixelStep[]>([]);
  const [cabinetsAll, setCabinetsAll] = useState<CabinetType[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [screenType, setScreenType] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedProtection, setSelectedProtection] = useState<string | null>(
    null
  );
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedPixelStep, setSelectedPixelStep] = useState<string | null>(
    null
  );
  const [selectedCabinet, setSelectedCabinet] = useState<CabinetType | null>(
    null
  );
  const [loadingScreenTypes, setLoadingScreenTypes] = useState<boolean>(false);
  const [loadingProtection, setLoadingProtection] = useState<boolean>(false);
  const [loadingSteps, setLoadingSteps] = useState<boolean>(false);
  const [loadingCabinets, setLoadingCabinets] = useState<boolean>(false);
  const [loadingCurrency, setLoadingCurrency] = useState<boolean>(false);
  const [currencyError, setCurrencyError] = useState<string | null>(null);
  const [drawerOpened, setDrawerOpened] = useState<boolean>(false);

  // --- Загрузка данных из API ---
  useEffect(() => {
    // Загрузка локальных данных
    setLoadingScreenTypes(true);
    fetch("/api/local/screen-types")
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))
      )
      .then((data) => setScreenTypes(data?.data ?? []))
      .catch((e) => console.error("❌ screen-types:", e))
      .finally(() => setLoadingScreenTypes(false));
    setLoadingProtection(true);
    fetch("/api/local/protection")
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))
      )
      .then((data) => setProtectionOptionsAll(data?.data ?? []))
      .catch((e) => console.error("❌ protection:", e))
      .finally(() => setLoadingProtection(false));
    setLoadingSteps(true);
    fetch("/api/local/pixel-steps") 
   .then(res => res.ok ? res.json() : Promise.reject(`HTTP ${res.status}`))
   .then(data => {
    const steps: PixelStep[] = (data?.data ?? []).map((s: Partial<PixelStep> & { priceUsd?: string | number | null }) => ({ // Используем частичный тип + ожидаем priceUsd как строку/число
      // Устанавливаем значения по умолчанию для полей, которые могут отсутствовать в Partial
      id: s.id ?? 0,
      name: s.name ?? '',
      type: s.type ?? null,
      width: s.width ?? 0,
      height: s.height ?? 0,
      brightness: s.brightness ?? 0,
      refreshFreq: s.refreshFreq ?? 0,
      location: s.location ?? null,
      options: s.options ?? [],
      ipCode: s.ipCode ?? null,
      screenTypeId: s.screenTypeId ?? 0,
      ipCodeId: s.ipCodeId ?? null,
      createdAt: s.createdAt ?? new Date().toISOString(), // Пример значения по умолчанию
      updatedAt: s.updatedAt ?? new Date().toISOString(), // Пример значения по умолчанию
      // Преобразуем priceUsd
      priceUsd: s.priceUsd != null ? parseFloat(String(s.priceUsd)) : null
    }));
     setPixelStepsAll(steps);
   })
   .catch(e => console.error("❌ pixel-steps:", e))
   .finally(() => setLoadingSteps(false));
    setLoadingCabinets(true);
    fetch("/api/local/cabinets")
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))
      )
      .then((data) => {
        const cabs = (data?.data ?? []).map((c: CabinetType) => ({
          ...c,
          width: c.width || 0,
          height: c.height || 0,
          modulesQ: c.modulesQ || 0,
          powerUnitQ: c.powerUnitQ || 0,
          receiver: c.receiver || 0,
        }));
        setCabinetsAll(cabs);
      })
      .catch((e) => console.error("❌ cabinets:", e))
      .finally(() => setLoadingCabinets(false));

    // --- Загрузка валюты с fallback и детальным логированием ---
    setLoadingCurrency(true);
    setCurrencyError(null);
    // 👇 ИЗМЕНЕН ТИП ВОЗВРАЩАЕМОГО ЗНАЧЕНИЯ 👇
    const processResponse = (
      response: Response,
      dayLabel: string
    ): Promise<CbrApiResponse> => {
      if (!response.ok)
        return Promise.reject(
          new Error(`Ошибка HTTP (${dayLabel}): ${response.status}`)
        );
      return response
        .clone()
        .text()
        .then((text) => {
          // console.log(`--- RAW TEXT (${dayLabel}) ---`);
          // console.log(text);
          try {
            // JSON.parse возвращает any, поэтому приводим к нашему типу
            const data = JSON.parse(text) as CbrApiResponse;
            console.log(
              `📡 Ответ API ЦБ РФ (${dayLabel}, после ручного парсинга):`,
              data
            );
            return data;
          } catch (parseError) {
            console.error(`❌ Ошибка парсинга JSON (${dayLabel}):`, parseError);
            return Promise.reject(
              new Error(`Ошибка парсинга JSON (${dayLabel})`)
            );
          }
        });
    };
    fetch("/api/currency") // 1. Текущий курс
      .then((res) => processResponse(res, "текущий"))
      .then((data) => {
        const currentRateValue = data?.Valute?.USD?.Value;
        if (typeof currentRateValue === "number") {
          setExchangeRate(parseFloat(currentRateValue.toFixed(2)));
          setCurrencyError(null);
          console.log(
            "✅ Курс USD за текущий день загружен:",
            currentRateValue
          );
          return null;
        } else {
          console.warn(
            "⚠️ Курс USD за текущий день не найден/не число. Попытка загрузить предыдущий..."
          );
          const previousURL = data?.PreviousURL;
          if (typeof previousURL === "string") {
            const fullPreviousURL = previousURL.startsWith("//")
              ? `https:${previousURL}`
              : previousURL;
            return fetch(fullPreviousURL).then((prevRes) =>
              processResponse(prevRes, "предыдущий")
            );
          } else {
            throw new Error(
              "Курс USD не найден, ссылка на предыдущий день отсутствует."
            );
          }
        }
      })
      .then((prevData) => {
        if (!prevData) return;
        const previousRateValue = prevData?.Valute?.USD?.Value;
        if (typeof previousRateValue === "number") {
          setExchangeRate(parseFloat(previousRateValue.toFixed(2)));
          setCurrencyError("Используется курс за предыдущий день.");
          console.log(
            "✅ Курс USD за предыдущий день загружен:",
            previousRateValue
          );
        } else {
          throw new Error(
            "Курс USD не найден (или некорректен) ни за текущий, ни за предыдущий день."
          );
        }
      })
      .catch((error) => {
        const errorMsg =
          error instanceof Error
            ? error.message
            : "Неизвестная ошибка загрузки курса";
        console.error("❌ Ошибка загрузки/обработки курса:", errorMsg, error);
        setExchangeRate(null);
        setCurrencyError(errorMsg);
      })
      .finally(() => {
        setLoadingCurrency(false);
        console.log("--- Загрузка курса завершена ---");
      });
  }, []);


    // --- Вычисляемые данные (useMemo) ---
    const selectedScreenData = useMemo(
      () => screenTypes.find((t) => t.name === screenType),
      [screenType, screenTypes]
    );
    const filteredProtectionOptions = useMemo(
      () =>
        protectionOptionsAll
          .filter((p) => {
            const ip = parseInt(p.code.replace("IP", ""), 10);
            return !isNaN(ip) && ip >= 29 && ip <= 69;
          })
          .map((p) => ({ value: p.code, label: p.code })),
      [protectionOptionsAll]
    );
    const availableMaterials = useMemo(
      () =>
        selectedScreenData
          ? selectedScreenData.material
          : [...new Set(screenTypes.flatMap((t) => t.material))],
      [selectedScreenData, screenTypes]
    );
    const availableOptions = useMemo(
      () =>
        selectedScreenData && selectedMaterial ? selectedScreenData.option : [],
      [selectedScreenData, selectedMaterial]
    );
  
    // --- ИЗМЕНЕННЫЙ БЛОК filteredPixelSteps ---
    const filteredPixelSteps = useMemo(() => {
      // Условие для возврата пустого массива, если не выбраны тип экрана или материал
      if (!selectedScreenData || !selectedMaterial) {
          console.log("filteredPixelSteps: Не выбран тип экрана или материал, возвращаем [].");
          return [];
      }
  
      // Фильтруем все шаги по выбранному типу экрана (location)
      let steps = pixelStepsAll.filter(
        (s) => s.location === selectedScreenData.name
      );
      console.log(`filteredPixelSteps: Найдено шагов после фильтра по location '${selectedScreenData.name}':`, steps.length);
  
  
      // Применяем дополнительный фильтр, если выбрана опция "гибкий экран"
      if (selectedOptions.includes("гибкий экран")) {
          console.log("filteredPixelSteps: Применяем фильтр по опции 'гибкий экран'.");
          steps = steps.filter((s) =>
              Array.isArray(s.options) && s.options.includes("гибкий экран") // Добавлена проверка Array.isArray
          );
           console.log(`filteredPixelSteps: Найдено шагов после фильтра по опции:`, steps.length);
      }
  
      // Логируем шаги ПЕРЕД преобразованием в {value, label}
      console.log("filteredPixelSteps: Отфильтрованные шаги (перед map):", JSON.stringify(steps, null, 2)); // Используем JSON.stringify для детального лога
  
      // Преобразуем отфильтрованные шаги в формат для Select, добавляя проверку s.name
      const selectData = steps.map((s) => {
          const label = s.name || 'Неизвестный шаг'; // Заглушка для label
          const value = s.name || ''; // Пустая строка для value, если name отсутствует
          // Дополнительный лог, если имя отсутствует
          if (!s.name) {
              console.warn("filteredPixelSteps: Обнаружен шаг без имени (name):", s);
          }
          return { value, label };
      }).filter(item => item.value !== ''); // Убираем элементы с пустым value, если они не нужны в Select
  
       // Логируем финальный массив данных для Select
       console.log("filteredPixelSteps: Данные для Select:", selectData);
  
      return selectData;
    }, [selectedScreenData, selectedMaterial, selectedOptions, pixelStepsAll]);
    // --- КОНЕЦ ИЗМЕНЕННОГО БЛОКА ---
  
    const filteredCabinets = useMemo(() => {
      // ... (остальной код без изменений) ...
      if (!selectedScreenData || !selectedPixelStep || !selectedMaterial)
        return [];
      return cabinetsAll
        .filter(
          (c) =>
            c.location === selectedScreenData.name &&
            Array.isArray(c.pixelStep) && c.pixelStep.includes(selectedPixelStep) && // Добавлена проверка Array.isArray
            Array.isArray(c.material) && c.material.includes(selectedMaterial)      // Добавлена проверка Array.isArray
        )
        // Безопасная сортировка для name
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        .map((c) => ({ value: c.id.toString(), label: c.name || 'Без имени' })); // Добавлена заглушка для label
    }, [selectedScreenData, selectedPixelStep, selectedMaterial, cabinetsAll]);

  // --- Эффекты для сброса полей ---
  useEffect(() => {
    setSelectedMaterial(null);
    setSelectedOptions([]);
    setSelectedPixelStep(null);
    setSelectedCabinet(null);
    if (!screenType) {
      setSelectedProtection(null);
      return;
    }
    const defProt = screenType === "интерьерный" ? "IP30" : "IP65";
    if (protectionOptionsAll.some((p) => p.code === defProt)) {
      setSelectedProtection(defProt);
    } else {
      const first = filteredProtectionOptions[0]?.value;
      setSelectedProtection(first || null);
    }
  }, [screenType, protectionOptionsAll, filteredProtectionOptions]);
  useEffect(() => {
    setSelectedOptions([]);
    setSelectedPixelStep(null);
    setSelectedCabinet(null);
  }, [selectedMaterial]);
  useEffect(() => {
    setSelectedCabinet(null);
  }, [selectedPixelStep]);

  // --- Валидация ---
  const isCalculationPossible =
    !!width.trim() &&
    !!height.trim() &&
    !!screenType &&
    !!selectedMaterial &&
    !!selectedProtection &&
    !!selectedPixelStep &&
    !!selectedCabinet &&
    exchangeRate !== null &&
    exchangeRate > 0;

  // --- Данные для CalculationResults ---
  const calculationData = useMemo(() => {
    // Находим информацию о выбранном шаге пикселя
    const selectedStepInfo = pixelStepsAll.find(
      (step) => step.name === selectedPixelStep
    );

    // Проверяем наличие данных и преобразуем их в числа
    const moduleWidth = selectedStepInfo?.width;
    const moduleHeight = selectedStepInfo?.height;

    // Убедимся, что значения являются числами
    const finalModWidth = typeof moduleWidth === "number" ? moduleWidth : 0;
    const finalModHeight = typeof moduleHeight === "number" ? moduleHeight : 0;

    console.log("Данные модуля перед отправкой:", {
      width: finalModWidth,
      height: finalModHeight,
      rawData: selectedStepInfo,
    });

    return {
      width,
      height,
      screenType,
      selectedProtection,
      selectedMaterial,
      selectedPixelStep,
      selectedCabinet: selectedCabinet ? { ...selectedCabinet } : null,
      selectedOptions,
      exchangeRate: exchangeRate ?? 0,
      selectedBrightness: selectedStepInfo?.brightness ?? "-",
      selectedRefreshFreq: selectedStepInfo?.refreshFreq ?? "-",
      selectedModuleWidth: finalModWidth,
      selectedModuleHeight: finalModHeight,
    };
  }, [
    width,
    height,
    screenType,
    selectedProtection,
    selectedMaterial,
    pixelStepsAll,
    selectedPixelStep,
    selectedCabinet,
    selectedOptions,
    exchangeRate,
  ]);

  // --- Обработчики ---
  const handleScreenTypeChange = (n: string, c: boolean) =>
    setScreenType(c ? n : null);
  const handleMaterialChange = (n: string, c: boolean) =>
    setSelectedMaterial(c ? n : null);
  const handleOptionChange = (o: string, c: boolean) =>
    setSelectedOptions((p) => (c ? [...p, o] : p.filter((opt) => opt !== o)));
  const handlePixelStepChange = (v: string | null) => setSelectedPixelStep(v);
  const handleCabinetChange = (v: string | null) => {
    const id = v ? parseInt(v, 10) : null;
    setSelectedCabinet(cabinetsAll.find((c) => c.id === id) || null);
  };

  // --- Цвет сообщения о курсе ---
  const getCurrencyMessageColor = () => {
    if (!currencyError) return "transparent";
    if (currencyError.includes("Используется курс")) return "orange";
    return "red";
  };

  // --- Состояние загрузки ---
  const isLoading =
    loadingScreenTypes ||
    loadingProtection ||
    loadingSteps ||
    loadingCabinets ||
    loadingCurrency;

  return (
    <>
      <LoadingOverlay
        visible={isLoading}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      <Stack gap="xs" style={{ position: "relative" }}>
        <Grid>
          {/* Поля ввода */}
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Ширина экрана (мм)"
              type="number"
              min="0"
              value={width}
              onChange={(e) => setWidth(e.currentTarget.value)}
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
              required
            />
          </Grid.Col>
          {/* Тип экрана */}
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <div>
              <label className={classes.checkboxGroupLabel}>Тип экрана</label>
              <Stack gap={5}>
                {screenTypes.map((type) => (
                  <Checkbox
                    classNames={classes}
                    key={type.name}
                    label={type.name}
                    checked={screenType === type.name}
                    onChange={(e) =>
                      handleScreenTypeChange(type.name, e.currentTarget.checked)
                    }
                    disabled={!width.trim() || !height.trim()}
                  />
                ))}
              </Stack>
            </div>
          </Grid.Col>
          {/* Материал */}
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <div>
              <label className={classes.checkboxGroupLabel}>Материал</label>
              <Stack gap={5}>
                {availableMaterials.map((mat) => (
                  <Checkbox
                    classNames={classes}
                    key={mat}
                    label={mat}
                    checked={selectedMaterial === mat}
                    onChange={(e) =>
                      handleMaterialChange(mat, e.currentTarget.checked)
                    }
                    disabled={!screenType}
                  />
                ))}
              </Stack>
            </div>
          </Grid.Col>
          {/* Степень защиты */}
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Select
              label="Степень защиты"
              placeholder={
                loadingProtection ? "Загрузка..." : "Выберите степень"
              }
              data={filteredProtectionOptions}
              value={selectedProtection}
              onChange={setSelectedProtection}
              disabled={!screenType || loadingProtection}
              searchable
              required
            />
          </Grid.Col>
          {/* Доп. опции */}
          {availableOptions.length > 0 && (
            <Grid.Col span={{ base: 12, sm: 12 }}>
              <Stack>
                <label className={classes.checkboxGroupLabel}>Опции</label>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {availableOptions.map((option) => (
                    <Checkbox
                      classNames={classes}
                      key={option}
                      label={option}
                      checked={selectedOptions.includes(option)}
                      onChange={(e) =>
                        handleOptionChange(option, e.currentTarget.checked)
                      }
                    />
                  ))}
                </div>
              </Stack>
            </Grid.Col>
          )}
          {/* Шаг пикселя */}
          <Grid.Col span={{ base: 12, sm: 12 }}>
            <Select
              label="Шаг пикселя"
              placeholder={loadingSteps ? "Загрузка..." : "Выберите шаг"}
              data={filteredPixelSteps}
              value={selectedPixelStep}
              onChange={handlePixelStepChange}
              disabled={
                !selectedMaterial ||
                loadingSteps ||
                filteredPixelSteps.length === 0
              }
              searchable
              required
              clearable
            />
          </Grid.Col>
          {/* Кабинет */}
          <Grid.Col span={{ base: 12, sm: 12 }}>
            <Select
              label="Кабинет"
              placeholder={loadingCabinets ? "Загрузка..." : "Выберите кабинет"}
              data={filteredCabinets}
              value={selectedCabinet ? selectedCabinet.id.toString() : null}
              onChange={handleCabinetChange}
              disabled={
                !selectedPixelStep ||
                loadingCabinets ||
                filteredCabinets.length === 0
              }
              searchable
              required
              clearable
            />
          </Grid.Col>
        </Grid>

        {/* Курс валют и Кнопка Рассчитать */}
        <Grid align="flex-start" mt="md">
          <Grid.Col span="content">
            <Stack gap={0}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span role="img" aria-label="USD">
                  🇺🇸
                </span>
                <TextInput
                  aria-label="Курс доллара"
                  type="number"
                  step="0.01"
                  min="0"
                  value={exchangeRate !== null ? exchangeRate.toString() : ""}
                  onChange={(e) => {
                    const v = e.currentTarget.value;
                    setExchangeRate(v === "" ? null : parseFloat(v));
                  }}
                  disabled={loadingCurrency}
                  required
                  style={{ width: "100px" }}
                  error={
                    currencyError &&
                    !currencyError.includes("Используется курс")
                      ? true
                      : undefined
                  }
                />
              </div>
              {currencyError && (
                <Text c={getCurrencyMessageColor()} size="xs" mt={2}>
                  {currencyError}
                </Text>
              )}
            </Stack>
          </Grid.Col>
          <Grid.Col span="auto">
            <Button
              fullWidth
              onClick={() => setDrawerOpened(true)}
              disabled={!isCalculationPossible || isLoading}
            >
              Рассчитать
            </Button>
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Результаты */}
      <CalculationResults
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        data={calculationData}
      />
    </>
  );
};

export default DisplayParameters;
