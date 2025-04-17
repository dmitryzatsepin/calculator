// src/components/inputs/DollarRateInput.tsx
import { NumberInput, Loader } from '@mantine/core';

interface DollarRateInputProps {
    value: number | string;                  // Текущее значение курса
    onChange: (value: number | string) => void; // Функция обновления в контексте
    disabled?: boolean;                      // Блокировка поля
    loading?: boolean;                       // Индикатор загрузки курса
    label?: string;
    placeholder?: string;
    required?: boolean;
}

const DollarRateInput = ({
    value,
    onChange,
    disabled = false,
    loading = false,
    label = "Курс доллара",
    placeholder = "Введите курс...",
    required = true, // Курс скорее всего обязателен
}: DollarRateInputProps) => {

    const getPlaceholder = () => {
        if (loading) return "Загрузка курса...";
        return placeholder;
    };

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
            decimalScale={2} // Позволяем до 4 знаков после запятой
            step={0.01}      // Шаг изменения кнопками
            min={0}          // Минимальное значение
            hideControls     // Скрываем стрелки +/- по умолчанию
            rightSection={loading ? <Loader size="xs" /> : null} // Индикатор загрузки
            rightSectionWidth={loading ? 30 : 0} // Резервируем место под лоадер
            // Возможно, понадобится маска или форматирование
        />
    );
};

export default DollarRateInput;