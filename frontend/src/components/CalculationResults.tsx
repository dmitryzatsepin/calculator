// src/components/CalculationResults.tsx
import React, { useState } from 'react';
import { Table, Text, Title, Paper, List, ThemeIcon, Alert, Group } from '@mantine/core';
import { IconCalculator, IconAlertCircle, IconBolt, IconDimensions, IconComponents } from '@tabler/icons-react';
import type { TechnicalSpecsResult } from '../services/calculatorService';
import SendToBitrixButton from './inputs/SendToBitrixButton'; // Импорт кнопки Битрикс

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

const CalculationResults: React.FC<CalculationResultsProps> = ({ results /*, onClose */ }) => {
     // Состояние для индикатора загрузки отправки
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
        { icon: IconDimensions, label: 'Шаг пикселя', value: results.pixelPitch },
        { icon: IconDimensions, label: 'Разрешение (ШxВ)', value: results.resolution },
        { icon: IconDimensions, label: 'Всего пикселей', value: formatNumber(results.totalPixels, 0, 'пикс.') },
        { icon: IconDimensions, label: 'Фактические размеры (ШxВ), м', value: `${formatNumber(results.actualScreenWidthM)} x ${formatNumber(results.actualScreenHeightM)} м` },
        { icon: IconDimensions, label: 'Площадь экрана, м²', value: formatNumber(results.activeAreaM2, 2, 'м²') },
        { icon: IconDimensions, label: 'Яркость', value: results.brightness },
        { icon: IconDimensions, label: 'Частота обновления', value: results.refreshRate },
        { icon: IconDimensions, label: 'Защита IP', value: results.ipProtection },
        { icon: IconDimensions, label: 'Углы обзора (Г°xВ°)', value: `${results.horizontalViewingAngle}°x${results.verticalViewingAngle}°` },
        { icon: IconDimensions, label: 'Дистанция просмотра (мин/опт), м', value: `${formatNumber(results.viewingDistanceMinM, 1)} / ${formatNumber(results.viewingDistanceOptimalM, 1)} м` },

        // --- Компоненты (Только если есть кабинеты) ---
        ...(results.cabinetsCountTotal > 0 ? [
            { icon: IconComponents, label: 'Тип кабинета', value: results.material },
            { icon: IconComponents, label: 'Размер кабинета (ШxВ), мм', value: results.cabinetSize },
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

             {/* Отдельный блок для ЗИП */}
             {results.zipComponentList && results.zipComponentList.length > 0 && (
                 <>
                    <Title order={5} mb="xs" mt="lg">ЗИП Комплект (5%)</Title>
                    <List
                        spacing="xs"
                        size="sm"
                        icon={
                            <ThemeIcon color="gray" size={16} radius="xl">
                                <IconCalculator style={{ width: '70%', height: '70%' }} />
                            </ThemeIcon>
                        }
                    >
                        {results.zipComponentList.map((item, index) => (
                            <List.Item key={index}>
                                 <Text span>{item.name}</Text>
                                 {item.sku && <Text span c="dimmed" size="xs"> (Арт: {item.sku})</Text>}
                                 <Text span> - {item.totalQuantity} шт.</Text>
                            </List.Item>
                        ))}
                    </List>
                 </>
             )}

             {/* БЛОК С КНОПКОЙ ОТПРАВКИ */}
             <Group justify="flex-end" mt="xl"> {/* Используем Group для позиционирования */}
                 <SendToBitrixButton
                    onClick={handleSendToBitrix}
                    loading={isSending}
                    disabled={isSending}
                    size="sm" // Задаем размер или убираем, чтобы наследовался
                    // variant="filled" // Задайте нужный variant
                    // color="blue" // Задайте нужный цвет
                 />
             </Group>

        </Paper>
    );
};

export default CalculationResults;