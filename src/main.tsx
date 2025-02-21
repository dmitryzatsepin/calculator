import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { BrowserRouter } from "react-router-dom";
import { Global } from "@emotion/react"; // Импортируем глобальные стили
import App from "./App";
import globalStyles from "./styles/globalStyles"; // Подключаем стили

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider>
      <Global styles={globalStyles} /> {/* Подключаем глобальные стили */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>
);
