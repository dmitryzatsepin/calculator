import React, { useMemo } from "react";
import type { CostLineItem } from "../../types/calculationTypes";
import { Table, Title, Paper, NumberInput } from "@mantine/core";
import { useCalculationResult } from '../../context/CalculationResultProvider';

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const renderTotalRow = (label: string, total: number) => (
  <Table.Tfoot>
    <Table.Tr>
      <Table.Td colSpan={3} style={{ textAlign: "right", fontWeight: "bold" }}>{label}</Table.Td>
      <Table.Td style={{ textAlign: "right", fontWeight: "bold" }}>{formatCurrency(total)}</Table.Td>
    </Table.Tr>
  </Table.Tfoot>
);

const renderAdditionalTotalRow = (label: string, total: number) => (
  <Table.Tfoot>
    <Table.Tr>
      <Table.Td style={{ textAlign: "right", fontWeight: "bold" }}>{label}</Table.Td>
      <Table.Td style={{ textAlign: "right", fontWeight: "bold" }}>{formatCurrency(total)}</Table.Td>
    </Table.Tr>
  </Table.Tfoot>
);

const renderMainItemsTable = (items: CostLineItem[], title: string, total: number) => {
  if (!items || items.length === 0) return null;

  return (
    <>
      <Title order={5} mt="xl" mb="xs">{title}</Title>
      <Table highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Наименование</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>Кол-во</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>Цена за ед.</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>Стоимость</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item, index) => (
            <Table.Tr key={`${title}-${index}`}>
              <Table.Td>{item.label}</Table.Td>
              <Table.Td style={{ textAlign: "right" }}>{item.quantity}</Table.Td>
              <Table.Td style={{ textAlign: "right" }}>{formatCurrency(item.unitPriceRub)}</Table.Td>
              <Table.Td style={{ textAlign: "right" }}>{formatCurrency(item.totalPriceRub)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
        {renderTotalRow("Итого:", total)}
      </Table>
    </>
  );
};

const renderZipTable = (items: CostLineItem[], onItemsChange: (items: CostLineItem[]) => void, total: number) => {
  if (!items || items.length === 0) return null;

  return (
    <>
      <Title order={5} mt="xl" mb="xs">Комплект ЗИП</Title>
      <Table highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Наименование</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>Кол-во</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>Цена за ед.</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>Стоимость</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item, index) => (
            <Table.Tr key={`zip-${index}`}>
              <Table.Td>{item.label}</Table.Td>
              <Table.Td style={{ textAlign: "right", width: 120 }}>
                <NumberInput
                  value={item.quantity}
                  onChange={(newQuantity) => {
                    const updatedItems = items.map(currentItem =>
                      currentItem.label === item.label ? { ...currentItem, quantity: Number(newQuantity) || 0 } : currentItem
                    );
                    onItemsChange(updatedItems);
                  }}
                  min={0} step={1} hideControls styles={{ input: { textAlign: 'right' } }}
                />
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>{formatCurrency(item.unitPriceRub)}</Table.Td>
              <Table.Td style={{ textAlign: "right" }}>{formatCurrency(item.totalPriceRub)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
        {renderTotalRow("Итого ЗИП:", total)}
      </Table>
    </>
  );
};

const renderAdditionalTable = (items: CostLineItem[], onItemsChange: (items: CostLineItem[]) => void, total: number) => {
  if (!items || items.length === 0) return null;

  return (
    <>
      <Title order={5} mt="xl" mb="xs">Дополнительные услуги и работы</Title>
      <Table highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Наименование</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>Стоимость</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item, index) => (
            <Table.Tr key={`additional-${index}`}>
              <Table.Td>{item.label}</Table.Td>
              <Table.Td style={{ textAlign: "right", width: 180 }}>
                <NumberInput
                  value={item.totalPriceRub}
                  onChange={(newTotal) => {
                    const newTotalNum = Number(newTotal) || 0;
                    const updatedItems = items.map(currentItem =>
                      currentItem.label === item.label
                        ? { ...currentItem, totalPriceRub: newTotalNum, unitPriceRub: newTotalNum }
                        : currentItem
                    );
                    onItemsChange(updatedItems);
                  }}
                  min={0} step={1000} hideControls styles={{ input: { textAlign: 'right' } }}
                  thousandSeparator=" "
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
        {renderAdditionalTotalRow("Итого доп. услуги:", total)}
      </Table>
    </>
  );
};

export const CostCalculationTable: React.FC = () => {
  const {
    costDetails,
    editableZipItems,
    setEditableZipItems,
    editableAdditionalItems,
    setEditableAdditionalItems
  } = useCalculationResult();

  if (!costDetails) return null;

  const dynamicTotals = useMemo(() => {
    const mainTotal = costDetails.costItems.reduce((sum: number, item) => sum + item.totalPriceRub, 0);

    const updatedZipItems = editableZipItems.map(item => ({
      ...item,
      totalPriceRub: item.quantity * (item.unitPriceRub ?? 0),
    }));
    const zipTotal = updatedZipItems.reduce((sum: number, item) => sum + item.totalPriceRub, 0);

    const additionalTotal = editableAdditionalItems.reduce((sum: number, item) => sum + item.totalPriceRub, 0);

    return {
      mainTotal,
      zipTotal,
      additionalTotal,
      grandTotal: mainTotal + zipTotal + additionalTotal,
      updatedZipItems,
    };
  }, [costDetails, editableZipItems, editableAdditionalItems]);

  return (
    <Paper shadow="sm" p="lg" mt="md" withBorder>
      <Title order={5} mb="md">Расчет стоимости</Title>

      {renderMainItemsTable(costDetails.costItems, "Основная комплектация", dynamicTotals.mainTotal)}

      {renderZipTable(dynamicTotals.updatedZipItems, setEditableZipItems, dynamicTotals.zipTotal)}

      {renderAdditionalTable(editableAdditionalItems, setEditableAdditionalItems, dynamicTotals.additionalTotal)}

      <div style={{ marginTop: "40px", borderTop: "1px solid #e0e0e0", paddingTop: "15px", textAlign: "right", fontWeight: "bold", fontSize: "1.2em" }}>
        Итоговая стоимость: {formatCurrency(dynamicTotals.grandTotal)}
      </div>

      {costDetails.conversionRate && (
        <div style={{ marginTop: "5px", textAlign: "right", fontSize: "0.9em", color: "#666" }}>
          (Курс конвертации USD-RUB: {costDetails.conversionRate.toFixed(2)})
        </div>
      )}
    </Paper>
  );
};

export default CostCalculationTable;