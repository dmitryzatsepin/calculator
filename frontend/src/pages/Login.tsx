import { useState } from "react";
import { TextInput, PasswordInput, Button, Container, Title, Paper } from "@mantine/core";
import { login } from "../utils/authService";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await login(email, password);
      navigate("/dashboard");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert("Ошибка входа");
    }
  };

  return (
    <Container>
      <Paper shadow="xs" p="md">
        <Title>Вход</Title>
        <TextInput label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordInput label="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button onClick={handleSubmit} fullWidth mt="md">Войти</Button>
      </Paper>
    </Container>
  );
};

export default Login;
