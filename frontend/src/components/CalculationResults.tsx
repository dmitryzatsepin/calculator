import { Drawer, Table, Button, Center } from "@mantine/core";
import styles from "../styles/CalculationResults.module.scss";

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
    selectedCabinet: {
      id: number;
      name: string;
      width: number;
      height: number;
      pixelStep: string[];
      material: string[];
      modulesQ: number;
      powerUnitQ: number;
      receiver: number;
    } | null;
    cabinetName: string | null;
    cabinetWidth: number | null;
    cabinetHeight: number | null;
    selectedOptions: string[];
    pixelSteps: {
      id: number;
      name: string;
      type: string;
      brightness: number;
      refreshFreq: number;
    }[];
  };
}


// Функция для извлечения числового значения шага пикселя
const extractNumericPixelStep = (pixelStep: string | null): string => {
  if (!pixelStep) return "-"; // Если пусто, ставим прочерк
  const match = pixelStep.match(/\d+(\.\d+)?/); // Ищем число с точкой (если есть)
  return match ? match[0] : "-"; // Если нашли, возвращаем; иначе прочерк
};

// Определяем тип диодов
const getDiodeType = (pixelStep: string | null): string => {
  if (!pixelStep) return "-";
  return pixelStep.includes("eco") ? "SMD" : "SMD2";
};

