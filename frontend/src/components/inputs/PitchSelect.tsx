// src/components/inputs/PitchSelect.tsx
import { Select, Loader, SelectProps } from '@mantine/core';

// Тип для опции в выпадающем списке
type SelectOption = { label: string; value: string }; // value будет кодом шага (pitch.code)

// Пропсы компонента
interface PitchSelectProps {
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

const PitchSelect = ({
    options,
    value,
    onChange,
    disabled = false,
    required = false,
    label = "Шаг пикселя",
    placeholder = "Выберите шаг",
    loading = false,
    size,
}: PitchSelectProps) => {
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
            nothingFoundMessage="Нет доступных шагов пикселя"
            limit={100}
            rightSection={loading ? <Loader size="xs" /> : null}
            size={size}
        />
    );
};

export default PitchSelect;