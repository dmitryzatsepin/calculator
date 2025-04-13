// src/components/inputs/MaterialSelect.tsx
import { Select } from '@mantine/core';

type SelectOption = { label: string; value: string };

interface MaterialSelectProps {
    options: SelectOption[];
    value: string | null;
    onChange: (value: string | null) => void;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    placeholder?: string;
}

const MaterialSelect = ({
    options,
    value,
    onChange,
    disabled = false,
    required = false,
    label = "Материал кабинета",
    placeholder = "Выберите материал"
}: MaterialSelectProps) => {
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
            nothingFoundMessage="Не найдено"
        />
    );
};

export default MaterialSelect;