export type CamundaTask = {
  id: string;
  name: string;
  assignee?: string | null;
  created: string;
  processInstanceId: string;
  taskDefinitionKey: string;
  tenantId?: string;
};

export type CamundaVariable = {
  value: any;
  type?: string;
};

export type CamundaVariables = Record<string, CamundaVariable>;

const BASE = import.meta.env.VITE_CAMUNDA_BASE as string;
const TENANT = import.meta.env.VITE_CAMUNDA_TENANT as string;

async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const camunda = {
  // --- TASK LIST ---
  listTasks: () =>
    http<CamundaTask[]>(
      `/task?${new URLSearchParams({
        tenantIdIn: TENANT,
        sortBy: "created",
        sortOrder: "desc",
      }).toString()}`
    ),

  // --- START PROCESS ---
    startProcess: (processKey: string, variables: CamundaVariables) =>
        http(`/process-definition/key/${processKey}/tenant-id/${TENANT}/start`, {
            method: "POST",
            body: JSON.stringify({ variables }),
        }),


  // --- TASK VARIABLES ---
  getTaskVars: (taskId: string) =>
    http<Record<string, { value: any; type?: string }>>(
      `/task/${taskId}/variables`
    ),

  // --- CLAIM TASK ---
  claimTask: (taskId: string, userId: string) =>
    http<void>(`/task/${taskId}/claim`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),

  // --- COMPLETE TASK ---
  completeTask: (
    taskId: string,
    variables: Record<string, { value: any; type?: string }>
  ) =>
    http<void>(`/task/${taskId}/complete`, {
      method: "POST",
      body: JSON.stringify({ variables }),
    }),
};
