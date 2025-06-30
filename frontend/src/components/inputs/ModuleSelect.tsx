// src/components/inputs/ModuleSelect.tsx
import { Select, Loader, SelectProps } from '@mantine/core';

// Тип для опции в выпадающем списке
type SelectOption = { label: string; value: string };

interface ModuleSelectProps {
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

const ModuleSelect = ({
    options,
    value,
    onChange,
    disabled = false,
    required = false,
    label = "Модуль",
    placeholder = "Выберите модуль",
    loading = false,
    size,
}: ModuleSelectProps) => {
    return (
        <Select
            label={label}
            placeholder={placeholder}
            data={options}
            value={value}
            onChange={onChange}
            disabled={disabled || options.length === 0}
            clearable
            searchable
            required={required}
            nothingFoundMessage="Нет подходящих модулей"
            limit={100}
            rightSection={loading ? <Loader size="xs" /> : null}
            size={size} //
        />
    );
};

export default ModuleSelect;