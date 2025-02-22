import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import ScreenCalculator from "./pages/ScreenCalculator";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <MantineProvider theme={{}}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ScreenCalculator />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
};

export default App;