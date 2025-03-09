import { Container, Title, Text } from "@mantine/core";

const NotFound = () => {
  return (
    <Container>
      <Title order={2} style={{ color: "red" }}>
        404 - Страница не найдена
      </Title>
      <Text>Запрашиваемая страница не существует.</Text>
    </Container>
  );
};

export default NotFound;
