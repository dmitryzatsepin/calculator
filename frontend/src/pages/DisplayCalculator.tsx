// src/pages/DisplayCalculator.tsx
import { Container, Title, Paper, Drawer } from "@mantine/core";
import CalculatorForm from "../components/CalculatorForm";
// --- Импортируем новый хук ---
import { useCalculationResult } from "../context/CalculationResultProvider";
import CalculationResults from "../components/CalculationResults";

const DisplayCalculator = () => {
  // --- Используем новый, более специфичный хук ---
  const { isDrawerOpen, setIsDrawerOpen } =
    useCalculationResult();

  return (
    <Container size="lg" my="xl">
      <Title order={1} ta="center" mb="xl">
        Калькулятор LED Экранов
      </Title>
      <Paper shadow="xs" p="xl" withBorder radius="md">
        <CalculatorForm />
      </Paper>
      <Drawer
        opened={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Результаты расчета" // Changed to plain text
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