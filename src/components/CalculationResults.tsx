import { Drawer, Table } from "@mantine/core";
import styles from "../styles/CalculationResults.module.scss";

interface CalculationResultsProps {
  opened: boolean;
  onClose: () => void;
  data: {
    width: string;
    height: string;
    screenType: string | null;
    selectedMaterial: string | null;
    selectedPixelStep: string | null;
    selectedCabinet: string | null;
    cabinetName: string | null;
    cabinetWidth: number | null;
    cabinetHeight: number | null;
  };
}

// Функция для извлечения числового значения шага пикселя
const extractNumericPixelStep = (pixelStep: string | null): string => {
  if (!pixelStep) return "-"; // Если пусто, ставим прочерк
  const match = pixelStep.match(/\d+(\.\d+)?/); // Ищем число с точкой (если есть)
  return match ? match[0] : "-"; // Если нашли, возвращаем; иначе прочерк
};


const CalculationResults = ({ opened, onClose, data }: CalculationResultsProps) => {
  if (!data.selectedCabinet || !data.cabinetWidth || !data.cabinetHeight) {
    return null; // Если данные не выбраны, не рендерим таблицу
  }

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
  const widthCabinetsCount = isHorizontal ? widthCabinetsHorizontal : widthCabinetsVertical;
  const heightCabinetsCount = isHorizontal ? heightCabinetsHorizontal : heightCabinetsVertical;
  const totalCabinets = widthCabinetsCount * heightCabinetsCount;
  const finalWidth = widthCabinetsCount * (isHorizontal ? cabinetWidth : cabinetHeight);
  const finalHeight = heightCabinetsCount * (isHorizontal ? cabinetHeight : cabinetWidth);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={<div className={styles.drawerTitle}>Результаты расчёта</div>}
      position="right"
      size="xl"
    >
      <Table striped highlightOnHover withTableBorder withColumnBorders className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Характеристика</th>
            <th className={styles.th}>Значение</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={styles.td}>Компоновка (шаг пикселя)</td>
            <td className={styles.td}>{extractNumericPixelStep(data.selectedPixelStep)} мм</td>
          </tr>
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
            <td className={styles.td}>{`${cabinetHeight}×${cabinetWidth} мм`}</td>
          </tr>
          <tr>
            <td className={styles.td}>Количество кабинетов</td>
            <td className={styles.td}>{totalCabinets} шт.</td> 
          </tr>
          <tr>
            <td className={styles.td}>Ориентация кабинетов</td>
            <td className={styles.td}>{isHorizontal ? "горизонтальная" : "вертикальная"}</td>
          </tr>
          <tr>
            <td className={styles.td}>Ширина светодиодного полотна</td>
            <td className={styles.td}>{finalWidth} мм</td>
          </tr>
          <tr>
            <td className={styles.td}>Высота светодиодного полотна</td>
            <td className={styles.td}>{finalHeight} мм</td>
          </tr>
        </tbody>
      </Table>
    </Drawer>
  );
};

export default CalculationResults;
