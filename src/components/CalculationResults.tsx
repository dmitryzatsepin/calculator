import { Drawer, Table } from "@mantine/core";
import styles from "../styles/CalculationResults.module.scss";

interface CalculationResultsProps {
  opened: boolean;
  onClose: () => void;
  data: {
    width: string;
    height: string;
    screenType: string | null;
    selectedPixelStep: string | null;
    selectedCabinet: string | null;
    cabinetName: string | null;
  };
}

const CalculationResults = ({ opened, onClose, data }: CalculationResultsProps) => {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={<div className={styles.drawerTitle}>Результаты расчета</div>}
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
            <td className={styles.td}>Ширина экрана</td>
            <td className={styles.td}>{data.width} мм</td>
          </tr>
          <tr>
            <td className={styles.td}>Высота экрана</td>
            <td className={styles.td}>{data.height} мм</td>
          </tr>
          <tr>
            <td className={styles.td}>Тип экрана</td>
            <td className={styles.td}>{data.screenType}</td>
          </tr>
          <tr>
            <td className={styles.td}>Шаг пикселя</td>
            <td className={styles.td}>{data.selectedPixelStep}</td>
          </tr>
          <tr>
            <td className={styles.td}>Кабинет</td>
            <td className={styles.td}>{data.cabinetName || "Не выбран"}</td>
          </tr>
        </tbody>
      </Table>
    </Drawer>
  );
};

export default CalculationResults;