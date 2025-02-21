import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";

import { configurePassport } from "./config/passport";
import authRoutes from "./routes/authRoutes";
import pixelStepRoutes from "./routes/pixelStepRoutes";
import cabinetRoutes from "./routes/cabinetRoutes";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(passport.initialize());
configurePassport(passport);

app.use("/auth", authRoutes);
app.use("/pixel-steps", pixelStepRoutes);
app.use("/cabinets", cabinetRoutes);


app.get("/", (req, res) => {
  res.json({ message: "API работает! 🚀" });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));
