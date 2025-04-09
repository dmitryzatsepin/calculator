// src/components/ScreenTypeSelector.tsx
import { SegmentedControl, Text } from "@mantine/core";

type SegmentData = {
  value: string;
  label: string;
};

interface ScreenTypeSelectorProps {
  data: SegmentData[];
  value: string | null;
  onChange: (value: string) => void;
  disabled: boolean;
}

const ScreenTypeSelector = ({
  data,
  value,
  onChange,
  disabled,
}: ScreenTypeSelectorProps) => {
  if (!disabled && data.length === 0) {
    return (
      <Text c="dimmed" ta="center" mb="xl">
        Типы экранов не найдены.
      </Text>
    );
  }

  return (
    <SegmentedControl
      fullWidth
      data={data}
      value={value ?? ""}
      onChange={onChange}
      mb="xl"
      color="blue"
      radius="md"
      disabled={disabled || data.length === 0}
    />
  );
};

export default ScreenTypeSelector;