// src/components/inputs/IpProtectionSelect.tsx
import { Select } from '@mantine/core';

type SegmentData = { label: string; value: string };

interface IpProtectionSelectProps {
    options: SegmentData[];
    value: string | null;
    onChange: (value: string | null) => void;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    placeholder?: string;
}

const IpProtectionSelect = ({
    options,
    value,
    onChange,
    disabled = false,
    required = false,
    label = "Степень защиты (IP)",
    placeholder = "Выберите степень защиты"
}: IpProtectionSelectProps) => {
    return (
        <Select
            label={label}
            placeholder={placeholder}
            data={options}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            searchable
            clearable
            nothingFoundMessage="Ничего не найдено"
        />
    );
};

export default IpProtectionSelect;