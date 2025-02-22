export const login = async (email: string, password: string) => {
  const response = await fetch("http://localhost:5000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Ошибка входа");
  }

  const data = await response.json();
  localStorage.setItem("token", data.token);
  return data;
};
