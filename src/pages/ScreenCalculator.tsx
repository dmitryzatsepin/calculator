import { Container, Title } from "@mantine/core";
import ScreenTypeSelect from "../components/ScreenTypeSelect";

const ScreenCalculator = () => {
  return (
    <Container>
      <Title order={2} mb="md">
        Калькулятор экрана
      </Title>
      <ScreenTypeSelect />
    </Container>
  );
};

export default ScreenCalculator;
