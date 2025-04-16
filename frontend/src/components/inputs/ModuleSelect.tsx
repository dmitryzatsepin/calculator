// src/components/inputs/ModuleSelect.tsx
import { Select } from '@mantine/core';

// Тип для опции в выпадающем списке
type SelectOption = { label: string; value: string }; // value будет кодом модуля (module.code)

// Пропсы компонента
interface ModuleSelectProps {
    options: SelectOption[];                // Список доступных модулей
    value: string | null;                   // Текущий выбранный код модуля
    onChange: (value: string | null) => void; // Функция для обновления значения в контексте
    disabled?: boolean;                     // Флаг блокировки компонента
    required?: boolean;                     // Обязательно ли поле для заполнения
    label?: string;                         // Заголовок поля
    placeholder?: string;                   // Текст-подсказка внутри поля
}

const ModuleSelect = ({
    options,
    value,
    onChange,
    disabled = false,
    required = false, // Модуль, скорее всего, будет обязательным
    label = "Модуль", // Дефолтный лейбл
    placeholder = "Выберите модуль" // Дефолтный плейсхолдер
}: ModuleSelectProps) => {
    return (
        <Select
            label={label}
            placeholder={placeholder}
            data={options} // Используем переданные опции
            value={value} // Используем переданное значение
            onChange={onChange} // Вызываем переданный обработчик
            disabled={disabled || options.length === 0} // Блокируем, если нет опций или передан disabled
            clearable // Разрешаем очистку значения
            searchable // Разрешаем поиск по опциям (очень полезно для модулей)
            required={required} // Устанавливаем обязательность
            nothingFoundMessage="Нет подходящих модулей" // Сообщение при отсутствии опций
            limit={100} // Ограничим кол-во показываемых элементов для производительности
            // Возможно, понадобится виртуализация, если модулей очень много (Mantine Select поддерживает это через `dropdownComponent`)
        />
    );
};

export default ModuleSelect;