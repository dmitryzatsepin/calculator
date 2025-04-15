// src/components/inputs/RefreshRateSelect.tsx
import { Select } from '@mantine/core';

// Опция для Mantine Select
type SelectOption = { label: string; value: string };

// Пропсы компонента
interface RefreshRateSelectProps {
    options: SelectOption[];                // Список доступных частот обновления
    value: string | null;                   // Текущий выбранный код частоты (например, 'HZ1920')
    onChange: (value: string | null) => void; // Функция для обновления значения в контексте
    disabled?: boolean;                     // Флаг блокировки компонента
    required?: boolean;                     // Обязательно ли поле для заполнения
    label?: string;                         // Заголовок поля
    placeholder?: string;                   // Текст-подсказка внутри поля
}

const RefreshRateSelect = ({
    options,
    value,
    onChange,
    disabled = false,
    required = false,
    label = "Частота обновления", // Дефолтный лейбл
    placeholder = "Выберите частоту" // Дефолтный плейсхолдер
}: RefreshRateSelectProps) => {
    return (
        <Select
            label={label}
            placeholder={placeholder}
            data={options} // Используем переданные опции
            value={value} // Используем переданное значение
            onChange={onChange} // Вызываем переданный обработчик
            disabled={disabled || options.length === 0} // Блокируем, если нет опций или передан disabled
            clearable // Разрешаем очистку значения
            searchable // Разрешаем поиск по опциям
            required={required} // Устанавливаем обязательность
            nothingFoundMessage="Нет доступных опций" // Сообщение при отсутствии опций
        />
    );
};

export default RefreshRateSelect;