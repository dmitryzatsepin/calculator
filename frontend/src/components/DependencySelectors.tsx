// src/components/DependencySelectors.tsx
import { Grid, Select, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
// Удаляем импорт типов
// import type { Location, Material, IpProtection } from "../types/api";

type SelectOption = { value: string; label: string; };

interface DependencySelectorsProps {
  // Базовые статусы
  isUIBlocked: boolean;
  isLoadingIpProtections: boolean;
  isErrorIpProtections: boolean;
  hasValidDimensions: boolean;
  // Выбранные значения родительских элементов
  selectedScreenTypeCode: string | null;
  // selectedLocationCode больше не нужен

  // Текущие значения этих селектов
  currentLocationCode: string | null;
  currentMaterialCode: string | null;
  currentProtectionCode: string | null;
  // Данные для опций
  locationOptions: SelectOption[];
  materialOptions: SelectOption[];
  protectionOptions: SelectOption[];
  // Ошибки (если нужны)
  locationError: string | null;
  materialError: string | null;
  // Обработчики изменений
  onLocationChange: (value: string | null) => void;
  onMaterialChange: (value: string | null) => void;
  onProtectionChange: (value: string | null) => void;
}

const DependencySelectors = ({
  isUIBlocked,
  isLoadingIpProtections,
  isErrorIpProtections,
  hasValidDimensions,
  selectedScreenTypeCode,
  // selectedLocationCode, // Удален
  currentLocationCode,
  currentMaterialCode,
  currentProtectionCode,
  locationOptions,
  materialOptions,
  protectionOptions,
  locationError,
  materialError,
  onLocationChange,
  onMaterialChange,
  onProtectionChange,
}: DependencySelectorsProps) => {

    // Вычисление Disabled статусов
    const isLocationDisabled = isUIBlocked || !selectedScreenTypeCode || !!locationError || !hasValidDimensions;
    const isMaterialDisabled = isLocationDisabled || !currentLocationCode || !!materialError;
    const isProtectionDisabled = isLocationDisabled || !currentLocationCode || isLoadingIpProtections || isErrorIpProtections;
    const finalLocationDisabled = isLocationDisabled || (!isUIBlocked && locationOptions.length === 0);
    const finalMaterialDisabled = isMaterialDisabled || (!isUIBlocked && !!currentLocationCode && materialOptions.length === 0);
    const finalProtectionDisabled = isProtectionDisabled || (!isUIBlocked && !!currentLocationCode && protectionOptions.length === 0);

    // Плейсхолдеры
    const locationPlaceholder = /* ... */ isUIBlocked ? "Загрузка..." : !selectedScreenTypeCode ? "Выберите тип экрана" : !hasValidDimensions ? "Введите размеры" : locationError ? "Ошибка загрузки" : locationOptions.length === 0 ? "Нет доступных" : "Выберите место";
    const materialPlaceholder = /* ... */ isLocationDisabled ? "..." : !currentLocationCode ? "Выберите место" : materialError ? "Ошибка загрузки" : materialOptions.length === 0 ? "Нет доступных" : "Выберите материал";
    const protectionPlaceholder = /* ... */ isLocationDisabled || !currentLocationCode ? "..." : isLoadingIpProtections ? "Загрузка..." : isErrorIpProtections ? "Ошибка загрузки" : protectionOptions.length === 0 ? "Нет данных" : "Выберите степень";

  return (
    <>
      <Grid.Col span={{ base: 12, sm: 4 }}>
        {locationError && !isUIBlocked && ( <Alert title="Ошибка мест установки" color="orange" radius="sm" mb={5} icon={<IconAlertCircle size={16} />}> {locationError} </Alert> )}
        <Select label="Место установки" placeholder={locationPlaceholder} data={locationOptions} value={currentLocationCode} onChange={onLocationChange} disabled={finalLocationDisabled} searchable clearable required />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 4 }}>
        {materialError && !isUIBlocked && ( <Alert title="Ошибка материалов" color="orange" radius="sm" mb={5} icon={<IconAlertCircle size={16} />}> {materialError} </Alert> )}
        <Select label="Материал" placeholder={materialPlaceholder} data={materialOptions} value={currentMaterialCode} onChange={onMaterialChange} disabled={finalMaterialDisabled} searchable clearable required />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Select label="Степень защиты" placeholder={protectionPlaceholder} data={protectionOptions} value={currentProtectionCode} onChange={onProtectionChange} disabled={finalProtectionDisabled} searchable clearable required />
      </Grid.Col>
    </>
  );
};

export default DependencySelectors;