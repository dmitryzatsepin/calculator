// src/components/DependencySelectors.tsx
import { Grid, Select, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

// Тип для опций Select
type SelectOption = {
  value: string;
  label: string;
};

interface DependencySelectorsProps {
  // Состояния для плейсхолдеров и логики
  selectedScreenTypeCode: string | null;
  selectedLocationCode: string | null;
  selectedMaterialCode: string | null; // Передаем, хотя используется косвенно в isMaterialSelectDisabled
  selectedProtectionCode: string | null;
  hasValidDimensions: boolean;

  // Данные для опций
  locationOptions: SelectOption[];
  materialOptions: SelectOption[];
  protectionOptions: SelectOption[];

  // Состояния загрузки
  loadingLocations: boolean;
  loadingMaterials: boolean;
  loadingBaseData: boolean; // Для защиты

  // Состояния ошибок
  locationError: string | null;
  materialError: string | null;
  // baseDataError не нужен здесь для Alert, но нужен для isProtectionSelectDisabled

  // Флаги блокировки (базовые, вычисленные в родителе)
  isLocationSelectDisabled: boolean;
  isMaterialSelectDisabled: boolean;
  isProtectionSelectDisabled: boolean;

  // Обработчики изменений
  onLocationChange: (value: string | null) => void;
  onMaterialChange: (value: string | null) => void;
  onProtectionChange: (value: string | null) => void;
}

const DependencySelectors = ({
  selectedScreenTypeCode,
  selectedLocationCode,
  selectedMaterialCode, // Принимаем пропс
  selectedProtectionCode,
  hasValidDimensions,
  locationOptions,
  materialOptions,
  protectionOptions,
  loadingLocations,
  loadingMaterials,
  loadingBaseData,
  locationError,
  materialError,
  isLocationSelectDisabled,
  isMaterialSelectDisabled,
  isProtectionSelectDisabled,
  onLocationChange,
  onMaterialChange,
  onProtectionChange,
}: DependencySelectorsProps) => {

  const locationPlaceholder =
    isLocationSelectDisabled && !loadingLocations && !locationError && hasValidDimensions && !!selectedScreenTypeCode ? "..."
    : !selectedScreenTypeCode ? "Выберите тип экрана"
    : !hasValidDimensions ? "Введите размеры"
    : loadingLocations ? "Фильтрация..."
    : locationOptions.length === 0 ? "Нет доступных"
    : "Выберите место";

  const materialPlaceholder =
    isMaterialSelectDisabled && !loadingMaterials && !materialError && !!selectedLocationCode ? "..."
    : !selectedLocationCode ? "Выберите место"
    : loadingMaterials ? "Фильтрация..."
    : materialOptions.length === 0 ? "Нет доступных"
    : "Выберите материал";

  const protectionPlaceholder =
    isProtectionSelectDisabled && !loadingBaseData && !!selectedLocationCode ? "..."
    : !selectedLocationCode ? "Выберите место"
    : loadingBaseData ? "Загрузка..."
    : protectionOptions.length === 0 ? "Нет данных"
    : "Выберите степень";

  // --- Вычисление финальных флагов disabled (с учетом пустых опций ПОСЛЕ загрузки/фильтрации) ---
  const finalLocationDisabled = isLocationSelectDisabled || (!!selectedScreenTypeCode && !loadingLocations && locationOptions.length === 0);
  const finalMaterialDisabled = isMaterialSelectDisabled || (!!selectedLocationCode && !loadingMaterials && materialOptions.length === 0);
  const finalProtectionDisabled = isProtectionSelectDisabled || (!!selectedLocationCode && !loadingBaseData && protectionOptions.length === 0);

  return (
    <>
      {/* ---- Локация ---- */}
      <Grid.Col span={{ base: 12, sm: 4 }}>
        {locationError && !loadingLocations && (
          <Alert title="Ошибка локаций" color="orange" radius="sm" mb={5} icon={<IconAlertCircle size={16} />}>
            {locationError}
          </Alert>
        )}
        <Select
          label="Место установки"
          placeholder={locationPlaceholder}
          data={locationOptions}
          value={selectedLocationCode}
          onChange={onLocationChange}
          disabled={finalLocationDisabled}
          searchable
          clearable
          required
        />
      </Grid.Col>

      {/* ---- Материал ---- */}
      <Grid.Col span={{ base: 12, sm: 4 }}>
        {materialError && !loadingMaterials && (
          <Alert title="Ошибка материалов" color="orange" radius="sm" mb={5} icon={<IconAlertCircle size={16} />}>
            {materialError}
          </Alert>
        )}
        <Select
          label="Материал"
          placeholder={materialPlaceholder}
          data={materialOptions}
          value={selectedMaterialCode}
          onChange={onMaterialChange}
          disabled={finalMaterialDisabled}
          searchable
          clearable
          required
        />
      </Grid.Col>

      {/* ---- Защита ---- */}
      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Select
          label="Степень защиты"
          placeholder={protectionPlaceholder}
          data={protectionOptions}
          value={selectedProtectionCode}
          onChange={onProtectionChange}
          disabled={finalProtectionDisabled}
          searchable
          clearable
          required
        />
      </Grid.Col>
    </>
  );
};

export default DependencySelectors;