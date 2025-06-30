// src/components/inputs/DollarRateInput.tsx
import { NumberInput, Loader, NumberInputProps, rem } from '@mantine/core';
import { IconCurrencyDollar } from '@tabler/icons-react';

interface DollarRateInputProps {
    value: number | string;
    onChange: (value: number | string) => void;
    disabled?: boolean;
    loading?: boolean;
    label?: string;
    placeholder?: string;
    required?: boolean;
    size?: NumberInputProps['size'];
    style?: React.CSSProperties;
}

const DollarRateInput = ({
    value,
    onChange,
    disabled = false,
    loading = false,
    label = "Курс",
    placeholder = "Введите курс...",
    required = true,
    size,
    style,
}: DollarRateInputProps) => {

    const getPlaceholder = () => {
        if (loading) return "Загрузка ...";
        return placeholder;
    };

    const icon = <IconCurrencyDollar style={{ width: rem(18), height: rem(18) }} stroke={1.5} />;

    return (
        <NumberInput
            label={label}
            placeholder={getPlaceholder()}
            value={value}
            onChange={onChange}
            disabled={disabled || loading}
            required={required}
            // Настройки для валюты
            allowDecimal
            decimalScale={2}
            step={0.01}
            min={0}
            leftSection={icon}
            leftSectionWidth={36}
            rightSection={loading ? <Loader size="xs" /> : null}
            rightSectionWidth={loading ? 36 : 0}
            size={size}
            style={style}
        />
    );
};

export default DollarRateInput;