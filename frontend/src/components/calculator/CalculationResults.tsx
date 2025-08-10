// src/components/CalculationResults.tsx
import React, { useState } from 'react';
import { Table, Text, Paper, ThemeIcon, Alert, Group, Notification } from '@mantine/core';
import { IconAlertCircle, IconBolt, IconDimensions, IconComponents, IconMapPin, IconRulerMeasure, IconCheck, IconX } from '@tabler/icons-react';

// --- Импорт НОВОГО КОНТЕКСТА ---
import { useCalculationResult } from '../../context/CalculationResultProvider';
import { Bitrix24Service } from '../../services/bitrix24Service';

// --- Импорты компонентов ---
import SendToBitrixButton from '../inputs/SendToBitrixButton';
import CostCalculationTable from './CostCalculationTable';

// Убираем props из определения компонента
const CalculationResults: React.FC = () => {
    // Получаем все необходимые данные из нового хука
    const { calculationResult, costDetails, bitrix24Params, isBitrix24Available } = useCalculationResult();
    const [isSending, setIsSending] = useState(false);
    const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

    // Переименовываем 'calculationResult' в 'results' для удобства,
    // чтобы не менять весь код ниже
    const results = calculationResult;

    if (!results) {
        return (
            <Alert icon={<IconAlertCircle size="1rem" />} title="Нет данных для отображения" color="gray" mt="md">
                Выполните расчет, чтобы увидеть результаты.
            </Alert>
        );
    }

    // Логика отправки в Битрикс24
    const handleSendToBitrix = async () => {
        if (!results || !bitrix24Params) {
            setSendResult({ success: false, message: 'Параметры Битрикс24 недоступны' });
            return;
        }

        setIsSending(true);
        setSendResult(null);

        try {
            const calculationData = {
                techSpecs: results,
                costs: costDetails
            };

            console.log("Отправка в Битрикс24:", { params: bitrix24Params, data: calculationData });

            const result = await Bitrix24Service.sendCalculationData(bitrix24Params, calculationData);

            console.log("Данные успешно отправлены в Битрикс24:", result);
            setSendResult({
                success: true,
                message: `Данные отправлены! Создан смарт-процесс ID: ${result.smartProcess?.id || 'N/A'}`
            });
        } catch (error) {
            console.error("Ошибка отправки в Битрикс:", error);
            setSendResult({
                success: false,
                message: `Ошибка отправки: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
            });
        } finally {
            setIsSending(false);
        }
    };


    // Улучшенная функция форматирования (остается без изменений)
    const formatNumber = (num: number | undefined | null, fractionDigits = 2, unit = '') => {
        if (num === undefined || num === null || isNaN(num)) return '-';
        const formatted = num.toLocaleString('ru-RU', {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits
        });
        return unit ? `${formatted} ${unit}` : formatted;
    };

    // Группируем данные для таблицы (остается без изменений)
    const dataRows = [
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
        ...(results.cabinetsCountTotal > 0 ? [
            { icon: IconComponents, label: 'Тип кабинета', value: results.material },
            { icon: IconComponents, label: 'Размер кабинета (ШxВ)', value: results.cabinetSize },
            { icon: IconComponents, label: 'Кабинетов (ШxВ / Всего)', value: `${results.cabinetsCountHorizontal} x ${results.cabinetsCountVertical} / ${results.cabinetsCountTotal} шт.` },
            { icon: IconComponents, label: 'Модулей в кабинете', value: formatNumber(results.modulesPerCabinet, 0, 'шт.') },
        ] : []),
        { icon: IconComponents, label: 'Модулей всего', value: formatNumber(results.modulesCountTotal, 0, 'шт.') },
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
            {/* CostCalculationTable получает данные из контекста */}
            <CostCalculationTable />

            {/* БЛОК С КНОПКОЙ ОТПРАВКИ */}
            <Group justify="flex-end" mt="xl">
                <SendToBitrixButton
                    onClick={handleSendToBitrix}
                    loading={isSending}
                    disabled={isSending}
                    isBitrix24Available={isBitrix24Available}
                    size="sm"
                />
            </Group>

            {sendResult && (
                <Notification
                    icon={sendResult.success ? <IconCheck size={18} /> : <IconX size={18} />}
                    color={sendResult.success ? 'green' : 'red'}
                    title={sendResult.success ? 'Отправка успешна!' : 'Отправка не удалась!'}
                    mt="md"
                    withCloseButton
                    onClose={() => setSendResult(null)}
                >
                    {sendResult.message}
                </Notification>
            )}

        </Paper>
    );
};

export default CalculationResults;