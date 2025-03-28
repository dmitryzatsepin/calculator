import { Drawer, Table, Button, Center, Text, Stack } from "@mantine/core";
import styles from "../styles/CalculationResults.module.scss";

// --- Типы ---
// (Опционально: Можно вынести типы CabinetType и PixelStep в отдельный файл types.ts и импортировать здесь и в DisplayParameters)
type PixelStepInfo = {
  id: number;
  name: string;
  type: string; // Добавим type, может пригодиться
  brightness: number;
  refreshFreq: number;
  // Добавьте location/option, если они нужны для расчетов здесь
};

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
    selectedCabinet: CabinetInfo | null; // Используем обновленный тип
    // Убраны cabinetName, cabinetWidth, cabinetHeight
    selectedOptions: string[];
    pixelSteps: PixelStepInfo[]; // Используем обновленный тип
    exchangeRate: number; // Добавлено поле курса
  };
}

// --- Константы ---
const SPARE_PARTS_PERCENTAGE = 0.05; // 5% ЗИП
const DEFAULT_VIEW_ANGLE = 149; // Стандартный угол обзора, если он всегда такой

// --- Вспомогательные функции ---
const extractNumericPixelStep = (pixelStepName: string | null): string => {
  if (!pixelStepName) return "-";
  const match = pixelStepName.match(/\d+(\.\d+)?/);
  return match ? match[0] : "-";
};

const getDiodeType = (pixelStepName: string | null): string => {
  if (!pixelStepName) return "-";
  // Упрощенная логика, можно доработать, если типы сложнее
  return pixelStepName.toLowerCase().includes("eco") ? "SMD" : "SMD2";
};

