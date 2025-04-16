// src/components/inputs/CabinetSelect.tsx
import { Select, Loader } from '@mantine/core';

// Тип для опции в выпадающем списке
type SelectOption = { label: string; value: string }; // value будет кодом кабинета (cabinet.code)

// Пропсы компонента
interface CabinetSelectProps {
    options: SelectOption[];                 // Список ДОСТУПНЫХ кабинетов (отфильтрованный)
    value: string | null;                    // Текущий выбранный код кабинета
    onChange: (value: string | null) => void;  // Функция для обновления значения в контексте
    disabled?: boolean;                      // Флаг блокировки компонента
    required?: boolean;                      // Обязательно ли поле для заполнения
    loading?: boolean;                       // Флаг загрузки опций для этого селекта
    label?: string;                          // Заголовок поля
    placeholder?: string;                    // Текст-подсказка внутри поля
}

const CabinetSelect = ({
    options,
    value,
    onChange,
    disabled = false,
    required = true, // Кабинет, скорее всего, обязателен, если секция видима
    loading = false, // Индикатор загрузки
    label = "Кабинет",
    placeholder = "Выберите кабинет"
}: CabinetSelectProps) => {

    const getPlaceholder = () => {
        if (loading) return "Загрузка кабинетов...";
        if (disabled && !loading) return "Выберите параметры выше"; // Подсказка, если заблокирован НЕ из-за загрузки
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
            disabled={disabled || loading || (options.length === 0 && !loading)} // Блокируем при загрузке, disabled или если опций нет (и не идет загрузка)
            clearable
            searchable // Полезно для поиска по SKU или имени
            required={required}
            nothingFoundMessage="Нет подходящих кабинетов"
            limit={100}
            rightSection={loading ? <Loader size="xs" /> : null} // Показываем лоадер прямо в поле
        />
    );
};

export default CabinetSelect;