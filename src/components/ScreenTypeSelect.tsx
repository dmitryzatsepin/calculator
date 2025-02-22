import { useState, useEffect } from "react";
import { Select, Radio, Stack, Loader, TextInput } from "@mantine/core";
import classes from "../styles/FloatingLabelInput.module.css";

const availableOptions: Record<string, string[]> = {
  "Кабинетный": ["Монолит", "Гибкий экран"],
  "Уличный": ["Монолит"],
};

const ScreenTypeSelect = () => {
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [screenType, setScreenType] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [pixelStep, setPixelStep] = useState<string | null>(null);
  const [pixelSteps, setPixelSteps] = useState<{ name: string; type: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [focusedWidth, setFocusedWidth] = useState(false);
  const [focusedHeight, setFocusedHeight] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/pixel-steps", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.steps) {
          setPixelSteps(data.steps);
        } else {
          console.error("Ошибка: Неверный формат данных от сервера");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Ошибка загрузки шагов пикселя:", error);
        setLoading(false);
      });
  }, []);

  const filteredPixelSteps = pixelSteps
    ? pixelSteps
        .filter((step) => step.type === (screenType === "Кабинетный" ? "indoor" : "outdoor"))
        .map((step) => step.name)
    : [];

  return (
    <Stack gap="xl">
      {/* Инпут Ширина */}
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

        {/* Инпут Высота */}
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
      {/* Выбор типа экрана */}
      <Select
        label="Тип экрана *"
        placeholder="Выберите тип"
        data={Object.keys(availableOptions)}
        value={screenType}
        onChange={(value) => {
          setScreenType(value);
          setSelectedOption(null);
          setPixelStep(null);
        }}
        required
      />

      {/* Чекбоксы опций экрана */}
      {screenType && (
        <Radio.Group label="Опции экрана" value={selectedOption} onChange={setSelectedOption}>
          <Stack mt="xs">
            {availableOptions[screenType]?.map((option) => (
              <Radio key={option} value={option} label={option} />
            ))}
          </Stack>
        </Radio.Group>
      )}

      {/* Выбор шага пикселя */}
      {loading ? (
        <Loader size="sm" />
      ) : (
        <Select
          label="Шаг пикселя"
          placeholder="Выберите шаг"
          data={filteredPixelSteps}
          value={pixelStep}
          onChange={setPixelStep}
          required
        />
      )}
    </Stack>
  );
};

export default ScreenTypeSelect;
