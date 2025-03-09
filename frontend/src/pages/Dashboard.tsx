import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "20px" }}>
      <h1>👋 Привет, {user?.name || "Гость"}!</h1>
      <p>Ваш email: {user?.email}</p>
      <button onClick={logout} style={{ marginTop: "10px", padding: "10px" }}>
        Выйти
      </button>
    </div>
  );
};

export default Dashboard;

