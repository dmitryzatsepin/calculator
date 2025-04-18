// src/components/inputs/FlexOptionSwitch.tsx
import { Switch, Group, Text } from '@mantine/core';

interface FlexOptionSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    description?: string;
}

const FlexOptionSwitch = ({
    checked,
    onChange,
    disabled = false,
    label = "Гибкий экран",
    description = "Выбрать, если экран имеет гибкую структуру"
}: FlexOptionSwitchProps) => {
    return (
        <Group wrap="nowrap" gap="sm" align="center">
            <Switch
                checked={checked}
                onChange={(event) => onChange(event.currentTarget.checked)}
                disabled={disabled}
                aria-label={label}
            />
            <div>
                 <Text size="sm">{label}</Text>
                 {description && <Text size="xs" c="dimmed">{description}</Text>}
            </div>
        </Group>
    );
};

export default FlexOptionSwitch;