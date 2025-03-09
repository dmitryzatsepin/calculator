import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import DisplayCalculator from "./pages/DisplayCalculator";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <MantineProvider theme={{}}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DisplayCalculator />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
};

export default App;