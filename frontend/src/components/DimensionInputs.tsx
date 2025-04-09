// src/components/DimensionInputs.tsx
import { Grid, TextInput } from "@mantine/core";

interface DimensionInputsProps {
  width: string;
  height: string;
  onWidthChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  disabled: boolean;
}

const DimensionInputs = ({
  width,
  height,
  onWidthChange,
  onHeightChange,
  disabled,
}: DimensionInputsProps) => {
  return (
    <>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <TextInput
          label="Ширина экрана (мм)"
          value={width}
          onChange={(e) => onWidthChange(e.currentTarget.value)}
          required
          placeholder="Введите ширину"
          disabled={disabled}
          type="number"
          min={1}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <TextInput
          label="Высота экрана (мм)"
          value={height}
          onChange={(e) => onHeightChange(e.currentTarget.value)}
          required
          placeholder="Введите высоту"
          disabled={disabled}
          type="number"
          min={1}
        />
      </Grid.Col>
    </>
  );
};

export default DimensionInputs;