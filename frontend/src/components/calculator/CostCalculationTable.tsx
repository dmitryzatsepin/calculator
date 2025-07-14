// src/components/CostCalculationTable.tsx
import React, { useMemo } from "react";
import type {
  CostCalculationResult,
  CostLineItem,
} from "../../types/calculationTypes";
import { Table, Text, Title, Paper } from "@mantine/core";

// Интерфейс пропсов компонента
interface CostCalculationTableProps {
  costDetails: CostCalculationResult | null;
}

// Функция для форматирования чисел как валюты
const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "-";
  }
  return value.toLocaleString("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Функция расчета подытогов по категориям
const calculateSubtotals = (items: CostLineItem[]): Record<string, number> => {
  const subtotals: Record<string, number> = {};
  items.forEach((item) => {
    // Используем часть строки до ':' как ключ категории
    const category = item.label.split(":")[0].trim();
    subtotals[category] = (subtotals[category] || 0) + item.totalPriceRub;
  });
  return subtotals;
};

// Основной компонент таблицы расчета стоимости
export const CostCalculationTable: React.FC<CostCalculationTableProps> = ({
  costDetails,
}) => {
  // Если нет данных, ничего не рендерим
  if (!costDetails) {
    return null;
  }

  // Вычисляем подытоги с помощью useMemo для оптимизации
  const mainSubtotals = useMemo(
    () => calculateSubtotals(costDetails.costItems),
    [costDetails.costItems]
  );
  const zipSubtotals = useMemo(
    () => calculateSubtotals(costDetails.zipItems),
    [costDetails.zipItems]
  );

  // Вспомогательная функция для рендеринга основной таблицы строк затрат
  const renderCostItems = (items: CostLineItem[], title: string) => (
    <>
      {/* Заголовок секции */}
      <Title order={5} mt="md" mb="xs">
        {title}
      </Title>
      {/* Таблица Mantine */}
      <Table highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Наименование</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>Кол-во</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>Цена за ед.</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>Стоимость</Table.Th>
            {/* <Table.Th>Детали</Table.Th> */}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {/* Рендерим строки для каждого элемента */}
          {items.map((item, index) => (
            <Table.Tr key={`${title}-${index}`}>
              <Table.Td>{item.label}</Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                {item.quantity}
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                {formatCurrency(item.unitPriceRub)}
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                {formatCurrency(item.totalPriceRub)}
              </Table.Td>
              {/* <Table.Td>{item.details ?? '-'}</Table.Td> */}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </>
  );

  // Вспомогательная функция для рендеринга блока с подытогами
  const renderSubtotals = (
    subtotals: Record<string, number>,
    title: string // Принимаем заголовок для группы подытогов
  ) => {
    const entries = Object.entries(subtotals);
    // Если нет подытогов, ничего не рендерим
    if (entries.length === 0) return null;

    return (
      // Блок для группы подытогов
      <div style={{ marginTop: "15px" }}>
        <Text fw={500} size="sm" mb="xs">
          {title}:
        </Text>
        <Table withTableBorder={false} withColumnBorders={false}>
          <Table.Tbody>
            {entries.map(([category, total]) => (
              <Table.Tr key={category}>
                <Table.Td>{category}</Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  {formatCurrency(total)}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
    );
  };

  // Основная разметка компонента
  return (
    <Paper shadow="sm" p="lg" mt="md" withBorder>
      {/* Заголовок всего блока расчета */}
      <Title order={5} mb="md">
        Расчет стоимости
      </Title>

      {/* Рендерим таблицу для основной комплектации, если есть данные */}
      {costDetails.costItems.length > 0 &&
        renderCostItems(costDetails.costItems, "Основная комплектация")}

      {/* Рендерим таблицу для ЗИП, если есть данные */}
      {costDetails.zipItems.length > 0 &&
        renderCostItems(costDetails.zipItems, "Комплект ЗИП")}

      {/* --- Блок с подытогами --- */}
      {/* Выводим заголовок для секции подытогов, если есть хотя бы один подытог */}
      {(Object.keys(mainSubtotals).length > 0 ||
        Object.keys(zipSubtotals).length > 0) && (
          <Title order={5} mb="xs" mt="lg">
            Итоги по категориям
          </Title>
        )}
      {/* Рендерим подытоги для основной комплектации */}
      {renderSubtotals(mainSubtotals, "Основная комплектация")}
      {/* Рендерим подытоги для ЗИП */}
      {renderSubtotals(zipSubtotals, "Комплект ЗИП")}
      {/* -------------------------- */}

      {/* --- Общий итог и курс конвертации --- */}
      <div
        style={{
          marginTop: "20px",
          borderTop: "1px solid #e0e0e0", // Линия-разделитель
          paddingTop: "15px",
          textAlign: "right",
          fontWeight: "bold",
          fontSize: "1.1em",
        }}
      >
        Итоговая стоимость: {formatCurrency(costDetails.totalCostRub)}
      </div>
      {/* Отображаем курс, если он есть */}
      {costDetails.conversionRate && (
        <div
          style={{
            marginTop: "5px",
            textAlign: "right",
            fontSize: "0.9em",
            color: "#666",
          }}
        >
          (Курс конвертации USD-RUB: {costDetails.conversionRate.toFixed(2)})
        </div>
      )}
      {/* -------------------------- */}
    </Paper>
  );
};

export default CostCalculationTable;
