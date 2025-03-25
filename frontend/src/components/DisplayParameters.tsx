import { useState, useEffect } from "react";
import {
  Select,
  Stack,
  TextInput,
  Grid,
  Button,
  Checkbox,
} from "@mantine/core";
import classes from "../styles/DisplayParameters.module.scss";
import CalculationResults from "./CalculationResults";

const DisplayParameters = () => {
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [screenType, setScreenType] = useState<string | null>(null);
  const [screenTypes, setScreenTypes] = useState<{ name: string; material: string[]; option: string[] }[] >([]);
  const [pixelSteps, setPixelSteps] = useState<{
    id: number;
    name: string;
    type: string;
    brightness: number;
    refreshFreq: number;
    location: string[];
    option: string[];
  }[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

  const [availableOptions, setAvailableOptions] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const [protectionOptions, setProtectionOptions] = useState<{ code: string }[]>([]); // 🆕 Степень защиты
  const [selectedProtection, setSelectedProtection] = useState<string | null>(null); // 🆕 Степень защиты

  const [filteredPixelSteps, setFilteredPixelSteps] = useState<string[]>([]);
  const [selectedPixelStep, setSelectedPixelStep] = useState<string | null>(null);  

  const [cabinets, setCabinets] = useState<CabinetType[]>([]);
  const [filteredCabinets, setFilteredCabinets] = useState<CabinetType[]>([]);
  
  const [selectedCabinet, setSelectedCabinet] = useState<CabinetType | null>(null);
  const [loadingSteps, setLoadingSteps] = useState<boolean>(false);
  const [loadingCabinets, setLoadingCabinets] = useState<boolean>(false);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [drawerOpened, setDrawerOpened] = useState<boolean>(false);

  // Проверяем, заполнены ли все поля перед активацией кнопки "Рассчитать"
  const isSizeValid = width.trim() !== "" && height.trim() !== "";
  const isScreenTypeSelected = isSizeValid && !!screenType;
  const isPixelStepSelected = isScreenTypeSelected && !!selectedPixelStep;
  const isCabinetSelected = isPixelStepSelected && !!selectedCabinet;
  const isMaterialSelected = isSizeValid && !!screenType && !!selectedMaterial;

  // Загружаем данные
  useEffect(() => {
    fetch("http://localhost:5000/screen-types")
      .then((res) => res.json())
      .then((data) => {
        console.log("Данные типов экранов:", data.types); // Логирование для отладки
        setScreenTypes(data.types);
      })
      .catch((error) =>
        console.error("❌ Ошибка загрузки типов экранов:", error)
      );
  }, []);

  // Фетч степеней защиты (только IP29 - IP69)
  useEffect(() => {
    fetch("http://localhost:5000/protection")
      .then((res) => res.json())
      .then((data) => {
        console.log("🔍 Данные из API:", data); // 👉 Логируем ответ сервера
        const filtered = data.protections.filter((p: { code: string }) => {
          const ipNumber = parseInt(p.code.replace("IP", ""), 10);
          return ipNumber >= 29 && ipNumber <= 69;
        });
        console.log("📌 Отфильтрованные данные:", filtered); // 👉 Логируем после фильтрации
        setProtectionOptions(filtered);
      })
      .catch((error) =>
        console.error("❌ Ошибка загрузки степеней защиты:", error)
      );
  }, []);

  // Устанавливаем дефолтное значение защиты при смене типа экрана
  useEffect(() => {
    if (!screenType) return;

    const defaultProtection = screenType === "интерьерный" ? "IP30" : "IP65";
    console.log("🔄 Смена экрана:", screenType, "| Устанавливаем защиту:", defaultProtection);

    setSelectedProtection(defaultProtection);
  }, [screenType]);

  // 🔥 🔄 Форсируем обновление Select (React не всегда ререндерит)
  useEffect(() => {
    console.log("✅ selectedProtection обновился:", selectedProtection);
  }, [selectedProtection]);


  type PixelStep = {
    id: number;
    name: string;
    type: string;
    width: number;
    height: number;
    brightness: number;
    refreshFreq: number;
    location: string;
    option: string[];
  };


  useEffect(() => {
    setLoadingSteps(true);
    fetch("http://localhost:5000/pixel-steps")
      .then((res) => res.json())
      .then((data) => 
        setPixelSteps(
          data.steps.map((pixelStep: PixelStep) => ({
            id: pixelStep.id,
            name: pixelStep.name,
            type: pixelStep.type,
            width: pixelStep.width,
            height: pixelStep.height,
            brightness: pixelStep.brightness,
            refreshFreq: pixelStep.refreshFreq,
            location: pixelStep.location,
            option: pixelStep.option,
          }))
        )
      )
      .catch((error) =>
        console.error("❌ Ошибка загрузки шагов пикселя:", error))
      .finally(() => setLoadingSteps(false));
  }, []);

  

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

  useEffect(() => {
    setLoadingCabinets(true);
    fetch("http://localhost:5000/cabinets")
      .then((res) => res.json())
      .then((data) =>
        setCabinets(
          data.cabinets.map((cabinet: CabinetType) => ({
            id: cabinet.id,
            name: cabinet.name,
            width: cabinet.width || 0,
            height: cabinet.height || 0,
            location: cabinet.location,
            pixelStep: cabinet.pixelStep,
            material: cabinet.material,
            modulesQ: cabinet.modulesQ || 0,
            powerUnitQ: cabinet.powerUnitQ || 0,
            receiver: cabinet.receiver || 0,
          }))
        )
      )
      .catch((error) => console.error("❌ Ошибка загрузки кабинетов:", error))
      .finally(() => setLoadingCabinets(false));
  }, []);

  // Фильтруем опции типа экрана после выбора материала
  useEffect(() => {
    if (!screenType || !selectedMaterial) {
      setAvailableOptions([]);
      setSelectedOptions([]);
      return;
    }

    const selectedScreen = screenTypes.find((type) => type.name === screenType);
    if (!selectedScreen) return;

    setAvailableOptions(selectedScreen.option);
    setSelectedOptions([]); // Сбрасываем выбранные опции при смене материала
  }, [screenType, selectedMaterial, screenTypes]);

  // Фильтруем шаги пикселя после выбора типа экрана
  useEffect(() => {
    if (!screenType || !selectedMaterial) {
      setFilteredPixelSteps([]);
      return;
    }

    const selectedScreen = screenTypes.find((type) => type.name === screenType);
    if (!selectedScreen) return;

    let steps = pixelSteps.filter((step) =>
      step.location.includes(selectedScreen.name)
    );
    

    // 🔥 Если выбрана опция "гибкий экран", фильтруем по наличию в option
    if (selectedOptions.includes("гибкий экран")) {
      steps = steps.filter((step) => step.option.includes("гибкий экран"));
    }

    setFilteredPixelSteps(steps.map((step) => step.name));
    setSelectedPixelStep(null);
    setSelectedCabinet(null);
  }, [screenType, selectedMaterial, selectedOptions, pixelSteps, screenTypes]);

  // Фильтруем кабинеты только после выбора шага пикселя
  useEffect(() => {
    if (!screenType || !selectedPixelStep || !selectedMaterial) {
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
        .filter(
          (cabinet) =>
            cabinet.location === selectedScreen.name &&
            cabinet.pixelStep.includes(selectedPixelStep) &&
            cabinet.material.includes(selectedMaterial) // 🔥 Фильтр по материалу
        )
        .sort((a, b) => a.name.localeCompare(b.name))
    );

    setSelectedCabinet(null);
  }, [screenType, selectedPixelStep, selectedMaterial, cabinets, screenTypes]);

  // Получаем имя выбранного кабинета
  //const selectedCabinetName = selectedCabinet ? selectedCabinet.name : null;

    // 🔥 Добавляем обработку курса валют
    useEffect(() => {
      fetch("https://www.cbr-xml-daily.ru/daily_json.js")
        .then((res) => res.json())
        .then((data) => {
          console.log("📡 Ответ API ЦБ РФ:", data);
          if (data && data.Valute && data.Valute.USD) {
            setExchangeRate(parseFloat(data.Valute.USD.Value.toFixed(2))); 
          } else {
            console.error("❌ Ошибка: структура ответа API ЦБ РФ изменилась!", data);
          }
        })
        .catch((error) => console.error("❌ Ошибка загрузки курса валют:", error));
    }, []); 

  // Данные для передачи в компонент результатов
  const calculationData = {
    width,
    height,
    screenType,
    selectedProtection,
    selectedMaterial,
    pixelSteps,
    selectedPixelStep,
    selectedCabinet: selectedCabinet ? { 
      id: selectedCabinet.id,
      name: selectedCabinet.name,
      width: selectedCabinet.width,
      height: selectedCabinet.height,
      pixelStep: selectedCabinet.pixelStep,
      material: selectedCabinet.material,
      modulesQ: selectedCabinet.modulesQ ?? 0, //
      powerUnitQ: selectedCabinet.powerUnitQ ?? 0, //
      receiver: selectedCabinet.receiver ?? 0 //
    } : null,
    cabinetName: selectedCabinet ? selectedCabinet.name : null,
    cabinetWidth: selectedCabinet ? selectedCabinet.width : null,
    cabinetHeight: selectedCabinet ? selectedCabinet.height : null,
    selectedOptions,
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
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <div>
              <label className={classes.checkboxGroupLabel}>Тип экрана</label>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {screenTypes.map((type) => (
                  <Checkbox
                    classNames={classes}
                    key={type.name}
                    label={type.name}
                    checked={screenType === type.name}
                    onChange={(event) => {
                      if (event.currentTarget.checked) {
                        setScreenType(type.name);
                      } else if (screenType === type.name) {
                        setScreenType(null);
                      }
                      setSelectedPixelStep(null);
                      setSelectedCabinet(null);
                    }}
                    disabled={!isSizeValid}
                  />
                ))}
              </div>
            </div>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <div>
              <label className={classes.checkboxGroupLabel}>Материал</label>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {(screenType 
                  ? screenTypes.find((type) => type.name === screenType)?.material || []
                  : screenTypes.flatMap(type => type.material).filter((v, i, a) => a.indexOf(v) === i)
                ).map((mat) => (
                  <Checkbox
                    classNames={classes}
                    key={mat}
                    label={mat}
                    checked={selectedMaterial === mat}
                    onChange={(event) => {
                      if (event.currentTarget.checked) {
                        setSelectedMaterial(mat);
                      } else if (selectedMaterial === mat) {
                        setSelectedMaterial(null);
                      }
                    }}
                    disabled={!screenType}
                  />
                ))}
              </div>
            </div>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Select
              label="Степень защиты"
              placeholder="Выберите степень защиты"
              data={protectionOptions.map((p) => ({
                value: p.code,
                label: p.code,
              }))}
              value={selectedProtection}
              onChange={setSelectedProtection}
              disabled={!screenType} // Активируется после выбора типа экрана
              required
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 12 }}>
            {availableOptions.length > 0 && (
              <Stack>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {availableOptions.map((option) => (
                    <Checkbox
                      classNames={classes}
                      key={option}
                      label={option}
                      checked={selectedOptions.includes(option)}
                      onChange={(event) => {
                        const updatedOptions = event.currentTarget.checked
                          ? [...selectedOptions, option]
                          : selectedOptions.filter((opt) => opt !== option);
                        setSelectedOptions(updatedOptions);
                      }}
                    />
                  ))}
                </div>
              </Stack>
            )}
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 12 }}>
            <Select
              label="Шаг пикселя"
              placeholder={loadingSteps ? "Загрузка..." : "Выберите шаг"}
              data={filteredPixelSteps.map((step) => ({
                value: step,
                label: step,
              }))}
              disabled={
                !isMaterialSelected ||
                loadingSteps ||
                filteredPixelSteps.length === 0
              }
              value={selectedPixelStep}
              onChange={(value) => {
                setSelectedPixelStep(value);
                setSelectedCabinet(null);
              }}
              required
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 12 }}>
            <Select
              label="Кабинет"
              placeholder="Выберите кабинет"
              data={filteredCabinets.map((cabinet) => ({
                value: cabinet.id.toString(),
                label: cabinet.name,
              }))}
              disabled={
                !isPixelStepSelected ||
                loadingCabinets ||
                filteredCabinets.length === 0
              }
              value={selectedCabinet ? selectedCabinet.id.toString() : null}
              onChange={(value) => {
                const cabinetObj = filteredCabinets.find((c) => c.id.toString() === value);
                setSelectedCabinet(cabinetObj || null);
              }}
              required
            />
          </Grid.Col>
        </Grid>

        {isCabinetSelected && (
  <Grid align="center">
    <Grid.Col span="content">
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span role="img" aria-label="USD">🇺🇸</span>
        <TextInput
          type="number"
          value={exchangeRate !== null ? exchangeRate.toString() : ""}
          onChange={(event) => setExchangeRate(parseFloat(event.currentTarget.value))}
          required
          style={{ width: "80px" }}
        />
      </div>
    </Grid.Col>
    <Grid.Col span="auto">
      <Button fullWidth onClick={() => setDrawerOpened(true)}>Рассчитать</Button>
    </Grid.Col>
  </Grid>
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
