// src/components/inputs/ScreenTypeSelector.tsx
import { SegmentedControl, Text } from '@mantine/core';

type SegmentData = { label: string; value: string };

interface ScreenTypeSelectorProps {
    data: SegmentData[];
    value: string | null;
    onChange: (value: string) => void;
    disabled?: boolean;
}

const ScreenTypeSelector = ({
    data,
    value,
    onChange,
    disabled = false
}: ScreenTypeSelectorProps) => {
    if (!data || data.length === 0) {
        //return null;
        return <Text c="dimmed" size="sm">Типы экранов не доступны</Text>;
    }

    return (
        <SegmentedControl
            data={data}
            value={value ?? ''}
            onChange={onChange}
            fullWidth
            color="blue"
            disabled={disabled}
        />
    );
};

export default ScreenTypeSelector;