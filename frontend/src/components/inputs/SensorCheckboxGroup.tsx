// src/components/inputs/SensorCheckboxGroup.tsx
import { Checkbox, Stack, Text } from '@mantine/core';

type SensorOption = { label: string; value: string };

// Пропсы компонента
interface SensorCheckboxGroupProps {
    options: SensorOption[];
    value: string[];
    onChange: (value: string[]) => void;
    disabled?: boolean;
    label?: string;
    description?: string;
}

const SensorCheckboxGroup = ({
    options,
    value,
    onChange,
    disabled = false,
    label = "Сенсоры",
    description,
}: SensorCheckboxGroupProps) => {

    if (options.length === 0 && !disabled) {
        return <Text size="sm" c="dimmed">Нет доступных сенсоров.</Text>;
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
                        value={option.value}
                        label={option.label}
                        disabled={disabled}
                    />
                ))}
            </Stack>
        </Checkbox.Group>
    );
};

export default SensorCheckboxGroup;