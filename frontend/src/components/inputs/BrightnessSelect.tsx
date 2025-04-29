// src/components/inputs/BrightnessSelect.tsx
import { Select, Loader, SelectProps } from '@mantine/core';

// Опция для Mantine Select
type SelectOption = { label: string; value: string };

// Пропсы компонента
interface BrightnessSelectProps {
    options: SelectOption[];
    value: string | null;
    onChange: (value: string | null) => void;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    placeholder?: string;
    loading?: boolean;
    size?: SelectProps['size'];
}

const BrightnessSelect = ({
    options,
    value,
    onChange,
    disabled = false,
    required = false,
    label = "Яркость",
    placeholder = "Авто / Выберите яркость",
    loading = false,
    size,
}: BrightnessSelectProps) => {

    const getPlaceholder = () => {
        if (loading) return "Загрузка...";
        if (disabled && !loading) return "Выберите параметры выше";
        if (!options.length && !loading && !disabled) return "Нет доступных опций";
        return placeholder;
    };

    return (
        <Select
            label={label}
            placeholder={getPlaceholder()}
            data={options}
            value={value}
            onChange={onChange}
            disabled={disabled || loading || (options.length === 0 && !loading)}
            clearable
            searchable
            required={required}
            nothingFoundMessage="Нет доступных опций"
            limit={100}
            rightSection={loading ? <Loader size="xs" /> : null}
            size={size}
        />
    );
};

export default BrightnessSelect;