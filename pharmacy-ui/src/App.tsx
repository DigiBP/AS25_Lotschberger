import { Routes, Route, Navigate } from "react-router-dom";
import Shell from "./components/Shell";
import PatientUploadPage from "./pages/PatientUploadPage";
import PharmacistTasksPage from "./pages/PharmacistTasksPage";

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Navigate to="/pharmacist" replace />} />
        <Route path="/patient" element={<PatientUploadPage />} />
        <Route path="/pharmacist" element={<PharmacistTasksPage />} />
      </Routes>
    </Shell>
  );
}
