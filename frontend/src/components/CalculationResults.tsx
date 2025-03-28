import { Drawer, Table, Button, Center, Text, Stack } from "@mantine/core";
import styles from "../styles/CalculationResults.module.scss";

// --- Типы ---
// Тип для информации о кабинете, ожидаемый от DisplayParameters
type CabinetInfo = {
  id: number;
  name: string;
  width: number;
  height: number;
  pixelStep: string[];
  material: string[];
  modulesQ: number;
  powerUnitQ: number;
  receiver: number;
};

// Тип пропсов для компонента CalculationResults
interface CalculationResultsProps {
  opened: boolean;
  onClose: () => void;
  data: {
    width: string;
    height: string;
    screenType: string | null;
    selectedProtection: string | null;
    selectedMaterial: string | null;
    selectedPixelStep: string | null;
    selectedCabinet: CabinetInfo | null;
    selectedOptions: string[];
    exchangeRate: number;
    selectedBrightness: number | string;
    selectedRefreshFreq: number | string;
  };
}

// --- Константы ---
const SPARE_PARTS_PERCENTAGE = 0.05; // 5% ЗИП
const DEFAULT_VIEW_ANGLE = 140; // Стандартный угол обзора

// --- Вспомогательные функции ---
// Извлекает числовое значение шага пикселя из имени (например, из "P3.91" вернет 3.91)
const getNumericPixelStep = (pixelStepName: string | null): number | null => {
  if (!pixelStepName) return null;
  const match = pixelStepName.match(/(\d+(\.\d+)?)/);
  if (match && match[0]) {
    const num = parseFloat(match[0]);
    return isNaN(num) ? null : num;
  }
  return null;
};

// Определяет тип диодов (упрощенно) - убрана из деструктуризации, т.к. не используется
/*
const getDiodeType = (pixelStepName: string | null): string => {
  if (!pixelStepName) return "-";
  return pixelStepName.toLowerCase().includes("eco") ? "SMD" : "SMD";
};
*/

