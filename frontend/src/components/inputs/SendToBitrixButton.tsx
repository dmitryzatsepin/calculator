// src/components/inputs/SendToBitrixButton.tsx
import React from 'react';
import { Button, ButtonProps, Tooltip } from '@mantine/core';
import { IconSend, IconAlertCircle } from '@tabler/icons-react';

interface SendToBitrixButtonProps extends Omit<ButtonProps, 'onClick' | 'loading' | 'children'> {
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
    isBitrix24Available?: boolean;
}

const SendToBitrixButton: React.FC<SendToBitrixButtonProps> = ({
    onClick,
    loading = false,
    disabled = false,
    isBitrix24Available = true,
    size,
    ...rest
}) => {
    const buttonContent = (
        <Button
            leftSection={isBitrix24Available ? <IconSend size={16} /> : <IconAlertCircle size={16} />}
            onClick={onClick}
            loading={loading}
            disabled={disabled || !isBitrix24Available}
            size={size}
            variant={isBitrix24Available ? "gradient" : "light"}
            gradient={isBitrix24Available ? { from: 'blue', to: 'cyan', deg: 90 } : undefined}
            color={isBitrix24Available ? undefined : "gray"}
            {...rest}
        >
            {isBitrix24Available ? 'Отправить в Битрикс24' : 'Битрикс24 недоступен'}
        </Button>
    );

    if (!isBitrix24Available) {
        return (
            <Tooltip label="Приложение не открыто в iframe Битрикс24 или отсутствуют необходимые параметры">
                {buttonContent}
            </Tooltip>
        );
    }

    return buttonContent;
};

export default SendToBitrixButton;