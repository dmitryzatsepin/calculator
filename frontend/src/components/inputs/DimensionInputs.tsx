// src/components/inputs/DimensionInputs.tsx
import { Grid, NumberInput } from "@mantine/core";

interface DimensionInputsProps {
  width: string | number;
  height: string | number;
  onWidthChange: (value: string | number) => void;
  onHeightChange: (value: string | number) => void;
  disabled?: boolean;
}

const DimensionInputs = ({
  width,
  height,
  onWidthChange,
  onHeightChange,
  disabled = false,
}: DimensionInputsProps) => {
  return (
    <>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <NumberInput
          label="Ширина экрана, мм"
          placeholder="Введите ширину"
          value={width}
          onChange={onWidthChange}
          min={1}
          step={50} 
          allowDecimal={false}
          allowNegative={false}
          required
          disabled={disabled}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <NumberInput
          label="Высота экрана, мм"
          placeholder="Введите высоту"
          value={height}
          onChange={onHeightChange}
          min={1}
          step={1}
          allowDecimal={false}
          allowNegative={false}
          required
          disabled={disabled}
        />
      </Grid.Col>
    </>
  );
};

export default DimensionInputs;