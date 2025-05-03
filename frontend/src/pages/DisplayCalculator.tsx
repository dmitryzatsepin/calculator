//src/pages/DisplayCalculator.tsx
import { Container, Title, Paper, Drawer } from '@mantine/core';
import CalculatorForm from '../components/CalculatorForm';
import { useCalculatorContext } from '../context/CalculatorContext';
import CalculationResults from '../components/CalculationResults';

const DisplayCalculator = () => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    calculationResult
  } = useCalculatorContext();
  
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
          title={<Title order={3} fw={700}>
                Результаты расчета
            </Title>
          }
          position="right"
          size="xl"
          padding="md"
          shadow="sm"
          overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
          transitionProps={{ transition: 'slide-left', duration: 250, timingFunction: 'ease' }}
      >
          {/* Содержимое Drawer'а */}
          <CalculationResults results={calculationResult} />
      </Drawer>
    </Container>
  );
};

export default DisplayCalculator;
