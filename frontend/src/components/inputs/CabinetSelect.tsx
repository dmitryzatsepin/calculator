// src/components/inputs/CabinetSelect.tsx
import { Select, Loader } from '@mantine/core';

// Тип для опции в выпадающем списке
type SelectOption = { label: string; value: string };

// Пропсы компонента
interface CabinetSelectProps {
    options: SelectOption[];
    value: string | null;
    onChange: (value: string | null) => void;
    disabled?: boolean;
    required?: boolean;
    loading?: boolean;
    label?: string;
    placeholder?: string;
}

const CabinetSelect = ({
    options,
    value,
    onChange,
    disabled = false,
    required = true,
    loading = false,
    label = "Кабинет",
    placeholder = "Выберите кабинет"
}: CabinetSelectProps) => {

    const getPlaceholder = () => {
        if (loading) return "Загрузка кабинетов...";
        if (disabled && !loading) return "Выберите параметры выше";
        if (!options.length && !loading && !disabled) return "Нет подходящих кабинетов";
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
            nothingFoundMessage="Нет подходящих кабинетов"
            limit={100}
            rightSection={loading ? <Loader size="xs" /> : null}
        />
    );
};

export default CabinetSelect;