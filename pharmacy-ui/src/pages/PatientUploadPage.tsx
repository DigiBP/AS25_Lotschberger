import { useState } from "react";
import { Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { camunda } from "../api/camunda";

const PROCESS_KEY = "Process_0zaizu3";

export default function PatientUploadPage() {
  const [insuranceNumber, setInsuranceNumber] = useState("4");
  const [medicationName, setMedicationName] = useState("Ibuprofen 400");
  const [quantity, setQuantity] = useState(1);
  const [datePrescribed, setDatePrescribed] = useState(() => new Date().toISOString().slice(0, 10)); 
  const [preferredDelivery, setPreferredDelivery] = useState("locker");
  const [prescriptionText, setPrescriptionText] = useState("Ibufen 400mg 1-0-1");
  const [doctorName, setDoctorName] = useState("Lisa Marry");
  const [patientEmail, setPatientEmail] = useState("patient@example.com");
  const [patientName, setPatientName] = useState("Test Patient");
  const [language, setLanguage] = useState("en");

  const [msg, setMsg] = useState<string | null>(null);

  async function start() {
    try {
      setMsg(null);

      await camunda.startProcess(PROCESS_KEY, {
        insuranceNumber: { value: insuranceNumber, type: "String" },
        medicationName: { value: medicationName, type: "String" },
        quantity: { value: quantity, type: "Integer" },
        datePrescribed: { value: datePrescribed, type: "String" },
        preferredDelivery: { value: preferredDelivery, type: "String" },
        prescriptionText: { value: prescriptionText, type: "String" },
        doctorName: { value: doctorName, type: "String" },
        patientEmail: { value: patientEmail, type: "String" },
        patientName: { value: patientName, type: "String" },
        language: { value: language, type: "String" },
      });

      setMsg("Prescription submitted. Process started.");
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to start process");
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        Patient Prescription Upload (Prototype)
      </Typography>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <TextField label="Insurance number" value={insuranceNumber} onChange={(e) => setInsuranceNumber(e.target.value)} />

            <TextField label="Medication name" value={medicationName} onChange={(e) => setMedicationName(e.target.value)} />

            <TextField
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              inputProps={{ min: 1 }}
            />

            <TextField
              label="Date prescribed"
              type="date"
              value={datePrescribed}
              onChange={(e) => setDatePrescribed(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField label="Preferred delivery" value={preferredDelivery} onChange={(e) => setPreferredDelivery(e.target.value)} />

            <TextField label="Doctor name" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} />

            <TextField label="Patient name" value={patientName} onChange={(e) => setPatientName(e.target.value)} />

            <TextField label="Patient email" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} />

            <TextField label="Language" value={language} onChange={(e) => setLanguage(e.target.value)} />

            <TextField
              label="Prescription text"
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
              multiline
              minRows={3}
            />

            <Button variant="contained" onClick={start}>
              Submit & Start Process
            </Button>

            {msg && <Typography color="text.secondary">{msg}</Typography>}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
