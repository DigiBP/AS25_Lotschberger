import { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Box,
  Alert,
  Divider,
} from "@mui/material";
import Swal from "sweetalert2";
import { camunda } from "../api/camunda";

const PROCESS_KEY = "Process_0zaizu3";

type DeliveryMethod = "locker" | "home" | "pickup";

type DemoExtracted = {
  insuranceNumber: string;
  medicationName: string;
  quantity: number;
  datePrescribed: string;
  preferredDelivery: DeliveryMethod;
  prescriptionText: string;
  doctorName: string;
  patientEmail: string;
  patientName: string;
  language: string;
};

export default function PatientUploadPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [lastWasA, setLastWasA] = useState(false);

  // form state: start empty
  const [insuranceNumber, setInsuranceNumber] = useState("");
  const [medicationName, setMedicationName] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [datePrescribed, setDatePrescribed] = useState("");
  const [preferredDelivery, setPreferredDelivery] = useState<DeliveryMethod>("locker");
  const [prescriptionText, setPrescriptionText] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientName, setPatientName] = useState("");
  const [language, setLanguage] = useState("");

  const hasUpload = !!uploadedFile;

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const demoA: DemoExtracted = useMemo(
    () => ({
      insuranceNumber: "4",
      medicationName: "Ibuprofen 400",
      quantity: 1,
      datePrescribed: today,
      preferredDelivery: "locker",
      doctorName: "Lisa Marry",
      prescriptionText: "Ibufen 400mg 1-0-1",
      patientName: "Test Patient",
      patientEmail: "patient@example.com",
      language: "en",
    }),
    [today]
  );

  const demoB: DemoExtracted = useMemo(
    () => ({
      insuranceNumber: "7",
      medicationName: "Paracetamol 500",
      quantity: 2,
      datePrescribed: today,
      preferredDelivery: "home", // ✅ was "delivery"
      doctorName: "Dr. Müller",
      prescriptionText: "Paracetamol 500mg 1-1-1",
      patientName: "Jane Demo",
      patientEmail: "jane.demo@example.com",
      language: "de",
    }),
    [today]
  );

  function applyDemoData() {
    const nextIsA = !lastWasA;
    setLastWasA(nextIsA);

    const d = nextIsA ? demoA : demoB;

    setInsuranceNumber(d.insuranceNumber);
    setMedicationName(d.medicationName);
    setQuantity(d.quantity);
    setDatePrescribed(d.datePrescribed);
    setPreferredDelivery(d.preferredDelivery);
    setDoctorName(d.doctorName);
    setPrescriptionText(d.prescriptionText);
    setPatientName(d.patientName);
    setPatientEmail(d.patientEmail);
    setLanguage(d.language);
  }

  function resetAll() {
    setUploadedFile(null);
    setUploadedFileName(null);
    setMsg(null);

    setInsuranceNumber("");
    setMedicationName("");
    setQuantity(1);
    setDatePrescribed("");
    setPreferredDelivery("locker");
    setPrescriptionText("");
    setDoctorName("");
    setPatientEmail("");
    setPatientName("");
    setLanguage("");
  }

  function deliveryMessage(method: DeliveryMethod) {
    if (method === "home") {
      return "You will get a notification when the delivery is on its way.";
    }
    // locker + pickup
    return "You will get a notification when your medication is ready for pickup.";
  }

  async function start() {
    try {
      setMsg(null);

      if (!uploadedFile) {
        setMsg("Please upload a prescription (PDF/photo) first.");
        return;
      }

      await camunda.startProcess(PROCESS_KEY, {
        insuranceNumber: { value: insuranceNumber, type: "String" },
        medicationName: { value: medicationName, type: "String" },
        quantity: { value: quantity, type: "Integer" },
        datePrescribed: { value: datePrescribed, type: "String" },
        preferredDelivery: { value: preferredDelivery, type: "String" }, // ✅ now "home"
        prescriptionText: { value: prescriptionText, type: "String" },
        doctorName: { value: doctorName, type: "String" },
        patientEmail: { value: patientEmail, type: "String" },
        patientName: { value: patientName, type: "String" },
        language: { value: language, type: "String" },
        prescriptionFileName: { value: uploadedFile.name, type: "String" },
      });

      await Swal.fire({
        icon: "success",
        title: "Process started",
        html: `
          <div style="text-align:left; line-height:1.5;">
            <div><b>Your prescription has been submitted.</b></div>
            <div style="margin-top:8px;">
              ${deliveryMessage(preferredDelivery)}
            </div>
          </div>
        `,
        confirmButtonText: "OK",
      });

      resetAll();
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to start process");
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 900 }}>
        Patient Prescription Upload (Prototype)
      </Typography>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Alert severity="info">
              Upload a prescription (PDF/photo). Then the system will <b>extract</b> data.
            </Alert>

            <Button variant="contained" component="label">
              Upload prescription (PDF / photo)
              <input
                hidden
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;

                  setUploadedFile(f);
                  setUploadedFileName(f.name);
                  setMsg(null);

                  applyDemoData();
                  e.currentTarget.value = "";
                }}
              />
            </Button>

            {uploadedFileName && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Uploaded: {uploadedFileName}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Extracted fields below (demo)
                </Typography>
              </Box>
            )}

            {!hasUpload ? (
              <Typography color="text.secondary">
                No prescription uploaded yet. Please upload a PDF/photo to continue.
              </Typography>
            ) : (
              <>
                <Divider />

                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Extracted data (editable)
                </Typography>

                <TextField
                  label="Insurance number"
                  value={insuranceNumber}
                  onChange={(e) => setInsuranceNumber(e.target.value)}
                />
                <TextField
                  label="Medication name"
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                />

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

                <TextField
                  select
                  label="Preferred delivery"
                  value={preferredDelivery}
                  onChange={(e) => setPreferredDelivery(e.target.value as DeliveryMethod)}
                >
                  <MenuItem value="locker">Locker pickup</MenuItem>
                  <MenuItem value="home">Home delivery</MenuItem> {/* ✅ was "delivery" */}
                  <MenuItem value="pickup">Pharmacy pickup</MenuItem>
                </TextField>

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

                <Button variant="contained" onClick={start} disabled={!hasUpload}>
                  Submit & Start Process
                </Button>
              </>
            )}

            {msg && <Typography color="text.secondary">{msg}</Typography>}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}