// src/components/inputs/ModuleSelect.tsx
import { Select, Loader, SelectProps } from '@mantine/core';

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
    placeholder?: string;
    loading?: boolean;
    size?: SelectProps['size'];                   // Текст-подсказка внутри поля
}

const ModuleSelect = ({
    options,
    value,
    onChange,
    disabled = false,
    required = false,
    label = "Модуль",
    placeholder = "Выберите модуль" ,
    loading = false,
    size,
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
            limit={100}
            rightSection={loading ? <Loader size="xs" /> : null} // <-- Добавлен лоадер
            rightSectionWidth={loading ? 36 : 0} // <-- Увеличено место
            size={size} // <-- Передаем size
        />
    );
};

export default ModuleSelect;