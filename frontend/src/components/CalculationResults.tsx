// src/components/CalculationResults.tsx
import React from 'react';
import { Table, Text, Title, Paper, SimpleGrid, List, ThemeIcon, Alert } from '@mantine/core';
import { IconCalculator, IconAlertCircle } from '@tabler/icons-react';
import type { TechnicalSpecsResult } from '../services/calculatorService'; // Убедитесь, что путь верный

interface CalculationResultsProps {
    results: TechnicalSpecsResult | null; // Принимает результат или null
}

const CalculationResults: React.FC<CalculationResultsProps> = ({ results }) => {
    // Если результатов нет (например, ошибка расчета)
    if (!results) {
        return (
            <Alert icon={<IconAlertCircle size="1rem" />} title="Ошибка" color="red" mt="md">
                Не удалось выполнить расчет. Проверьте введенные данные или обратитесь к администратору.
            </Alert>
        );
    }

    // Функция для форматирования чисел
    const formatNumber = (num: number | undefined | null, fractionDigits = 2) => {
        if (num === undefined || num === null) return '-';
        return num.toLocaleString('ru-RU', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });
    };

    return (
        <Paper shadow="sm" p="lg" mt="xl" withBorder>
            <Title order={3} mb="lg">Результаты расчета</Title>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                {/* Колонка 1: Основные параметры */}
                <div>
                    <Title order={5} mb="xs">Параметры экрана</Title>
                    <Table highlightOnHover verticalSpacing="xs">
                        <Table.Tbody>
                            <Table.Tr>
                                <Table.Td><Text fw={500}>Шаг пикселя:</Text></Table.Td>
                                <Table.Td>{results.pixelPitch || '-'}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td><Text fw={500}>Разрешение (ШxВ):</Text></Table.Td>
                                <Table.Td>{results.resolution || '-'}</Table.Td>
                            </Table.Tr>
                             <Table.Tr>
                                <Table.Td><Text fw={500}>Всего пикселей:</Text></Table.Td>
                                <Table.Td>{formatNumber(results.totalPixels, 0) || '-'}</Table.Td>
                            </Table.Tr>
                             <Table.Tr>
                                <Table.Td><Text fw={500}>Фактические размеры (ШxВ):</Text></Table.Td>
                                <Table.Td>{formatNumber(results.actualScreenWidthM)} x {formatNumber(results.actualScreenHeightM)} м</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td><Text fw={500}>Площадь экрана:</Text></Table.Td>
                                <Table.Td>{formatNumber(results.activeAreaM2)} м²</Table.Td>
                            </Table.Tr>
                             <Table.Tr>
                                <Table.Td><Text fw={500}>Яркость:</Text></Table.Td>
                                <Table.Td>{results.brightness || '-'}</Table.Td>
                            </Table.Tr>
                             <Table.Tr>
                                <Table.Td><Text fw={500}>Частота обновления:</Text></Table.Td>
                                <Table.Td>{results.refreshRate || '-'}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td><Text fw={500}>Защита IP:</Text></Table.Td>
                                <Table.Td>{results.ipProtection || '-'}</Table.Td>
                            </Table.Tr>
                              <Table.Tr>
                                <Table.Td><Text fw={500}>Углы обзора (Г°xВ°):</Text></Table.Td>
                                <Table.Td>{results.horizontalViewingAngle} x {results.verticalViewingAngle}</Table.Td>
                            </Table.Tr>
                             <Table.Tr>
                                <Table.Td><Text fw={500}>Дистанция просмотра (мин/опт):</Text></Table.Td>
                                <Table.Td>{formatNumber(results.viewingDistanceMinM, 1)} / {formatNumber(results.viewingDistanceOptimalM, 1)} м</Table.Td>
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </div>

                 {/* Колонка 2: Компоненты и Энергопотребление */}
                 <div>
                    <Title order={5} mb="xs">Компоненты и Питание</Title>
                     <Table highlightOnHover verticalSpacing="xs" mb="lg">
                        <Table.Tbody>
                             <Table.Tr>
                                <Table.Td><Text fw={500}>Тип кабинета:</Text></Table.Td>
                                <Table.Td>{results.material || '-'}</Table.Td>
                            </Table.Tr>
                             <Table.Tr>
                                <Table.Td><Text fw={500}>Размер кабинета (ШxВ):</Text></Table.Td>
                                <Table.Td>{results.cabinetSize || '-'}</Table.Td>
                            </Table.Tr>
                             <Table.Tr>
                                <Table.Td><Text fw={500}>Кабинетов (ШxВ / Всего):</Text></Table.Td>
                                <Table.Td>
                                    {results.cabinetsCountTotal > 0
                                        ? `${results.cabinetsCountHorizontal} x ${results.cabinetsCountVertical} / ${results.cabinetsCountTotal} шт.`
                                        : '-'}
                                    </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td><Text fw={500}>Модулей в кабинете:</Text></Table.Td>
                                <Table.Td>{results.modulesPerCabinet > 0 ? `${results.modulesPerCabinet} шт.` : '-'}</Table.Td>
                            </Table.Tr>
                             <Table.Tr>
                                <Table.Td><Text fw={500}>Модулей всего:</Text></Table.Td>
                                <Table.Td>{formatNumber(results.modulesCountTotal, 0) || '-'} шт.</Table.Td>
                            </Table.Tr>
                             <Table.Tr>
                                <Table.Td><Text fw={500}>Среднее потребление:</Text></Table.Td>
                                <Table.Td>{formatNumber(results.averagePowerConsumption)} кВт</Table.Td>
                            </Table.Tr>
                             <Table.Tr>
                                <Table.Td><Text fw={500}>Макс. потребление:</Text></Table.Td>
                                <Table.Td>{formatNumber(results.maxPowerConsumption)} кВт</Table.Td>
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>

                    <Title order={5} mb="xs">ЗИП Комплект (5%)</Title>
                    {results.zipComponentList && results.zipComponentList.length > 0 ? (
                         <List
                            spacing="xs"
                            size="sm"
                            center
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
                    ) : (
                        <Text size="sm" c="dimmed">Компоненты для ЗИП не найдены.</Text>
                    )}
                </div>
            </SimpleGrid>
        </Paper>
    );
};

export default CalculationResults;