const CalculationResults = ({
  opened,
  onClose,
  data,
}: CalculationResultsProps) => {
  if (!data.selectedCabinet || !data.cabinetWidth || !data.cabinetHeight) {
    return null; // Если данные не выбраны, не рендерим таблицу
  }
  // 🔥 Функция-заглушка для будущей логики сохранения
  const handleSaveOffer = () => {
    console.log("📝 Сохранение предложения...", data);
    // Здесь позже добавим отправку данных в API или сохранение в localStorage
  };

  // **🔥 Находим выбранный шаг пикселя**
  const selectedStep = data.pixelSteps.find(
    (step) => step.name === data.selectedPixelStep
  );
  const brightness = selectedStep?.brightness ?? "-"; // Если нет данных, ставим прочерк
  const refreshFreq = selectedStep?.refreshFreq ?? "-"; // Если нет данных, ставим прочерк

  // Преобразуем размеры в числа
  const screenWidth = parseInt(data.width, 10);
  const screenHeight = parseInt(data.height, 10);
  const cabinetWidth = data.cabinetWidth;
  const cabinetHeight = data.cabinetHeight;

  // 🔥 Рассчитываем количество кабинетов при разной ориентации
  const widthCabinetsHorizontal = Math.floor(screenWidth / cabinetWidth);
  const heightCabinetsHorizontal = Math.floor(screenHeight / cabinetHeight);
  const totalHorizontal = widthCabinetsHorizontal * heightCabinetsHorizontal;

  const widthCabinetsVertical = Math.floor(screenWidth / cabinetHeight);
  const heightCabinetsVertical = Math.floor(screenHeight / cabinetWidth);
  const totalVertical = widthCabinetsVertical * heightCabinetsVertical;

  // 🔥 Выбираем лучший вариант размещения (чтобы уместилось больше кабинетов)
  const isHorizontal = totalHorizontal >= totalVertical;
  const widthCabinetsCount = isHorizontal
    ? widthCabinetsHorizontal
    : widthCabinetsVertical;
  const heightCabinetsCount = isHorizontal
    ? heightCabinetsHorizontal
    : heightCabinetsVertical;
  const totalCabinets = widthCabinetsCount * heightCabinetsCount;
  const finalWidth =
    widthCabinetsCount * (isHorizontal ? cabinetWidth : cabinetHeight);
  const finalHeight =
    heightCabinetsCount * (isHorizontal ? cabinetHeight : cabinetWidth);
  const activeArea = (finalWidth * finalHeight) / 1_000_000; // Площадь в м²

  // 🔥 Дистанция обзора (число из шага пикселя)
  const viewingDistance = extractNumericPixelStep(data.selectedPixelStep);

    // **🔥 Расчет ЗИП комплекта (5% от общего количества)**
  const spareModules = Math.ceil((totalCabinets * (data.selectedCabinet?.modulesQ ?? 0)) * 0.05);
  const sparePowerUnits = Math.ceil((totalCabinets * (data.selectedCabinet?.powerUnitQ ?? 0)) * 0.05);
  const spareReceivers = Math.ceil((totalCabinets * (data.selectedCabinet?.receiver ?? 0)) * 0.05);

  // **🔥 Формируем строку ЗИП комплекта**
  const zipKit = `модули - ${spareModules} шт.; БП - ${sparePowerUnits} шт.; приёмные карты - ${spareReceivers} шт.`;


  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={<div className={styles.drawerTitle}>Результаты расчёта</div>}
      position="right"
      size="xl"
      styles={{
        header: {
          justifyContent: 'center',
        },
        title: {
          width: '100%',
          textAlign: 'center',
        }
      }}
    >
      <Table
  striped
  highlightOnHover
  withTableBorder
  withColumnBorders
  className={styles.table}
>
  <Table.Thead>
    <Table.Tr>
      <Table.Th className={styles.th}>Характеристика</Table.Th>
      <Table.Th className={styles.th}>Значение</Table.Th>
    </Table.Tr>
  </Table.Thead>
  <Table.Tbody>
    <Table.Tr>
      <Table.Td className={styles.td}>Исполнение экрана</Table.Td>
      <Table.Td className={styles.td}>{data.screenType || "-"}</Table.Td>
    </Table.Tr>
    <Table.Tr>
      <Table.Td className={styles.td}>Материал кабинета</Table.Td>
      <Table.Td className={styles.td}>{data.selectedMaterial || "-"}</Table.Td>
    </Table.Tr>
    <Table.Tr>
      <Table.Td className={styles.td}>Размер кабинета</Table.Td>
      <Table.Td className={styles.td}>{`${cabinetHeight}×${cabinetWidth} мм`}</Table.Td>
    </Table.Tr>
    <Table.Tr>
      <Table.Td className={styles.td}>Количество кабинетов</Table.Td>
      <Table.Td className={styles.td}>{totalCabinets} шт.</Table.Td>
    </Table.Tr>
    <Table.Tr>
      <Table.Td className={styles.td}>Ориентация кабинетов</Table.Td>
      <Table.Td className={styles.td}>
        {isHorizontal ? "горизонтальная" : "вертикальная"}
      </Table.Td>
    </Table.Tr>
    <Table.Tr>
      <Table.Td className={styles.td}>Пыле и влагозащита</Table.Td>
      <Table.Td className={styles.td}>{data.selectedProtection || "-"}</Table.Td>
    </Table.Tr>
    <Table.Tr>
      <Table.Td className={styles.td}>Тип диодов</Table.Td>
      <Table.Td className={styles.td}>
        {getDiodeType(data.selectedPixelStep)}
      </Table.Td>
    </Table.Tr>
    <Table.Tr>
      <Table.Td className={styles.td}>Компоновка (шаг пикселя)</Table.Td>
      <Table.Td className={styles.td}>
        {extractNumericPixelStep(data.selectedPixelStep)} мм
      </Table.Td>
    </Table.Tr>
    <Table.Tr>
      <Table.Td className={styles.td}>Ширина светодиодного полотна</Table.Td>
      <Table.Td className={styles.td}>{finalWidth} мм</Table.Td>
    </Table.Tr>
    <Table.Tr>
      <Table.Td className={styles.td}>Высота светодиодного полотна</Table.Td>
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
      <Table.Td className={styles.td}>Горизонтальный угол обзора</Table.Td>
      <Table.Td className={styles.td}>149°</Table.Td>
    </Table.Tr>
    <Table.Tr>
      <Table.Td className={styles.td}>Вертикальный угол обзора</Table.Td>
      <Table.Td className={styles.td}>149°</Table.Td>
    </Table.Tr>
    <Table.Tr>
      <Table.Td className={styles.td}>Дистанция обзора</Table.Td>
      <Table.Td className={styles.td}>от {viewingDistance} м</Table.Td>
    </Table.Tr>
    <Table.Tr>
      <Table.Td className={styles.td}>ЗИП комплект (Запасные части)</Table.Td>
      <Table.Td className={styles.td}>{zipKit}</Table.Td>
    </Table.Tr>
    <Table.Tr>
      <Table.Td className={styles.td}>Цена предложения</Table.Td>
      <Table.Td className={styles.td}></Table.Td>
    </Table.Tr>
  </Table.Tbody>
</Table>
      <Center mt="md">
          <Button onClick={handleSaveOffer}>Сохранить предложение</Button>
      </Center>
    </Drawer>
  );
};

export default CalculationResults;
