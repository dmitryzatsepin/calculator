// frontend/src/components/inputs/ProVersionSwitch.tsx
import { Switch, Group, Text } from '@mantine/core';

interface ProVersionSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

const ProVersionSwitch = ({ checked, onChange, disabled }: ProVersionSwitchProps) => {
    return (
        <Group justify="flex-start" h="100%">
            <Switch
                checked={checked}
                onChange={(event) => onChange(event.currentTarget.checked)}
                disabled={disabled}
                labelPosition="left"
                label={
                    <Text fw={500} size="sm">
                        PRO
                    </Text>
                }
                size="md"
            />
        </Group>
    );
};

export default ProVersionSwitch;