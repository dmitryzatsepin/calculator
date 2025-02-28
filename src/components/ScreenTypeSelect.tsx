import { useState, useEffect } from "react";
import { Select, Stack, TextInput, Grid } from "@mantine/core";

const ScreenTypeSelect = () => {
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [screenType, setScreenType] = useState<string | null>(null);
  const [screenTypes, setScreenTypes] = useState<{ name: string; type: string; screenOption: string[] }[]>([]);

  const [pixelSteps, setPixelSteps] = useState<{ id: number; name: string; type: string; option?: string | null }[]>([]);
  const [filteredPixelSteps, setFilteredPixelSteps] = useState<string[]>([]);
  const [selectedPixelStep, setSelectedPixelStep] = useState<string | null>(null);

  const [cabinets, setCabinets] = useState<{ id: number; name: string; type: string; pixelOption: string[] }[]>([]);
  const [filteredCabinets, setFilteredCabinets] = useState<{ id: number; name: string; type: string; pixelOption: string[] }[]>([]);
  const [loadingSteps, setLoadingSteps] = useState<boolean>(false);
  const [loadingCabinets, setLoadingCabinets] = useState<boolean>(false);

  // ✅ Проверяем, заполнены ли поля перед активацией следующих шагов
  const isSizeValid = width.trim() !== "" && height.trim() !== "";
  const isScreenTypeSelected = isSizeValid && !!screenType;
  const isPixelStepSelected = isScreenTypeSelected && !!selectedPixelStep;

  // 📌 Загружаем типы экранов
  useEffect(() => {
    const fetchScreenTypes = async () => {
      try {
        const response = await fetch("http://localhost:5000/screen-types");
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
        const data = await response.json();
        setScreenTypes(data.types);
      } catch (error) {
        console.error("❌ Ошибка загрузки типов экранов:", error);
      }
    };
    fetchScreenTypes();
  }, []);

  // 📌 Загружаем шаги пикселя
  useEffect(() => {
    const fetchPixelSteps = async () => {
      setLoadingSteps(true);
      try {
        const response = await fetch("http://localhost:5000/pixel-steps");
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
        const data = await response.json();
        setPixelSteps(data.steps);
      } catch (error) {
        console.error("❌ Ошибка загрузки шагов пикселя:", error);
      } finally {
        setLoadingSteps(false);
      }
    };
    fetchPixelSteps();
  }, []);

  // 📌 Загружаем кабинеты
  useEffect(() => {
    const fetchCabinets = async () => {
      setLoadingCabinets(true);
      try {
        const response = await fetch("http://localhost:5000/cabinets");
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
        const data = await response.json();
        setCabinets(data.cabinets);
      } catch (error) {
        console.error("❌ Ошибка загрузки кабинетов:", error);
      } finally {
        setLoadingCabinets(false);
      }
    };
    fetchCabinets();
  }, []);

  // 📌 Фильтруем шаги пикселя после выбора типа экрана
  useEffect(() => {
    if (!screenType) {
      setFilteredPixelSteps([]);
      return;
    }
    const selectedScreen = screenTypes.find((type) => type.name === screenType);
    if (!selectedScreen) return;

    const availableSteps = pixelSteps
      .filter((step) => step.type === selectedScreen.type)
      .map((step) => step.name);

    console.log("✅ Доступные шаги пикселя:", availableSteps);
    setFilteredPixelSteps(availableSteps);
    setSelectedPixelStep(null);
  }, [screenType, pixelSteps, screenTypes]);

  // 📌 Фильтруем кабинеты **только после выбора шага пикселя**
  useEffect(() => {
    if (!screenType || !selectedPixelStep) {
      setFilteredCabinets([]);
      return;
    }

    const selectedScreen = screenTypes.find((type) => type.name === screenType);
    if (!selectedScreen) {
      setFilteredCabinets([]);
      return;
    }

    console.log("🎯 Выбранный тип экрана:", selectedScreen.type);
    console.log("🎯 Выбранный шаг пикселя:", selectedPixelStep);

    const availableCabinets = cabinets
      .filter((cabinet) => cabinet.type === selectedScreen.type && cabinet.pixelOption.includes(selectedPixelStep))
      .sort((a, b) => a.name.localeCompare(b.name)); // ✅ Сортируем по алфавиту

    console.log("✅ Доступные кабинеты после фильтрации:", availableCabinets);
    setFilteredCabinets(availableCabinets);
  }, [screenType, selectedPixelStep, cabinets, screenTypes]);

  return (
    <Stack gap="xs">
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="Ширина экрана (мм)"
            type="number"
            value={width}
            onChange={(event) => setWidth(event.currentTarget.value)}
            required
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="Высота экрана (мм)"
            type="number"
            value={height}
            onChange={(event) => setHeight(event.currentTarget.value)}
            required
          />
        </Grid.Col>
      </Grid>

      {/* Выбор типа экрана */}
      <Select
        label="Тип экрана"
        placeholder="Выберите тип"
        data={screenTypes.map((type) => ({ value: type.name, label: type.name }))}
        value={screenType}
        onChange={(value) => {
          setScreenType(value);
          setSelectedPixelStep(null);
        }}
        disabled={!isSizeValid} // 🔥 Блокируем, пока не введены ширина и высота
        required
      />

      {/* Выбор шага пикселя */}
      <Select
        label="Шаг пикселя"
        placeholder={loadingSteps ? "Загрузка..." : "Выберите шаг"}
        data={filteredPixelSteps.map((step) => ({ value: step, label: step }))}
        disabled={!isScreenTypeSelected || loadingSteps || filteredPixelSteps.length === 0} // 🔥 Блокируем, пока не выбран тип экрана
        value={selectedPixelStep}
        onChange={setSelectedPixelStep}
        required
      />

      {/* Выбор кабинета */}
      <Select
        label="Кабинет"
        placeholder="Выберите кабинет"
        data={filteredCabinets.map((cabinet) => ({ value: cabinet.id.toString(), label: cabinet.name }))}
        disabled={!isPixelStepSelected || loadingCabinets || filteredCabinets.length === 0} // 🔥 Блокируем, пока не выбран шаг пикселя
        required
      />
    </Stack>
  );
};

export default ScreenTypeSelect;