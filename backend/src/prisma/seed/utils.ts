import * as XLSX from "xlsx";
import { Decimal } from "@prisma/client/runtime/library";

// --- Функция чтения листа (с фильтрацией пустых строк) ---
export function getDataFromSheet(
  workbook: XLSX.WorkBook,
  sheetName: string
): any[] {
  if (!workbook.SheetNames.includes(sheetName)) {
    console.warn(`⚠️ Лист ${sheetName} не найден в Excel-файле. Пропуск.`);
    return [];
  }
  const sheet = workbook.Sheets[sheetName];
  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
  });
  if (rows.length < 3) {
    console.warn(
      `⚠️ Лист ${sheetName} пуст или содержит только заголовки (или меньше 3 строк). Пропуск.`
    );
    return [];
  }
  const header = rows[0];
  const dataRows = rows.slice(2);
  const jsonData = dataRows
    .filter((row) =>
      row.some((cell) => cell !== null && String(cell).trim() !== "")
    )
    .map((row) => {
      const rowData: { [key: string]: any } = {};
      header.forEach((key: any, index: number) => {
        if (key != null) {
          rowData[String(key)] = row[index];
        }
      });
      return rowData;
    });
  console.log(
    `  - Прочитано строк из ${sheetName} (после фильтрации и пропуска заголовка): ${jsonData.length}`
  );
  return jsonData;
}

// --- Вспомогательные функции ---
export function safeDecimal(value: any, context: string): Decimal | null {
  if (value == null || String(value).trim() === "") {
    return null;
  }
  const normalizedValue =
    typeof value === "string" ? value.replace(",", ".") : value;
  if (
    typeof normalizedValue === "number" ||
    (typeof normalizedValue === "string" &&
      !isNaN(parseFloat(normalizedValue)) &&
      isFinite(Number(normalizedValue)))
  ) {
    try {
      return new Decimal(normalizedValue);
    } catch (e) {
      console.error(
        `❌ ${context}: Ошибка конвертации '${value}' в Decimal`,
        e
      );
      return null;
    }
  } else {
    console.warn(
      `⚠️ ${context}: Некорректное значение для Decimal: '${value}'.`
    );
    return null;
  }
}

export function safeInt(
  value: any,
  context: string,
  allowZero: boolean = true,
  allowNull: boolean = true
): number | null {
  if (value == null || String(value).trim() === "") {
    return allowNull ? null : allowZero ? 0 : null;
  }
  const trimmedValue = typeof value === "string" ? String(value).trim() : value;
  const num = Number(trimmedValue);
  if (!isNaN(num) && Number.isInteger(num)) {
    if (!allowZero && num === 0) {
      console.warn(
        `⚠️ ${context}: Нулевое значение не разрешено для '${value}'.`
      );
      return null;
    }
    return num;
  } else {
    console.warn(`⚠️ ${context}: Некорректное целое: '${value}'.`);
    return allowNull ? null : allowZero ? 0 : null;
  }
}

export function safeBoolean(
  value: any,
  context: string,
  defaultValue: boolean = true
): boolean {
  if (value === null || value === undefined || String(value).trim() === "") {
    return defaultValue;
  }
  const lowerVal = String(value).toLowerCase().trim();
  if (
    lowerVal === "true" ||
    lowerVal === "yes" ||
    lowerVal === "да" ||
    lowerVal === "1"
  ) {
    return true;
  }
  if (
    lowerVal === "false" ||
    lowerVal === "no" ||
    lowerVal === "нет" ||
    lowerVal === "0"
  ) {
    return false;
  }
  console.warn(
    `⚠️ ${context}: Некорректное булево значение: '${value}'. Будет использовано ${defaultValue}.`
  );
  return defaultValue;
}
