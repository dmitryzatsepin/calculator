import { Container, Title } from "@mantine/core";
import DisplayDataInput from "../components/DisplayDataInput";

const DisplayCalculator = () => {
  console.log("Rendering DisplayCalculator");
  return (
    <Container>
      <Title order={2} mb="md">
        Калькулятор
      </Title>
      <DisplayDataInput />
    </Container>
  );
};

export default DisplayCalculator;
