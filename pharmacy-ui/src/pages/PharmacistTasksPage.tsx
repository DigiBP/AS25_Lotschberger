import { useEffect, useMemo, useState } from "react";
import { Box, Card, CardContent, Divider, List, ListItemButton, ListItemText, Stack, Typography, Chip } from "@mui/material";
import type { CamundaTask } from "../api/camunda";
import { camunda } from "../api/camunda";
import TaskDetail from "../components/TaskDetail";

const USER_ID = "pharmacist1"; 

export default function PharmacistTasksPage() {
  const [tasks, setTasks] = useState<CamundaTask[]>([]);
  const [selected, setSelected] = useState<CamundaTask | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const t = await camunda.listTasks();
      setTasks(t);
      if (!selected && t.length) setSelected(t[0]);
      if (selected && !t.find(x => x.id === selected.id)) setSelected(t[0] ?? null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load tasks");
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 3000); 
    return () => clearInterval(id);
  }, []);

  const title = useMemo(() => `Open Tasks (${tasks.length})`, [tasks.length]);

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          Pharmacist Tasklist
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Work through open user tasks and complete them.
        </Typography>
      </Stack>


      {error && (
        <Card>
          <CardContent>
            <Typography color="error">{error}</Typography>
          </CardContent>
        </Card>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 2, alignItems: "start" }}>
        <Card>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <List dense sx={{ maxHeight: "70vh", overflow: "auto" }}>
              {tasks.map((t) => (
                <ListItemButton
                  key={t.id}
                  selected={selected?.id === t.id}
                  onClick={() => setSelected(t)}
                  sx={{ borderRadius: 2, mb: 0.5 }}
                >
                    <ListItemText
                    primary={t.name}
                    secondary={
                        <Typography component="div" variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Chip size="small" label={t.assignee ? `Assignee: ${t.assignee}` : "Unassigned"} />
                            <Typography variant="caption" color="text.secondary">
                            {new Date(t.created).toLocaleString()}
                            </Typography>
                        </Stack>
                        </Typography>
                    }
                    />

                </ListItemButton>
              ))}
              {!tasks.length && (
                <Box sx={{ p: 2 }}>
                  <Typography color="text.secondary">No open tasks.</Typography>
                </Box>
              )}

            </List>
          </CardContent>
        </Card>

        <Box sx={{ position: "sticky", top: 96, alignSelf: "start" }}>
          <TaskDetail task={selected} userId={USER_ID} onDone={load} />
        </Box>

      </Box>
    </Stack>
  );
}
