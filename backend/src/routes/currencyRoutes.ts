import { Router } from "express";
import axios from "axios";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://www.cbr-xml-daily.ru/daily_json.js");
    res.json(response.data);
  } catch (error) {
    console.error("Ошибка при получении курса валют:", error);
    res.status(500).json({ error: "Не удалось получить курс валют" });
  }
});

export default router;