// src/components/CabinetSelector.tsx
import { Grid, Select, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

// Тип для опций Select
type SelectOption = {
  value: string;
  label: string;
};

// Пропсы для определения плейсхолдера
interface CabinetPlaceholderProps {
  isPreviousStepIncomplete: boolean; // Заблокирован ли предыдущий шаг (питч)
  isLoadingBaseData: boolean;
  isFiltering: boolean;
  filterError: string | null;
  baseDataError: string | null;
  optionsCount: number;
}

interface CabinetSelectorProps {
  options: SelectOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  disabled: boolean; // Финальный флаг disabled
  placeholderProps: CabinetPlaceholderProps;
  filterError: string | null; // Ошибка для Alert
  isFiltering: boolean;       // Состояние фильтрации для Alert
}

// Функция для определения текста плейсхолдера
const getCabinetPlaceholder = ({
  isPreviousStepIncomplete,
  isLoadingBaseData,
  isFiltering,
  filterError,
  baseDataError,
  optionsCount,
}: CabinetPlaceholderProps): string => {
  if (isPreviousStepIncomplete) return "..."; // Если питч не выбран или его блок заблокирован
  if (isLoadingBaseData) return "Загрузка данных...";
  if (isFiltering) return "Фильтрация...";
  if (filterError) return "Ошибка фильтрации";
  if (baseDataError) return "Ошибка данных";
  if (optionsCount === 0) return "Нет подходящих кабинетов";
  return "Выберите кабинет"; // Стандартный плейсхолдер
};

const CabinetSelector = ({
  options,
  value,
  onChange,
  disabled,
  placeholderProps,
  filterError,
  isFiltering,
}: CabinetSelectorProps) => {
  const placeholder = getCabinetPlaceholder(placeholderProps);

  return (
    <Grid.Col span={12}>
      {/* Ошибка фильтрации кабинетов */}
      {filterError && !isFiltering && (
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
        disabled={disabled}
        required
        searchable
        clearable
      />
    </Grid.Col>
  );
};

export default CabinetSelector;