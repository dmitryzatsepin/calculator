import { useState, useEffect } from "react";
import { Select, Stack, Loader, TextInput, Grid } from "@mantine/core";
import classes from "../styles/FloatingLabelInput.module.css";

const ScreenTypeSelect = () => {
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [screenType, setScreenType] = useState<string | null>(null);
  const [screenTypes, setScreenTypes] = useState<{ name: string; screenOption: string[] }[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
        console.log("📥 Полученные данные с API:", data);

        if (!data || !Array.isArray(data.types)) { // ✅ Теперь ждем `types`
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

  // 📌 Получаем доступные опции для выбранного типа экрана
  const currentOptions = screenTypes.find((type) => type.name === screenType)?.screenOption || [];

  return (
    <Stack gap="xs"> {/* ✅ Уменьшил отступы */}
      <Grid>
        {/* Инпут Ширина */}
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="Ширина экрана (мм)"
            type="number"
            classNames={classes}
            value={width}
            onChange={(event) => setWidth(event.currentTarget.value)}
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
            setSelectedOption(null); // Сбрасываем выбор при смене типа экрана
          }}
          required
        />
      )}

      {/* Радио-кнопки для выбора одной опции */}
      {screenType && currentOptions.length > 0 && (
        <div style={{ display: "flex", gap: "15px", marginTop: "-5px" }}> {/* ✅ Подвинул ближе */}
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
    </Stack>
  );
};

export default ScreenTypeSelect;