// --- Компонент ---
const CalculationResults = ({
  opened,
  onClose,
  data,
}: CalculationResultsProps) => {
  // Деструктуризация для удобства
  const {
    width: inputWidth, // Переименуем, чтобы не конфликтовать с шириной кабинета
    height: inputHeight,
    screenType,
    selectedProtection,
    selectedMaterial,
    selectedPixelStep,
    selectedCabinet, // Ключевое изменение - используем этот объект
    selectedOptions,
    pixelSteps,
    exchangeRate,
  } = data;

  // --- Ранний выход, если кабинет не выбран ---
  // (Можно также добавить проверку на inputWidth/inputHeight, если нужно)
  if (!selectedCabinet) {
    // Можно вернуть null или заглушку внутри Drawer
    return (
      <Drawer opened={opened} onClose={onClose} title="Результаты расчёта" position="right" size="xl">
        <Center style={{ height: '100%' }}>
          <Text>Пожалуйста, выберите все параметры, включая кабинет.</Text>
        </Center>
      </Drawer>
    );
  }

  // --- Теперь мы знаем, что selectedCabinet не null ---
  const {
    name: cabinetName,
    width: cabinetWidth,
    height: cabinetHeight,
    modulesQ: modulesPerCabinet,
    powerUnitQ: powerUnitsPerCabinet,
    receiver: receiversPerCabinet,
  } = selectedCabinet;

  // --- Поиск информации о выбранном шаге пикселя ---
  const selectedStepInfo = pixelSteps.find(
    (step) => step.name === selectedPixelStep
  );
  const brightness = selectedStepInfo?.brightness ?? "-";
  const refreshFreq = selectedStepInfo?.refreshFreq ?? "-";

  // --- Основные расчеты ---
  const screenWidth = parseInt(inputWidth, 10) || 0; // Преобразуем в числа, с fallback на 0
  const screenHeight = parseInt(inputHeight, 10) || 0;

  // Расчет кол-ва кабинетов при разной ориентации
  const widthCabinetsHorizontal = Math.floor(screenWidth / cabinetWidth);
  const heightCabinetsHorizontal = Math.floor(screenHeight / cabinetHeight);
  const totalHorizontal = widthCabinetsHorizontal * heightCabinetsHorizontal;

  const widthCabinetsVertical = Math.floor(screenWidth / cabinetHeight); // Меняем местами ширину/высоту кабинета
  const heightCabinetsVertical = Math.floor(screenHeight / cabinetWidth);
  const totalVertical = widthCabinetsVertical * heightCabinetsVertical;

  // Выбор оптимального размещения
  const isHorizontal = totalHorizontal >= totalVertical;
  const widthCabinetsCount = isHorizontal ? widthCabinetsHorizontal : widthCabinetsVertical;
  const heightCabinetsCount = isHorizontal ? heightCabinetsHorizontal : heightCabinetsVertical;
  const totalCabinets = widthCabinetsCount * heightCabinetsCount;

  // Финальные размеры полотна
  const finalWidth = widthCabinetsCount * (isHorizontal ? cabinetWidth : cabinetHeight);
  const finalHeight = heightCabinetsCount * (isHorizontal ? cabinetHeight : cabinetWidth);
  const activeArea = (finalWidth * finalHeight) / 1_000_000; // Площадь в м²

  // Расчет компонентов
  const totalModules = totalCabinets * modulesPerCabinet;
  const totalPowerUnits = totalCabinets * powerUnitsPerCabinet; // Может понадобиться для расчета мощности
  const totalReceivers = totalCabinets * receiversPerCabinet; // Может понадобиться

  // Дистанция обзора
  const viewingDistance = extractNumericPixelStep(selectedPixelStep);

  // Расчет ЗИП комплекта
  const spareModules = Math.ceil(totalModules * SPARE_PARTS_PERCENTAGE);
  const sparePowerUnits = Math.ceil(totalPowerUnits * SPARE_PARTS_PERCENTAGE);
  const spareReceivers = Math.ceil(totalReceivers * SPARE_PARTS_PERCENTAGE);
  const zipKit = `модули - ${spareModules} шт.; БП - ${sparePowerUnits} шт.; приёмные карты - ${spareReceivers} шт.`;

  // Заглушка для расчета цены (требует доп. данных о ценах компонентов)
  const calculatePrice = (): string => {
      // TODO: Реализовать логику расчета цены на основе totalModules, totalCabinets, exchangeRate и т.д.
      // Нужны будут цены на модуль, кабинет, БП, карту, возможно контроллер и т.д.
      if (exchangeRate && totalModules > 0) {
         // Примерная заглушка
         const approximatePricePerModuleUSD = 50; // Очень грубо!
         const totalPriceUSD = totalModules * approximatePricePerModuleUSD;
         const totalPriceRUB = totalPriceUSD * exchangeRate;
         return `${totalPriceRUB.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽ (по курсу ${exchangeRate} ₽/$)`;
      }
      return "Требуется больше данных для расчета";
  };
  const offerPrice = calculatePrice();


  // --- Обработчик сохранения ---
  const handleSaveOffer = () => {
    console.log("📝 Сохранение предложения...");
    // Собрать все рассчитанные данные для отправки
    const offerData = {
        inputWidth, inputHeight, screenType, selectedProtection, selectedMaterial,
        selectedPixelStep, selectedCabinet, selectedOptions, exchangeRate,
        // Рассчитанные значения:
        isHorizontal, widthCabinetsCount, heightCabinetsCount, totalCabinets,
        finalWidth, finalHeight, activeArea: activeArea.toFixed(2),
        totalModules, totalPowerUnits, totalReceivers,
        brightness, refreshFreq, viewingDistance, zipKit,
        calculatedPrice: offerPrice // Сохраняем рассчитанную цену
    };
    console.log("Данные для сохранения:", offerData);
    // TODO: Отправить offerData в API или сохранить локально
    onClose(); // Закрыть Drawer после сохранения (опционально)
  };


  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={<div className={styles.drawerTitle}>Результаты расчёта</div>}
      position="right"
      size="xl"
      styles={{
        header: { justifyContent: 'center' },
        title: { width: '100%', textAlign: 'center' },
      }}
    >
      <Stack> {/* Оборачиваем таблицу и кнопку в Stack для отступов */}
        <Table
          striped
          highlightOnHover
          withTableBorder
          withColumnBorders
          className={styles.table}
          // Добавим layout=fixed для лучшего контроля ширины колонок, если нужно
          // layout="fixed"
        >
          <Table.Thead>
            <Table.Tr>
              {/* Можно задать ширину колонок */}
              <Table.Th className={styles.th} style={{ width: '40%' }}>Характеристика</Table.Th>
              <Table.Th className={styles.th} style={{ width: '60%' }}>Значение</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {/* Используем деструктурированные переменные */}
            <Table.Tr>
              <Table.Td className={styles.td}>Исполнение экрана</Table.Td>
              <Table.Td className={styles.td}>{screenType || "-"}</Table.Td>
            </Table.Tr>
             <Table.Tr>
               <Table.Td className={styles.td}>Материал кабинета</Table.Td>
               <Table.Td className={styles.td}>{selectedMaterial || "-"}</Table.Td>
             </Table.Tr>
             <Table.Tr>
               <Table.Td className={styles.td}>Модель кабинета</Table.Td>
               <Table.Td className={styles.td}>{cabinetName || "-"}</Table.Td>
             </Table.Tr>
            <Table.Tr>
              <Table.Td className={styles.td}>Размер кабинета (В×Ш)</Table.Td>
              {/* Используем переменные после проверки !selectedCabinet */}
              <Table.Td className={styles.td}>{`${cabinetHeight}×${cabinetWidth} мм`}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td className={styles.td}>Количество кабинетов (В×Ш)</Table.Td>
              <Table.Td className={styles.td}>{`${heightCabinetsCount}×${widthCabinetsCount} = ${totalCabinets} шт.`}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td className={styles.td}>Ориентация кабинетов</Table.Td>
              <Table.Td className={styles.td}>
                {isHorizontal ? "горизонтальная" : "вертикальная"}
              </Table.Td>
            </Table.Tr>
             <Table.Tr>
               <Table.Td className={styles.td}>Пыле- и влагозащита</Table.Td>
               <Table.Td className={styles.td}>{selectedProtection || "-"}</Table.Td>
             </Table.Tr>
            <Table.Tr>
              <Table.Td className={styles.td}>Количество модулей</Table.Td>
              <Table.Td className={styles.td}>{totalModules} шт.</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td className={styles.td}>Тип диодов</Table.Td>
              <Table.Td className={styles.td}>
                {getDiodeType(selectedPixelStep)}
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td className={styles.td}>Компоновка (шаг пикселя)</Table.Td>
              <Table.Td className={styles.td}>
                {extractNumericPixelStep(selectedPixelStep)} мм
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td className={styles.td}>Ширина полотна</Table.Td>
              <Table.Td className={styles.td}>{finalWidth} мм</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td className={styles.td}>Высота полотна</Table.Td>
              <Table.Td className={styles.td}>{finalHeight} мм</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td className={styles.td}>Площадь активной области</Table.Td>
              <Table.Td className={styles.td}>{activeArea.toFixed(2)} м²</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td className={styles.td}>Яркость</Table.Td>
              <Table.Td className={styles.td}>{brightness} кд/м²</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td className={styles.td}>Частота обновления</Table.Td>
              <Table.Td className={styles.td}>{refreshFreq} Гц</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td className={styles.td}>Угол обзора (Г°/В°)</Table.Td>
              <Table.Td className={styles.td}>{`${DEFAULT_VIEW_ANGLE}° / ${DEFAULT_VIEW_ANGLE}°`}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td className={styles.td}>Дистанция обзора</Table.Td>
              <Table.Td className={styles.td}>от {viewingDistance} м</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td className={styles.td}>ЗИП комплект</Table.Td>
              <Table.Td className={styles.td}>{zipKit}</Table.Td>
            </Table.Tr>
             {/* Строка с ценой */}
             <Table.Tr>
               <Table.Td className={styles.td}><b>Ориентировочная цена</b></Table.Td>
               <Table.Td className={styles.td}><b>{offerPrice}</b></Table.Td>
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