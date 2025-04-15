// src/components/inputs/ControlTypeCheckboxGroup.tsx
import { Checkbox, Stack, Text } from '@mantine/core';

// Тип для одной опции типа управления
type ControlTypeOption = { label: string; value: string }; // value будет кодом типа (e.g., 'usb')

// Пропсы компонента
interface ControlTypeCheckboxGroupProps {
    options: ControlTypeOption[];              // Все доступные типы управления
    value: string[];                           // Массив кодов ВЫБРАННЫХ типов
    onChange: (value: string[]) => void;       // Функция обратного вызова
    disabled?: boolean;                        // Общая блокировка группы
    label?: string;                            // Заголовок группы
    description?: string;                      // Описание
}

const ControlTypeCheckboxGroup = ({
    options,
    value,
    onChange,
    disabled = false,
    label = "Тип управления", // Дефолтный лейбл
    description,
}: ControlTypeCheckboxGroupProps) => {

    if (options.length === 0 && !disabled) {
        return <Text size="sm" c="dimmed">Нет доступных типов управления.</Text>;
    }
     if (options.length === 0 && disabled) {
        return null;
    }

    return (
        <Checkbox.Group
            value={value}
            onChange={onChange}
            label={label}
            description={description}
        >
            <Stack mt="xs" gap="xs">
                {options.map((option) => (
                    <Checkbox
                        key={option.value}
                        value={option.value} // Значение - код типа управления
                        label={option.label} // Текст - название типа
                        disabled={disabled}  // Блокируем если вся группа заблокирована
                    />
                ))}
            </Stack>
        </Checkbox.Group>
    );
};

export default ControlTypeCheckboxGroup;