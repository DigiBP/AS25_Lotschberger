import { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Divider, Stack, TextField, Typography, Chip } from "@mui/material";
import { camunda } from "../api/camunda";
import type { CamundaTask } from "../api/camunda";

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
  onDone,
}: {
  task: CamundaTask | null;
  userId: string;
  onDone: () => void;
}) {
  const [vars, setVarsState] = useState<CamundaVars>({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!task) return;
    const t = task;

    (async () => {
      try {
        setMsg(null);
        const v = await camunda.getTaskVars(t.id);
        setVarsState(v);
      } catch (e: any) {
        setMsg(e?.message ?? "Failed to load variables");
      }
    })();
  }, [task]);

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

  async function claim() {
    try {
      setLoading(true);
      setMsg(null);
      await camunda.claimTask(t.id, userId);
      setMsg("Task claimed.");
      onDone();
    } catch (e: any) {
      setMsg(e?.message ?? "Claim failed");
    } finally {
      setLoading(false);
    }
  }

  async function complete() {
    try {
      setLoading(true);
      setMsg(null);
      await camunda.completeTask(t.id, vars);
      setMsg("Task completed.");
      onDone();
    } catch (e: any) {
      setMsg(e?.message ?? "Complete failed");
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

          {/* Summary */}
          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Summary
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              <TextField label="Medication" value={getVar(vars, "medicationName")} InputProps={{ readOnly: true }} />
              <TextField label="Quantity" value={getVar(vars, "quantity")} InputProps={{ readOnly: true }} />
              <TextField label="Preferred delivery" value={getVar(vars, "preferredDelivery")} InputProps={{ readOnly: true }} />
              <TextField label="Doctor" value={getVar(vars, "doctorName")} InputProps={{ readOnly: true }} />
            </Box>
          </Stack>

          <Divider />

          {/* Task-specific inputs */}
          {mode.includes("order") && (
            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Order medication
              </Typography>
              <TextField
                label="Supplier note (optional)"
                value={getVar(vars, "orderNote")}
                onChange={(e) => setVarsState((v) => setVar(v, "orderNote", e.target.value, "String"))}
              />
              <TextField
                label="Order approved?"
                value={getVar(vars, "orderApproved")}
                onChange={(e) => setVarsState((v) => setVar(v, "orderApproved", e.target.value, "String"))}
                placeholder="yes / no"
              />
            </Stack>
          )}

          {mode.includes("receive") && (
            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Receive delivery
              </Typography>
              <TextField
                label="Delivery received?"
                value={getVar(vars, "deliveryReceived")}
                onChange={(e) => setVarsState((v) => setVar(v, "deliveryReceived", e.target.value, "String"))}
                placeholder="yes"
              />
              <TextField
                label="Delivered quantity"
                value={getVar(vars, "deliveredQuantity")}
                onChange={(e) => setVarsState((v) => setVar(v, "deliveredQuantity", Number(e.target.value), "Integer"))}
                type="number"
              />
            </Stack>
          )}

          {mode.includes("register") && (
            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Register delivery in system
              </Typography>
              <TextField
                label="Internal reference"
                value={getVar(vars, "internalRef")}
                onChange={(e) => setVarsState((v) => setVar(v, "internalRef", e.target.value, "String"))}
              />
            </Stack>
          )}

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
              <TextField
                label="Locker code (optional)"
                value={getVar(vars, "lockerCode")}
                onChange={(e) => setVarsState((v) => setVar(v, "lockerCode", e.target.value, "String"))}
              />
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

          {msg && (
            <Typography variant="body2" color="text.secondary">
              {msg}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}