// src/components/CalculationResults.tsx
import React, { useState } from 'react';
import { Table, Text, Paper, ThemeIcon, Alert, Group } from '@mantine/core';
import { IconAlertCircle, IconBolt, IconDimensions, IconComponents, IconMapPin, IconRulerMeasure } from '@tabler/icons-react';

// --- Импорты типов и КОНТЕКСТА ---
import type { TechnicalSpecsResult } from '../types/calculationTypes';
import { useCalculatorContext } from '../context/CalculatorContext';

// --- Импорты компонентов ---
import SendToBitrixButton from './inputs/SendToBitrixButton';
import CostCalculationTable from './CostCalculationTable';

interface CalculationResultsProps {
    results: TechnicalSpecsResult | null;
    // onClose?: () => void; // Раскомментируйте, если нужна функция закрытия
}

// Улучшенная функция форматирования
const formatNumber = (num: number | undefined | null, fractionDigits = 2, unit = '') => {
    if (num === undefined || num === null || isNaN(num)) return '-';
    const formatted = num.toLocaleString('ru-RU', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    });
    return unit ? `${formatted} ${unit}` : formatted;
};

const CalculationResults: React.FC<CalculationResultsProps> = ({ results }) => {
     const { costDetails } = useCalculatorContext();
     const [isSending, setIsSending] = useState(false);

    if (!results) {
        return (
            <Alert icon={<IconAlertCircle size="1rem" />} title="Ошибка расчета" color="red" mt="md">
                Не удалось получить результаты. Проверьте входные параметры.
            </Alert>
        );
    }

    // Логика отправки в Битрикс
    const handleSendToBitrix = async () => {
        if (!results) return;
        setIsSending(true);
        console.log("Отправка в Битрикс24:", results);
        // TODO: Реализовать логику отправки данных results в Битрикс24
        try {
            // await sendDataToBitrixAPI(results); // Пример вызова API
            await new Promise(resolve => setTimeout(resolve, 1500)); // Имитация задержки
            console.log("Данные 'отправлены'");
            // onClose?.(); // Закрыть Drawer после успешной отправки (если передан onClose)
             // Можно показать уведомление об успехе
        } catch (error) {
            console.error("Ошибка отправки в Битрикс:", error);
             // Можно показать уведомление об ошибке
        } finally {
            setIsSending(false);
        }
    };


    // Группируем данные для таблицы
    const dataRows = [
        // --- Основные параметры ---
        { icon: IconMapPin, label: 'Расположение экрана', value: results.placement },
        { icon: IconDimensions, label: 'Шаг пикселя', value: results.pixelPitch },
        { icon: IconDimensions, label: 'Разрешение экрана', value: `${results.resolution} пикс.` },
        { icon: IconDimensions, label: 'Всего пикселей', value: formatNumber(results.totalPixels, 0, 'пикс.') },
        { icon: IconDimensions, label: 'Фактические размеры (ШxВ)', value: `${formatNumber(results.actualScreenWidthM)} x ${formatNumber(results.actualScreenHeightM)} м` },
        { icon: IconDimensions, label: 'Площадь экрана', value: formatNumber(results.activeAreaM2, 2, 'м²') },
        { icon: IconDimensions, label: 'Яркость', value: results.brightness },
        { icon: IconDimensions, label: 'Частота обновления', value: results.refreshRate },
        { icon: IconDimensions, label: 'Защита IP', value: results.ipProtection },
        { icon: IconDimensions, label: 'Углы обзора (Г°xВ°)', value: `${results.horizontalViewingAngle} x ${results.verticalViewingAngle}` },
        { icon: IconRulerMeasure, label: 'Дистанция просмотра, м', value: formatNumber(results.pixelPitchValue, 2, 'м') },

        // --- Компоненты (Только если есть кабинеты) ---
        ...(results.cabinetsCountTotal > 0 ? [
            { icon: IconComponents, label: 'Тип кабинета', value: results.material },
            { icon: IconComponents, label: 'Размер кабинета (ШxВ)', value: results.cabinetSize },
            { icon: IconComponents, label: 'Кабинетов (ШxВ / Всего)', value: `${results.cabinetsCountHorizontal} x ${results.cabinetsCountVertical} / ${results.cabinetsCountTotal} шт.` },
            { icon: IconComponents, label: 'Модулей в кабинете', value: formatNumber(results.modulesPerCabinet, 0, 'шт.') },
        ] : []),
        // --- Общее кол-во модулей ---
        { icon: IconComponents, label: 'Модулей всего', value: formatNumber(results.modulesCountTotal, 0, 'шт.') },

        // --- Энергопотребление ---
        { icon: IconBolt, label: 'Среднее потребление, кВт', value: formatNumber(results.averagePowerConsumption, 2, 'кВт') },
        { icon: IconBolt, label: 'Макс. потребление, кВт', value: formatNumber(results.maxPowerConsumption, 2, 'кВт') },
    ];

    return (
        <Paper shadow="sm" p="lg" mt="md" withBorder>
            <Table highlightOnHover verticalSpacing="sm" withTableBorder withColumnBorders>
                <Table.Tbody>
                    {dataRows.map((row, index) => (
                       <Table.Tr key={index}>
                            <Table.Td width="50%">
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <ThemeIcon variant="light" size="sm" mr="xs">
                                        <row.icon style={{ width: '70%', height: '70%' }} />
                                    </ThemeIcon>
                                    <Text fw={500} size="sm">{row.label}:</Text>
                                </div>
                            </Table.Td>
                            <Table.Td width="50%">
                                <Text size="sm">{row.value}</Text>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            {/* Таблица с РАСЧЕТОМ СТОИМОСТИ */}
            {/* Используем costDetails из контекста */}
            <CostCalculationTable costDetails={costDetails} />

             {/* БЛОК С КНОПКОЙ ОТПРАВКИ */}
             <Group justify="flex-end" mt="xl">
                 <SendToBitrixButton
                    onClick={handleSendToBitrix}
                    loading={isSending}
                    disabled={isSending}
                    size="sm"
                 />
             </Group>

        </Paper>
    );
};

export default CalculationResults;