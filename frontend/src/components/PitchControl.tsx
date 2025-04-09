// src/components/PitchControl.tsx
import React from 'react'; // Нужен для ChangeEvent
import { Grid, Select, Box, Switch, TextInput } from "@mantine/core";

// Тип для опций Select
type SelectOption = {
  value: string;
  label: string;
};

interface PitchControlProps {
  // Значения
  isProPitchType: boolean;
  selectedPitchCode: string | null;
  selectedRefreshRate: number | null;
  selectedBrightness: number | null;

  // Опции для селекта
  pitchOptions: SelectOption[];

  // Состояния
  loadingBaseData: boolean; // Для плейсхолдера селекта питча

  // Флаги блокировки
  isControlDisabled: boolean; // Общий флаг для блокировки всего блока
  isSelectDisabled: boolean;  // Отдельный флаг для блокировки только селекта питча

  // Обработчики
  onPitchTypeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPitchChange: (value: string | null) => void;
}

const PitchControl = ({
  isProPitchType,
  selectedPitchCode,
  selectedRefreshRate,
  selectedBrightness,
  pitchOptions,
  loadingBaseData,
  isControlDisabled, // Общий флаг
  isSelectDisabled,  // Флаг для селекта
  onPitchTypeChange,
  onPitchChange,
}: PitchControlProps) => {

  // Плейсхолдер для селекта питча
  const pitchSelectPlaceholder =
    isControlDisabled ? "..." // Если весь блок неактивен
    : loadingBaseData ? "Загрузка..." // Если идет базовая загрузка
    : pitchOptions.length === 0 ? "Нет доступных" // Если нет опций
    : "Выберите шаг"; // Стандартный

  // Стили для TextInput (имитация disabled)
  const textInputStyles = {
    input: {
      backgroundColor: 'var(--mantine-color-body)',
      color: 'var(--mantine-color-text)',
      cursor: 'default',
      ...(isControlDisabled && { // Применяем стили, если ВЕСЬ блок заблокирован
        backgroundColor: "var(--mantine-color-gray-1)",
        cursor: "not-allowed",
        color: 'var(--mantine-color-dimmed)'
      })
    }
  };

  return (
    <Grid.Col span={12} mt="xs">
      <Grid gutter="md" align="flex-end">
        {/* Переключатель PRO/ECO */}
        <Grid.Col span={{ base: 12, sm: "auto" }}>
          <Box pb={5}>
            <Switch
              styles={{ description: { marginTop: '2px' } }}
              checked={isProPitchType}
              onChange={onPitchTypeChange}
              onLabel="PRO"
              offLabel="ECO"
              size="lg"
              disabled={isControlDisabled} // Используем общий флаг
            />
          </Box>
        </Grid.Col>

        {/* Селект Шага пикселя */}
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Select
            label="Шаг пикселя"
            placeholder={pitchSelectPlaceholder}
            data={pitchOptions}
            value={selectedPitchCode}
            onChange={onPitchChange}
            disabled={isSelectDisabled} // Используем отдельный флаг
            searchable
            clearable
            required
          />
        </Grid.Col>

        {/* Поле Частота (только чтение) */}
        <Grid.Col span={{ base: 12, sm: "auto" }} style={{ flexGrow: 1 }}>
          <TextInput
            readOnly
            label="Частота, Гц"
            value={selectedRefreshRate !== null ? selectedRefreshRate.toString() : "---"}
            placeholder="---"
            styles={textInputStyles}
          />
        </Grid.Col>

        {/* Поле Яркость (только чтение) */}
        <Grid.Col span={{ base: 12, sm: "auto" }} style={{ flexGrow: 1 }}>
          <TextInput
            readOnly
            label="Яркость, кд/м²"
            value={selectedBrightness !== null ? selectedBrightness.toString() : "---"}
            placeholder="---"
            styles={textInputStyles}
          />
        </Grid.Col>
      </Grid>
    </Grid.Col>
  );
};

export default PitchControl;