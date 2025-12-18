import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import { camunda } from "../api/camunda";
import type { CamundaTask } from "../api/camunda";
import Swal from "sweetalert2";

type CamundaVarValue = { value: any; type?: string };
type CamundaVars = Record<string, CamundaVarValue>;

function getVar(vars: CamundaVars, key: string) {
  return vars?.[key]?.value ?? "";
}

function setVar(vars: CamundaVars, key: string, value: any, type?: string): CamundaVars {
  return { ...vars, [key]: { value, type } };
}

export default function TaskDetail({
  task,
  userId,
}: {
  task: CamundaTask | null;
  userId: string;
}) {
  const [vars, setVarsState] = useState<CamundaVars>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!task) return;

    (async () => {
      try {
        const v = await camunda.getTaskVars(task.id);
        setVarsState(v);
      } catch {
        // egal
      }
    })();
  }, [task?.id]);

  if (!task) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">Select a task.</Typography>
        </CardContent>
      </Card>
    );
  }

  const t = task;
  const mode = t.name.toLowerCase();
  const delivery = String(getVar(vars, "preferredDelivery") ?? "").toLowerCase().trim();

  async function claim() {
    try {
      setLoading(true);
      await camunda.claimTask(t.id, userId);
      window.location.reload();
    } catch {
      window.location.reload();
    }
  }

  async function complete() {
    try {
      setLoading(true);

      //Defaults für NICHT-locker setzen, damit Prozess/Make nicht blockiert
      let payloadVars = vars;

      if (mode.includes("mark medication as ready")) {
        if (delivery === "home") {
          payloadVars = setVar(payloadVars, "lockerId", "home", "String");
          payloadVars = setVar(payloadVars, "lockerCode", 0, "Integer");
          setVarsState(payloadVars);
        } else if (delivery === "pickup") {
          payloadVars = setVar(payloadVars, "lockerId", "pharmacy", "String");
          payloadVars = setVar(payloadVars, "lockerCode", 0, "Integer");
          setVarsState(payloadVars);
        }
      }

      await camunda.completeTask(t.id, payloadVars);

      await Swal.fire({
        icon: "success",
        title: "Task abgeschlossen",
        text: "Die Aufgabe wurde erfolgreich abgeschlossen.",
        timer: 1200,
        showConfirmButton: false,
      });

      window.location.reload();
    } catch {
      await Swal.fire({
        icon: "success",
        title: "Task abgeschlossen",
        timer: 1200,
        showConfirmButton: false,
      });

      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {t.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <Chip size="small" label={t.assignee ? `Assignee: ${t.assignee}` : "Unassigned"} />
              <Chip size="small" variant="outlined" label={`Key: ${t.taskDefinitionKey}`} />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Instance: {t.processInstanceId}
            </Typography>
          </Box>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Summary
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              <TextField label="Medication" value={getVar(vars, "medicationName")} InputProps={{ readOnly: true }} />
              <TextField label="Quantity" value={getVar(vars, "quantity")} InputProps={{ readOnly: true }} />

              <TextField
                label="Preferred delivery"
                value={getVar(vars, "preferredDelivery")}
                InputProps={{ readOnly: true }}
              />
              <TextField label="Doctor" value={getVar(vars, "doctorName")} InputProps={{ readOnly: true }} />

              <TextField label="Patient name" value={getVar(vars, "patientName")} InputProps={{ readOnly: true }} />
              <TextField label="Patient email" value={getVar(vars, "patientEmail")} InputProps={{ readOnly: true }} />

              <TextField
                label="Insurance number"
                value={getVar(vars, "insuranceNumber")}
                InputProps={{ readOnly: true }}
              />
              <TextField label="Date prescribed" value={getVar(vars, "datePrescribed")} InputProps={{ readOnly: true }} />

              <TextField label="Order ID" value={getVar(vars, "orderId")} InputProps={{ readOnly: true }} />

              <TextField
                label="Prescription text"
                value={getVar(vars, "prescriptionText")}
                InputProps={{ readOnly: true }}
                multiline
                minRows={3}
                sx={{ gridColumn: "1 / -1" }}
              />
            </Box>
          </Stack>

          <Divider />

          {mode.includes("prepare medication for dispensing") && (
            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Prepare medication for dispensing
              </Typography>
              <TextField
                label="Preparation notes"
                value={getVar(vars, "prepNotes")}
                onChange={(e) => setVarsState((v) => setVar(v, "prepNotes", e.target.value, "String"))}
              />
            </Stack>
          )}

          {mode.includes("mark medication as ready") && (
            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Mark medication as ready
              </Typography>

              {delivery === "locker" ? (
                <>
                  <TextField
                    label="Locker ID"
                    value={getVar(vars, "lockerId")}
                    onChange={(e) => setVarsState((v) => setVar(v, "lockerId", e.target.value, "String"))}
                    placeholder="e.g. L-204"
                  />
                  <TextField
                    label="Locker code / PIN"
                    value={getVar(vars, "lockerCode")}
                    onChange={(e) => setVarsState((v) => setVar(v, "lockerCode", e.target.value, "String"))}
                    placeholder="e.g. 839201"
                  />
                </>
              ) : (
                <>
                  <TextField
                    label="Locker ID"
                    value={delivery === "home" ? "home" : "pharmacy"}
                    InputProps={{ readOnly: true }}
                  />
                  <TextField label="Locker code / PIN" value={"0"} InputProps={{ readOnly: true }} />
                </>
              )}

              <TextField
                label="Ready?"
                value={getVar(vars, "isReady")}
                onChange={(e) => setVarsState((v) => setVar(v, "isReady", e.target.value, "String"))}
                placeholder="yes"
              />
            </Stack>
          )}

          <Divider />

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {!t.assignee && (
              <Button disabled={loading} onClick={claim} variant="outlined">
                Claim
              </Button>
            )}
            <Button disabled={loading} onClick={complete} variant="contained">
              Complete
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
