// src/components/inputs/LocationSelect.tsx
import { Select } from '@mantine/core';

type SelectOption = { label: string; value: string };

interface LocationSelectProps {
    options: SelectOption[];
    value: string | null;
    onChange: (value: string | null) => void;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    placeholder?: string;
}

const LocationSelect = ({
    options,
    value,
    onChange,
    disabled = false,
    required = false,
    label = "Расположение",
    placeholder = "Выберите расположение"
}: LocationSelectProps) => {
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

export default LocationSelect;