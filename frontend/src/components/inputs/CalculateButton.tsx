// src/components/inputs/CalculateButton.tsx
import { Button, NumberInputProps } from '@mantine/core';
import { IconCalculator } from '@tabler/icons-react';

interface CalculateButtonProps {
    onClick: () => void;    // Функция, вызываемая при нажатии
    loading?: boolean;      // Показать индикатор загрузки?
    disabled?: boolean;     // Заблокировать кнопку?
    label?: string;
    size?: NumberInputProps['size'];
}

const CalculateButton = ({
    onClick,
    loading = false,
    disabled = false,
    label = "Рассчитать стоимость",
    size, 
}: CalculateButtonProps) => {
    return (
        <Button
            leftSection={<IconCalculator size={16} />}
            onClick={onClick}
            loading={loading}
            disabled={disabled}
            fullWidth // Растянем на всю ширину для заметности
            mt="lg" // Добавим отступ сверху
            size={size}
        >
            {label}
        </Button>
    );
};

export default CalculateButton;