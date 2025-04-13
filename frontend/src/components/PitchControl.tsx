// src/components/PitchControl.tsx
import React from 'react';
import { Grid, Select, Box, Switch, TextInput } from "@mantine/core";

type SelectOption = { value: string; label: string; };

interface PitchControlProps {
  // Базовые статусы
    selectedMaterialCode: string | null;
  selectedProtectionCode: string | null;
  isUIBlocked: boolean;
  disabled?: boolean;

  // Текущие значения этого блока
  isProPitchType: boolean;
  selectedPitchCode: string | null;
  selectedRefreshRate: number | null;
  selectedBrightness: number | null;

  // Опции для селекта
  pitchOptions: SelectOption[];

  // Обработчики
  onPitchTypeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPitchChange: (value: string | null) => void;
}

const PitchControl = ({
  isUIBlocked,
  selectedMaterialCode,
  selectedProtectionCode,
  isProPitchType,
  selectedPitchCode,
  selectedRefreshRate,
  selectedBrightness,
  pitchOptions,
  onPitchTypeChange,
  onPitchChange,
}: PitchControlProps) => {

  // --- Вычисление Disabled статусов ВНУТРИ компонента ---
  // Блок неактивен, если UI заблокирован или не выбраны материал/защита
  const isControlDisabled = isUIBlocked || !selectedMaterialCode || !selectedProtectionCode;
  // Селект питча неактивен, если блок неактивен или нет опций
  const isSelectDisabled = isControlDisabled || pitchOptions.length === 0;

  // Плейсхолдер для селекта питча
  const pitchSelectPlaceholder =
    isControlDisabled ? "..." // Если весь блок неактивен
    : isUIBlocked ? "Загрузка..." // Если идет базовая загрузка (маловероятно здесь, но для полноты)
    : pitchOptions.length === 0 ? "Нет доступных" // Если нет опций
    : "Выберите шаг";

  // Стили для TextInput
  const textInputStyles = { input: { backgroundColor: 'var(--mantine-color-body)', color: 'var(--mantine-color-text)', cursor: 'default', ...(isControlDisabled && { backgroundColor: "var(--mantine-color-gray-1)", cursor: "not-allowed", color: 'var(--mantine-color-dimmed)' }) } };

  return (
    <Grid.Col span={12} mt="xs">
      <Grid gutter="md" align="flex-end">
        {/* Переключатель PRO/ECO */}
        <Grid.Col span={{ base: 12, sm: "auto" }}>
          <Box pb={5}>
            <Switch styles={{ description: { marginTop: '2px' } }} checked={isProPitchType} onChange={onPitchTypeChange} onLabel="PRO" offLabel="ECO" size="lg" disabled={isControlDisabled} />
          </Box>
        </Grid.Col>
        {/* Селект Шага пикселя */}
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Select label="Шаг пикселя" placeholder={pitchSelectPlaceholder} data={pitchOptions} value={selectedPitchCode} onChange={onPitchChange} disabled={isSelectDisabled} searchable clearable required />
        </Grid.Col>
        {/* Поля Rate/Brightness */}
        <Grid.Col span={{ base: 12, sm: "auto" }} style={{ flexGrow: 1 }}>
          <TextInput readOnly label="Частота, Гц" value={selectedRefreshRate !== null ? selectedRefreshRate.toString() : "---"} placeholder="---" styles={textInputStyles} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: "auto" }} style={{ flexGrow: 1 }}>
          <TextInput readOnly label="Яркость, кд/м²" value={selectedBrightness !== null ? selectedBrightness.toString() : "---"} placeholder="---" styles={textInputStyles} />
        </Grid.Col>
      </Grid>
    </Grid.Col>
  );
};

export default PitchControl;