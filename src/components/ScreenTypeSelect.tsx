import { useState, useEffect } from "react";
import { Select, Stack, Loader, TextInput, Grid } from "@mantine/core";

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
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingSteps, setLoadingSteps] = useState<boolean>(false);
  const [loadingCabinets, setLoadingCabinets] = useState<boolean>(false);

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
      } finally {
        setLoading(false);
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
    setSelectedPixelStep(null); // Сбрасываем выбор шага пикселя после смены типа экрана
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
      .filter((cabinet) => {
        const matchesType = cabinet.type === selectedScreen.type;
        const matchesPixelOption = cabinet.pixelOption.includes(selectedPixelStep);
        return matchesType && matchesPixelOption;
      })
      .sort((a, b) => a.name.localeCompare(b.name)); // 📌 Сортировка ASC (A → Z)

    console.log("✅ Доступные кабинеты после сортировки:", availableCabinets);
    setFilteredCabinets(availableCabinets);
  }, [screenType, selectedPixelStep, cabinets, screenTypes]);

  return (
    <Stack gap="xs">
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput label="Ширина экрана (мм)" type="number" value={width} onChange={(event) => setWidth(event.currentTarget.value)} required />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput label="Высота экрана (мм)" type="number" value={height} onChange={(event) => setHeight(event.currentTarget.value)} required />
        </Grid.Col>
      </Grid>

      {/* Выбор типа экрана */}
      {loading ? (
        <Loader size="sm" />
      ) : (
        <Select
          label="Тип экрана *"
          placeholder="Выберите тип"
          data={screenTypes.map((type) => ({ value: type.name, label: type.name }))}
          value={screenType}
          onChange={(value) => {
            setScreenType(value);
            setSelectedPixelStep(null); // Сбрасываем шаг пикселя
          }}
          required
        />
      )}

      {/* Выбор шага пикселя (Становится доступным после выбора типа экрана) */}
      {screenType && (
        <Select
          label="Шаг пикселя *"
          placeholder={loadingSteps ? "Загрузка..." : "Выберите шаг"}
          data={filteredPixelSteps.map((step) => ({ value: step, label: step }))}
          disabled={loadingSteps || filteredPixelSteps.length === 0}
          value={selectedPixelStep}
          onChange={setSelectedPixelStep} // 🔥 Вызываем фильтрацию кабинетов только при выборе шага пикселя
          required
        />
      )}

      {/* Выбор кабинета (Становится доступным после выбора шага пикселя) */}
      {selectedPixelStep && (
        <>
          {loadingCabinets ? (
            <Loader size="sm" />
          ) : (
            <Select
              label="Кабинет *"
              placeholder="Выберите кабинет"
              data={filteredCabinets.map((cabinet) => ({ value: cabinet.id.toString(), label: cabinet.name }))}
              disabled={loadingCabinets || filteredCabinets.length === 0}
              required
            />
          )}
        </>
      )}
    </Stack>
  );
};

export default ScreenTypeSelect;
