import Homepage from "./pages/Homepage";
import { BrowserRouter } from "react-router-dom";
import { SelectedStockProvider } from "./context";
import { createTheme, ThemeProvider } from "@mui/material/styles";

function App() {
  
  const theme = createTheme({
    typography: {
      fontFamily:
        'Calibri, Candara, Segoe, "Segoe UI",  Optima, Arial, sans-serif',
    },
  });

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <SelectedStockProvider>
            <Homepage />
          </SelectedStockProvider>
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;
