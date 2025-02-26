import { useState, useEffect } from "react";
import { Select, Stack, Loader, TextInput, Grid } from "@mantine/core";
import classes from "../styles/FloatingLabelInput.module.css";

const ScreenTypeSelect = () => {
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [screenType, setScreenType] = useState<string | null>(null);
  const [screenTypes, setScreenTypes] = useState<{ name: string; type: string; screenOption: string[] }[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [pixelSteps, setPixelSteps] = useState<{ name: string; type: string }[]>([]);
  const [filteredPixelSteps, setFilteredPixelSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingSteps, setLoadingSteps] = useState<boolean>(false);
  const [focusedWidth, setFocusedWidth] = useState(false);
  const [focusedHeight, setFocusedHeight] = useState(false);

  // 📌 Загружаем типы экранов с сервера
  useEffect(() => {
    const fetchScreenTypes = async () => {
      try {
        const response = await fetch("http://localhost:5000/screen-types", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("📥 Полученные типы экранов:", data);

        if (!data || !Array.isArray(data.types)) {
          throw new Error("⚠ Неверный формат данных");
        }

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
        const response = await fetch("http://localhost:5000/pixel-steps", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("📥 Полученные шаги пикселя:", data);

        if (!data || !Array.isArray(data.steps)) {
          throw new Error("⚠ Неверный формат данных");
        }

        setPixelSteps(data.steps);
      } catch (error) {
        console.error("❌ Ошибка загрузки шагов пикселя:", error);
      } finally {
        setLoadingSteps(false);
      }
    };

    fetchPixelSteps();
  }, []);

  // 📌 Фильтруем шаги пикселя по выбранному типу экрана
  useEffect(() => {
    if (!screenType) return setFilteredPixelSteps([]);

    const selectedScreen = screenTypes.find((type) => type.name === screenType);
    if (!selectedScreen) return;

    const availableSteps = pixelSteps
      .filter((step) => step.type === selectedScreen.type)
      .map((step) => step.name)
      .sort((a, b) => a.localeCompare(b)); // 📌 Сортировка ASC

    setFilteredPixelSteps(availableSteps);
  }, [screenType, pixelSteps, screenTypes]);

  // 📌 Получаем доступные опции для выбранного типа экрана
  const currentOptions = screenTypes.find((type) => type.name === screenType)?.screenOption || [];

  return (
    <Stack gap="xs">
      <Grid>
        {/* Инпут Ширина */}
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="Ширина экрана (мм)"
            type="number"
            classNames={classes}
            value={width}
            onChange={(event) => setWidth(event.currentTarget.value)}
            onFocus={() => setFocusedWidth(true)}
            onBlur={() => setFocusedWidth(false)}
            data-floating={width.trim().length !== 0 || focusedWidth || undefined}
            labelProps={{ "data-floating": width.trim().length !== 0 || focusedWidth || undefined }}
            required
          />
        </Grid.Col>

        {/* Инпут Высота */}
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="Высота экрана (мм)"
            type="number"
            classNames={classes}
            value={height}
            onChange={(event) => setHeight(event.currentTarget.value)}
            onFocus={() => setFocusedHeight(true)}
            onBlur={() => setFocusedHeight(false)}
            data-floating={height.trim().length !== 0 || focusedHeight || undefined}
            labelProps={{ "data-floating": height.trim().length !== 0 || focusedHeight || undefined }}
            required
          />
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
            setSelectedOption(null);
          }}
          required
        />
      )}

      {/* Радио-кнопки для выбора одной опции */}
      {screenType && currentOptions.length > 0 && (
        <div style={{ display: "flex", gap: "15px", marginTop: "-5px" }}>
          {currentOptions.map((option) => (
            <label key={option} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <input
                type="radio"
                name="screenOption"
                value={option}
                checked={selectedOption === option}
                onChange={() => setSelectedOption(option)}
              />
              {option}
            </label>
          ))}
        </div>
      )}

      {/* Выбор шага пикселя */}
      {screenType && (
        <Select
          label="Шаг пикселя *"
          placeholder={loadingSteps ? "Загрузка..." : "Выберите шаг"}
          data={filteredPixelSteps.map((step) => ({ value: step, label: step }))}
          disabled={loadingSteps || filteredPixelSteps.length === 0}
          required
        />
      )}
    </Stack>
  );
};

export default ScreenTypeSelect;