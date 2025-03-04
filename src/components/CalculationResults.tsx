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
    >
      <Table
        striped
        highlightOnHover
        withTableBorder
        withColumnBorders
        className={styles.table}
      >
        <thead>
          <tr>
            <th className={styles.th}>Характеристика</th>
            <th className={styles.th}>Значение</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={styles.td}>Исполнение экрана</td>
            <td className={styles.td}>{data.screenType || "-"}</td>
          </tr>
          <tr>
            <td className={styles.td}>Материал кабинета</td>
            <td className={styles.td}>{data.selectedMaterial || "-"}</td>
          </tr>
          <tr>
            <td className={styles.td}>Размер кабинета</td>
            <td
              className={styles.td}
            >{`${cabinetHeight}×${cabinetWidth} мм`}</td>
          </tr>
          <tr>
            <td className={styles.td}>Количество кабинетов</td>
            <td className={styles.td}>{totalCabinets} шт.</td>
          </tr>
          <tr>
            <td className={styles.td}>Ориентация кабинетов</td>
            <td className={styles.td}>
              {isHorizontal ? "горизонтальная" : "вертикальная"}
            </td>
          </tr>
          <tr>
            <td className={styles.td}>Пыле и влагозащита</td>
            <td className={styles.td}>{data.selectedProtection || "-"}</td>
          </tr>
          <tr>
            <td className={styles.td}>Тип диодов</td>
            <td className={styles.td}>
              {getDiodeType(data.selectedPixelStep)}
            </td>
          </tr>
          <tr>
            <td className={styles.td}>Компоновка (шаг пикселя)</td>
            <td className={styles.td}>
              {extractNumericPixelStep(data.selectedPixelStep)} мм
            </td>
          </tr>
          <tr>
            <td className={styles.td}>Ширина светодиодного полотна</td>
            <td className={styles.td}>{finalWidth} мм</td>
          </tr>
          <tr>
            <td className={styles.td}>Высота светодиодного полотна</td>
            <td className={styles.td}>{finalHeight} мм</td>
          </tr>
          <tr>
            <td className={styles.td}>Площадь активной области</td>
            <td className={styles.td}>{activeArea.toFixed(2)} м²</td>
          </tr>

          <tr>
            <td className={styles.td}>Яркость</td>
            <td className={styles.td}>{brightness} кд/м²</td>
          </tr>
          <tr>
            <td className={styles.td}>Частота обновления</td>
            <td className={styles.td}>{refreshFreq} Гц</td>
          </tr>
          <tr>
            <td className={styles.td}>Горизонтальный угол обзора</td>
            <td className={styles.td}>149°</td>
          </tr>
          <tr>
            <td className={styles.td}>Вертикальный угол обзора</td>
            <td className={styles.td}>149°</td>
          </tr>
          <tr>
            <td className={styles.td}>Дистанция обзора</td>
            <td className={styles.td}>от {viewingDistance} м</td>
          </tr>
          <tr>
            <td className={styles.td}>ЗИП комплект (Запасные части)</td>
            <td className={styles.td}>{zipKit}</td>
          </tr>
          <tr>
            <td className={styles.td}>Цена предложения</td>
            <td className={styles.td}></td>
          </tr>
        </tbody>
      </Table>
      <Center mt="md">
          <Button onClick={handleSaveOffer}>Сохранить предложение</Button>
      </Center>
    </Drawer>
  );
};

export default CalculationResults;
