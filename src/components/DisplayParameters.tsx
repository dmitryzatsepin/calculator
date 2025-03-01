import { useState, useEffect } from "react";
import { Select, Stack, TextInput, Grid, Button } from "@mantine/core";
import '@mantine/core/styles/global.css';
import CalculationResults from "./CalculationResults";

const DisplayParameters = () => {
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [screenType, setScreenType] = useState<string | null>(null);
  const [screenTypes, setScreenTypes] = useState<{ name: string; material: string[]; option: string[] }[]>([]);
  const [pixelSteps, setPixelSteps] = useState<{ id: number; name: string; type: string; location: string[]; option: string[] }[]>([]);
  const [filteredPixelSteps, setFilteredPixelSteps] = useState<string[]>([]);
  const [selectedPixelStep, setSelectedPixelStep] = useState<string | null>(null);
  const [cabinets, setCabinets] = useState<{ id: number; name: string; location: string; pixelStep: string[] }[]>([]);
  const [filteredCabinets, setFilteredCabinets] = useState<{ id: number; name: string; location: string; pixelStep: string[] }[]>([]);
  const [selectedCabinet, setSelectedCabinet] = useState<string | null>(null);
  const [loadingSteps, setLoadingSteps] = useState<boolean>(false);
  const [loadingCabinets, setLoadingCabinets] = useState<boolean>(false);
  const [drawerOpened, setDrawerOpened] = useState<boolean>(false);

  // Проверяем, заполнены ли все поля перед активацией кнопки "Рассчитать"
  const isSizeValid = width.trim() !== "" && height.trim() !== "";
  const isScreenTypeSelected = isSizeValid && !!screenType;
  const isPixelStepSelected = isScreenTypeSelected && !!selectedPixelStep;
  const isCabinetSelected = isPixelStepSelected && !!selectedCabinet;

  // Загружаем данные
  useEffect(() => {
    fetch("http://localhost:5000/screen-types")
      .then((res) => res.json())
      .then((data) => setScreenTypes(data.types))
      .catch((error) => console.error("❌ Ошибка загрузки типов экранов:", error));
  }, []);

  useEffect(() => {
    setLoadingSteps(true);
    fetch("http://localhost:5000/pixel-steps")
      .then((res) => res.json())
      .then((data) => setPixelSteps(data.steps))
      .catch((error) => console.error("❌ Ошибка загрузки шагов пикселя:", error))
      .finally(() => setLoadingSteps(false));
  }, []);

  useEffect(() => {
    setLoadingCabinets(true);
    fetch("http://localhost:5000/cabinets")
      .then((res) => res.json())
      .then((data) => setCabinets(data.cabinets))
      .catch((error) => console.error("❌ Ошибка загрузки кабинетов:", error))
      .finally(() => setLoadingCabinets(false));
  }, []);

  // Фильтруем шаги пикселя после выбора типа экрана
  useEffect(() => {
    if (!screenType) {
      setFilteredPixelSteps([]);
      return;
    }

    const selectedScreen = screenTypes.find((type) => type.name === screenType);
    if (!selectedScreen) return;

    setFilteredPixelSteps(
      pixelSteps
        .filter((step) => step.location.includes(selectedScreen.name))
        .map((step) => step.name)
    );
    setSelectedPixelStep(null);
    setSelectedCabinet(null);
  }, [screenType, pixelSteps, screenTypes]);

  // Фильтруем кабинеты только после выбора шага пикселя
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

    setFilteredCabinets(
      cabinets
        .filter((cabinet) => cabinet.location === selectedScreen.name && cabinet.pixelStep.includes(selectedPixelStep))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    setSelectedCabinet(null);
  }, [screenType, selectedPixelStep, cabinets, screenTypes]);

  // Получаем имя выбранного кабинета
  const selectedCabinetName = selectedCabinet 
    ? filteredCabinets.find(c => c.id.toString() === selectedCabinet)?.name || null
    : null;

  // Данные для передачи в компонент результатов
  const calculationData = {
    width,
    height,
    screenType,
    selectedPixelStep,
    selectedCabinet,
    cabinetName: selectedCabinetName
  };

  return (
    <>
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

        <Select
          label="Тип экрана"
          placeholder="Выберите тип"
          data={screenTypes.map((type) => ({ value: type.name, label: type.name }))}
          value={screenType}
          onChange={(value) => {
            setScreenType(value);
            setSelectedPixelStep(null);
            setSelectedCabinet(null);
          }}
          disabled={!isSizeValid}
          required
        />

        <Select
          label="Шаг пикселя"
          placeholder={loadingSteps ? "Загрузка..." : "Выберите шаг"}
          data={filteredPixelSteps.map((step) => ({ value: step, label: step }))}
          disabled={!isScreenTypeSelected || loadingSteps || filteredPixelSteps.length === 0}
          value={selectedPixelStep}
          onChange={(value) => {
            setSelectedPixelStep(value);
            setSelectedCabinet(null);
          }}
          required
        />

        <Select
          label="Кабинет"
          placeholder="Выберите кабинет"
          data={filteredCabinets.map((cabinet) => ({ value: cabinet.id.toString(), label: cabinet.name }))}
          disabled={!isPixelStepSelected || loadingCabinets || filteredCabinets.length === 0}
          value={selectedCabinet}
          onChange={setSelectedCabinet}
          required
        />

        {/* Кнопка "Рассчитать" появляется только после выбора кабинета */}
        {isCabinetSelected && (
          <Button onClick={() => setDrawerOpened(true)} fullWidth>
            Рассчитать
          </Button>
        )}
      </Stack>

      {/* Используем отдельный компонент для отображения результатов */}
      <CalculationResults 
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        data={calculationData}
      />
    </>
  );
};

export default DisplayParameters;