// --- Компонент ---
const CalculationResults = ({ opened, onClose, data }: CalculationResultsProps) => {
  // Деструктуризация основных данных
  const {
    width: inputWidth, height: inputHeight, screenType, selectedProtection, selectedMaterial,
    selectedPixelStep, selectedCabinet,
    selectedBrightness, selectedRefreshFreq
  } = data;

  // --- Ранний выход, если кабинет не выбран ---
  if (!selectedCabinet) {
    return (
      <Drawer opened={opened} onClose={onClose} title="Результаты расчёта" position="right" size="xl">
        <Center style={{ height: '100%' }}>
          <Text>Пожалуйста, выберите все параметры, включая кабинет.</Text>
        </Center>
      </Drawer>
    );
  }

  // --- Деструктуризация данных выбранного кабинета ---
  const {
    name: cabinetName, width: cabinetWidth, height: cabinetHeight,
    modulesQ: modulesPerCabinet, powerUnitQ: powerUnitsPerCabinet, receiver: receiversPerCabinet
  } = selectedCabinet;

  // Используем переданные яркость и частоту
  const brightness = selectedBrightness;
  const refreshFreq = selectedRefreshFreq;

  // --- Основные расчеты ---
  const screenWidth = parseInt(inputWidth, 10) || 0;
  const screenHeight = parseInt(inputHeight, 10) || 0;

  // Расчет кол-ва кабинетов
  const widthCabHor = Math.floor(screenWidth / cabinetWidth);
  const heightCabHor = Math.floor(screenHeight / cabinetHeight);
  const totalHor = widthCabHor * heightCabHor;
  const widthCabVert = Math.floor(screenWidth / cabinetHeight);
  const heightCabVert = Math.floor(screenHeight / cabinetWidth);
  const totalVert = widthCabVert * heightCabVert;

  // Выбор оптимального размещения
  const isHorizontal = totalHor >= totalVert;
  const widthCabCount = isHorizontal ? widthCabHor : widthCabVert;
  const heightCabCount = isHorizontal ? heightCabHor : heightCabVert;
  const totalCabinets = widthCabCount * heightCabCount;

  // Финальные размеры
  const finalWidth = widthCabCount * (isHorizontal ? cabinetWidth : cabinetHeight);
  const finalHeight = heightCabCount * (isHorizontal ? cabinetHeight : cabinetWidth);
  const activeArea = (finalWidth * finalHeight) / 1_000_000;

  // --- Расчет разрешения и общего кол-ва пикселей ---
  const numericPixelStep = getNumericPixelStep(selectedPixelStep);
  let resolution = "-";
  let totalPixels: number | string = "-";
  if (numericPixelStep && numericPixelStep > 0) {
    const heightPixels = Math.round(finalHeight / numericPixelStep);
    const widthPixels = Math.round(finalWidth / numericPixelStep);
    resolution = `${heightPixels}×${widthPixels} пикс.`;
    totalPixels = heightPixels * widthPixels;
  } else {
    console.warn("Не удалось рассчитать разрешение: шаг пикселя некорректен.", selectedPixelStep);
  }

  // Дистанция обзора
  const viewingDistance = numericPixelStep ? numericPixelStep.toFixed(1) : "-";

  // Компоненты
  const totalModules = totalCabinets * modulesPerCabinet;
  const totalPowerUnits = totalCabinets * powerUnitsPerCabinet;
  const totalReceivers = totalCabinets * receiversPerCabinet;

  // ЗИП
  const spareModules = Math.ceil(totalModules * SPARE_PARTS_PERCENTAGE);
  const sparePowerUnits = Math.ceil(totalPowerUnits * SPARE_PARTS_PERCENTAGE);
  const spareReceivers = Math.ceil(totalReceivers * SPARE_PARTS_PERCENTAGE);
  const zipKit = `модули-${spareModules}шт; БП-${sparePowerUnits}шт; карты-${spareReceivers}шт.`;

  // --- Расчет цены (ЗАГЛУШКА!) ---
  const calculatePrice = (): string => {
    return "Расчет будет доступен позже";
  };
  const offerPrice = calculatePrice();

  const handleSaveOffer = () => {
    // Собираем все данные для лога/сохранения
    const offerData = {
      inputWidth, inputHeight, screenType, selectedProtection, selectedMaterial,
      selectedPixelStep, selectedCabinet, selectedOptions: data.selectedOptions,
      exchangeRate: data.exchangeRate,
      isHorizontal, widthCabCount, heightCabCount, totalCabinets, finalWidth, finalHeight,
      activeArea: activeArea.toFixed(2), resolution, totalPixels,
      totalModules, totalPowerUnits, totalReceivers, brightness, refreshFreq,
      viewingDistance, zipKit, calculatedPrice: offerPrice
    };
    console.log("📝 Сохранение предложения (данные):", offerData);
    // TODO: Отправить данные в API
    onClose();
  };

  return (
    <Drawer opened={opened} onClose={onClose} title={<div className={styles.drawerTitle}>Результаты расчёта</div>} position="right" size="xl" styles={{ header: { justifyContent: "center" }, title: { width: "100%", textAlign: "center" } }}>
      <Stack>
        {/* Таблица с результатами */}
        <Table striped highlightOnHover withTableBorder withColumnBorders className={styles.table} layout="fixed">
          <Table.Thead>
            <Table.Tr>
              <Table.Th className={styles.th} w="40%">Характеристика</Table.Th>
              <Table.Th className={styles.th} w="60%">Значение</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>Исполнение</Table.Td>
              <Table.Td>{screenType || "-"}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Материал кабинета</Table.Td>
              <Table.Td>{selectedMaterial || "-"}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Модель кабинета</Table.Td>
              <Table.Td>{cabinetName || "-"}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Размер кабинета (В×Ш)</Table.Td>
              <Table.Td>{`${cabinetHeight}×${cabinetWidth} мм`}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Кол-во кабинетов (В×Ш)</Table.Td>
              <Table.Td>{`${heightCabCount}×${widthCabCount} = ${totalCabinets} шт.`}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Ориентация</Table.Td>
              <Table.Td>{isHorizontal ? "горизонтальная" : "вертикальная"}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Пыле/влагозащита</Table.Td>
              <Table.Td>{selectedProtection || "-"}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Кол-во модулей</Table.Td>
              <Table.Td>{totalModules} шт.</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Тип диодов</Table.Td>
              <Table.Td>SMD</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Шаг пикселя</Table.Td>
              <Table.Td>{selectedPixelStep || "-"} ({numericPixelStep ? `${numericPixelStep.toFixed(2)} мм` : '-'})</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Ширина полотна</Table.Td>
              <Table.Td>{finalWidth} мм</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Высота полотна</Table.Td>
              <Table.Td>{finalHeight} мм</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Разрешение (В×Ш)</Table.Td>
              <Table.Td>{resolution}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Общее кол-во пикселей</Table.Td>
              <Table.Td>
                {typeof totalPixels === 'number'
                  ? `${totalPixels.toLocaleString('ru-RU')} пикс.`
                  : totalPixels
                }
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Площадь</Table.Td>
              <Table.Td>{activeArea.toFixed(2)} м²</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Яркость</Table.Td>
              <Table.Td>{brightness} кд/м²</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Частота обновления</Table.Td>
              <Table.Td>{refreshFreq} Гц</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Угол обзора (Г°/В°)</Table.Td>
              <Table.Td>{`${DEFAULT_VIEW_ANGLE}° / ${DEFAULT_VIEW_ANGLE}°`}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Дистанция обзора</Table.Td>
              <Table.Td>от {viewingDistance} м</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>ЗИП</Table.Td>
              <Table.Td>{zipKit}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td><b>Цена решения</b></Table.Td>
              <Table.Td><b>{offerPrice}</b></Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
        <Center mt="md">
          <Button onClick={handleSaveOffer}>Сохранить предложение</Button>
        </Center>
      </Stack>
    </Drawer>
  );
};

export default CalculationResults;