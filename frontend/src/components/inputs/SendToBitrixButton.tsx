// src/components/inputs/SendToBitrixButton.tsx
import React from 'react';
import { Button, ButtonProps } from '@mantine/core'; // Импортируем ButtonProps для размера
import { IconSend } from '@tabler/icons-react'; // Используем иконку отправки

// Расширяем стандартные ButtonProps, чтобы можно было передавать любые свойства кнопки
interface SendToBitrixButtonProps extends Omit<ButtonProps, 'onClick' | 'loading' | 'children'> {
    onClick: () => void;    // Функция при нажатии
    loading?: boolean;      // Статус загрузки
    disabled?: boolean;     // Заблокирована?
}

const SendToBitrixButton: React.FC<SendToBitrixButtonProps> = ({
    onClick,
    loading = false,
    disabled = false,
    size, // Размер будет унаследован от ButtonProps
    ...rest // Передаем остальные стандартные свойства Button (variant, color, mt, и т.д.)
}) => {
    return (
        <Button
            leftSection={<IconSend size={16} />} // Иконка отправки
            onClick={onClick}
            loading={loading}
            disabled={disabled}
            size={size} // Используем переданный размер
            variant="gradient" // Пример другого стиля, можно использовать ваш основной
            gradient={{ from: 'blue', to: 'cyan', deg: 90 }} // Пример градиента
            {...rest} // Передаем остальные свойства (например, mt="lg" или fullWidth, если нужно)
        >
            Отправить в Битрикс24
        </Button>
    );
};

export default SendToBitrixButton;