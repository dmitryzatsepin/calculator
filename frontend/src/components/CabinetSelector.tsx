// src/components/CabinetSelector.tsx
import { Grid, Select, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

type SelectOption = { value: string; label: string; };

interface CabinetSelectorProps {
  // Базовые статусы
  isUIBlocked: boolean; // Общая загрузка или ошибка API
  overallErrorString: string | null; // Общая строка ошибок API

  // Выбранные значения родительских элементов
  selectedPitchCode: string | null;
  selectedMaterialCode: string | null; // Для плейсхолдера

  // Текущее значение
  value: string | null;

  // Опции
  options: SelectOption[];

  // Ошибки/статусы специфичные для кабинетов (если остались)
  filterError: string | null; // Ошибка логики фильтрации (из useMemo)

  // Обработчик
  onChange: (value: string | null) => void;
}

const CabinetSelector = ({
  isUIBlocked,
  overallErrorString,
  selectedPitchCode,
  selectedMaterialCode, // Используем для плейсхолдера
  value,
  options,
  filterError,
  onChange,
}: CabinetSelectorProps) => {

  // --- Вычисление Disabled статуса ВНУТРИ компонента ---
  // Заблокирован, если UI заблокирован, не выбран питч, есть ошибка фильтрации или нет опций
  const isDisabled = isUIBlocked || !selectedPitchCode || !!filterError || (!isUIBlocked && options.length === 0);

  // --- Плейсхолдер ---
  const placeholder =
    isUIBlocked ? "Загрузка..."
    : !selectedMaterialCode ? "Выберите материал" // Проверяем предыдущий видимый шаг
    : !selectedPitchCode ? "Выберите шаг пикселя"
    : filterError ? "Ошибка фильтрации"
    : overallErrorString ? "Ошибка данных" // Показываем, если была общая ошибка API
    : options.length === 0 ? "Нет подходящих кабинетов"
    : "Выберите кабинет";

  return (
    <Grid.Col span={12}>
      {/* Ошибка ЛОГИКИ фильтрации кабинетов */}
      {filterError && !isUIBlocked && (
        <Alert title="Ошибка выбора кабинета" color="orange" radius="sm" mb={5} icon={<IconAlertCircle size={16} />}>
          {filterError}
        </Alert>
      )}
      <Select
        label="Кабинет"
        placeholder={placeholder}
        data={options}
        value={value}
        onChange={onChange}
        disabled={isDisabled} // Используем вычисленный статус
        required searchable clearable
      />
    </Grid.Col>
  );
};

export default CabinetSelector;