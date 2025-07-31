// src/components/inputs/AdditionalServicesInputs.tsx
import { Grid, Select, NumberInput, Title } from '@mantine/core';

interface AdditionalServicesInputsProps {
    processorOptions: { value: string; label: string }[];
    selectedProcessorCode: string | null;
    onProcessorChange: (value: string | null) => void;
    montazhCost: number | string;
    onMontazhChange: (value: number | string) => void;
    konstrukciyaCost: number | string;
    onKonstrukciyaChange: (value: number | string) => void;
    dostavkaCost: number | string;
    onDostavkaChange: (value: number | string) => void;
    loadingProcessors: boolean;
    disabled: boolean;
}

export const AdditionalServicesInputs: React.FC<AdditionalServicesInputsProps> = ({
    processorOptions,
    selectedProcessorCode,
    onProcessorChange,
    montazhCost,
    onMontazhChange,
    konstrukciyaCost,
    onKonstrukciyaChange,
    dostavkaCost,
    onDostavkaChange,
    loadingProcessors,
    disabled,
}) => {
    return (
        <>
            <Grid.Col span={12} mt="lg">
                <Title order={5}>Дополнительные услуги и работы</Title>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                    label="Видеопроцессор"
                    placeholder={loadingProcessors ? "Загрузка..." : "Подбирается автоматически"}
                    data={processorOptions}
                    value={selectedProcessorCode}
                    onChange={onProcessorChange}
                    disabled={disabled || loadingProcessors}
                    searchable
                    clearable
                />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }} /> {/* Пустая колонка для выравнивания */}

            <Grid.Col span={{ base: 12, md: 4 }}>
                <NumberInput
                    label="Монтаж, руб."
                    value={montazhCost}
                    onChange={onMontazhChange}
                    min={0}
                    step={1000}
                    allowDecimal={false}
                    thousandSeparator=" "
                    disabled={disabled}
                />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
                <NumberInput
                    label="Металлоконструкция, руб."
                    value={konstrukciyaCost}
                    onChange={onKonstrukciyaChange}
                    min={0}
                    step={1000}
                    allowDecimal={false}
                    thousandSeparator=" "
                    disabled={disabled}
                />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
                <NumberInput
                    label="Доставка, руб."
                    value={dostavkaCost}
                    onChange={onDostavkaChange}
                    min={0}
                    step={500}
                    allowDecimal={false}
                    thousandSeparator=" "
                    disabled={disabled}
                />
            </Grid.Col>
        </>
    );
};