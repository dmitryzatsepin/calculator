// src/components/inputs/PitchSelect.tsx
import { Select } from '@mantine/core';

// Тип для опции в выпадающем списке
type SelectOption = { label: string; value: string }; // value будет кодом шага (pitch.code)

// Пропсы компонента
interface PitchSelectProps {
    options: SelectOption[];                // Список доступных шагов пикселя
    value: string | null;                   // Текущий выбранный код шага (e.g., 'P3.91')
    onChange: (value: string | null) => void; // Функция для обновления значения в контексте
    disabled?: boolean;                     // Флаг блокировки компонента
    required?: boolean;                     // Обязательно ли поле для заполнения
    label?: string;                         // Заголовок поля
    placeholder?: string;                   // Текст-подсказка внутри поля
}

const PitchSelect = ({
    options,
    value,
    onChange,
    disabled = false,
    required = false, // Шаг пикселя, вероятно, будет обязательным
    label = "Шаг пикселя", // Дефолтный лейбл
    placeholder = "Выберите шаг" // Дефолтный плейсхолдер
}: PitchSelectProps) => {
    return (
        <Select
            label={label}
            placeholder={placeholder}
            data={options} // Опции будут типа { label: "3.91 mm", value: "P3.91" }
            value={value}
            onChange={onChange}
            disabled={disabled || options.length === 0}
            clearable
            searchable // Поиск может быть полезен
            required={required}
            nothingFoundMessage="Нет доступных шагов пикселя"
            limit={100} // Ограничение для производительности
        />
    );
};

export default PitchSelect;