// src/components/inputs/FlexOptionSwitch.tsx
import { Switch, Group, Text } from '@mantine/core';

interface FlexOptionSwitchProps {
    checked: boolean;                         // Текущее состояние (вкл/выкл)
    onChange: (checked: boolean) => void;     // Функция обратного вызова при изменении
    disabled?: boolean;                       // Заблокирован ли свитч
    label?: string;                           // Основной текст
    description?: string;                    // Описание под текстом
}

const FlexOptionSwitch = ({
    checked,
    onChange,
    disabled = false,
    label = "Гибкий экран",
    description = "Выбрать, если экран имеет гибкую структуру"
}: FlexOptionSwitchProps) => {
    return (
        // Используем Group для красивого расположения с текстом слева
        <Group justify="space-between" wrap="nowrap" gap="xl">
            {/* Текстовая часть */}
            <div style={{ flexGrow: 1 }}>
                 <Text size="sm">{label}</Text>
                 {description && <Text size="xs" c="dimmed">{description}</Text>}
            </div>
            {/* Сам переключатель */}
            <Switch
                checked={checked}
                onChange={(event) => onChange(event.currentTarget.checked)}
                disabled={disabled}
                aria-label={label} // Для доступности
            />
        </Group>
    );
};

export default FlexOptionSwitch;