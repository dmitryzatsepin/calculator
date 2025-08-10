// src/pages/DisplayCalculator.tsx
import { Container, Title, Paper, Drawer, Badge, Group } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import CalculatorForm from "../components/calculator/CalculatorForm";
// --- Импортируем новый хук ---
import { useCalculationResult } from "../context/CalculationResultProvider";
import CalculationResults from "../components/calculator/CalculationResults";

const DisplayCalculator = () => {
  // --- Используем новый, более специфичный хук ---
  const { isDrawerOpen, setIsDrawerOpen, isBitrix24Available } =
    useCalculationResult();

  return (
    <Container size="lg" my="xl">
      <Group justify="space-between" align="center" mb="xl">
        <Title order={1}>
          Калькулятор LED Экранов
        </Title>
        <Badge
          leftSection={isBitrix24Available ? <IconCheck size={12} /> : <IconX size={12} />}
          color={isBitrix24Available ? "green" : "red"}
          variant="light"
        >
          {isBitrix24Available ? "Битрикс24 подключен" : "Битрикс24 не подключен"}
        </Badge>
      </Group>

      <Paper shadow="xs" p="xl" withBorder radius="md">
        <CalculatorForm />
      </Paper>

      <Drawer
        opened={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Результаты расчета"
        position="right"
        size="xl"
        padding="md"
        shadow="sm"
        overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
        transitionProps={{
          transition: "slide-left",
          duration: 250,
          timingFunction: "ease",
        }}
      >
        {/*
          Здесь мы передаем `calculationResult` в компонент CalculationResults.
          Обратите внимание, что CalculationResults тоже нужно будет обновить,
          чтобы он брал данные из контекста напрямую, а не через props.
          Но пока оставим так, чтобы исправить текущую ошибку.
        */}
        <CalculationResults />
      </Drawer>
    </Container>
  );
};

export default DisplayCalculator;