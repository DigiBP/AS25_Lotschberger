import { Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline, Container } from "@mui/material";
import Shell from "./components/Shell";
import PatientUploadPage from "./pages/PatientUploadPage";
import PharmacistTasksPage from "./pages/PharmacistTasksPage";

export default function App() {
  return (
    <>
      <CssBaseline />
      <Shell>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/pharmacist" replace />} />
            <Route path="/patient" element={<PatientUploadPage />} />
            <Route path="/pharmacist" element={<PharmacistTasksPage />} />
          </Routes>
        </Container>
      </Shell>
    </>
  );
}
