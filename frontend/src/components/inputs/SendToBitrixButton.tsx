// src/components/inputs/SendToBitrixButton.tsx
import React from 'react';
import { Button, ButtonProps } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';

interface SendToBitrixButtonProps extends Omit<ButtonProps, 'onClick' | 'loading' | 'children'> {
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
}

const SendToBitrixButton: React.FC<SendToBitrixButtonProps> = ({
    onClick,
    loading = false,
    disabled = false,
    size,
    ...rest
}) => {
    return (
        <Button
            leftSection={<IconSend size={16} />}
            onClick={onClick}
            loading={loading}
            disabled={disabled}
            size={size}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
            {...rest}
        >
            Отправить в Битрикс24
        </Button>
    );
};

export default SendToBitrixButton;