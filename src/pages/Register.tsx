import { useState } from "react";
import { TextInput, PasswordInput, Button, Container, Title, Paper } from "@mantine/core";
import { api } from "../utils/api";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await api.post("/auth/register", { name, email, password });
      navigate("/login");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert("Ошибка регистрации");
    }
  };

  return (
    <Container>
      <Paper shadow="xs" p="md">
        <Title>Регистрация</Title>
        <TextInput label="Имя" value={name} onChange={(e) => setName(e.target.value)} />
        <TextInput label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordInput label="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button onClick={handleSubmit} fullWidth mt="md">Зарегистрироваться</Button>
      </Paper>
    </Container>
  );
};

export default Register;
