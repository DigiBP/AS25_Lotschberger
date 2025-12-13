import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import { CssBaseline, ThemeProvider, createTheme, Container } from "@mui/material";

const theme = createTheme({
  palette: { mode: "light" },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: ["Inter", "system-ui", "Arial"].join(","),
    h5: { fontWeight: 900 },
    h6: { fontWeight: 900 },
  },
  components: {
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { borderRadius: 16 } },
    },
    MuiButton: {
      styleOverrides: { root: { borderRadius: 12, textTransform: "none", fontWeight: 700 } },
    },
    MuiAppBar: {
      styleOverrides: { root: { borderRadius: 0 } },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <App />
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
