import { Container, Title, Paper } from '@mantine/core';
import CalculatorForm from '../components/CalculatorForm';

const DisplayCalculator = () => {
  return (
    <Container size="lg" my="xl">
      <Title order={1} ta="center" mb="xl">
        Калькулятор LED Экранов
      </Title>
      <Paper shadow="xs" p="xl" withBorder radius="md">
        <CalculatorForm />
      </Paper>
    </Container>
  );
};

export default DisplayCalculator;
