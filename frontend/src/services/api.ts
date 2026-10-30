const API_BASE = '/api';

export const api = {
  // Project & System
  getProject: async () => {
    const res = await fetch(`${API_BASE}/project`);
    return res.json();
  },
  updateProject: async (data: any) => {
    const res = await fetch(`${API_BASE}/project`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getSystemStatus: async () => {
    const res = await fetch(`${API_BASE}/system/status`);
    return res.json();
  },

  // Task 1: Shodan & Target
  searchShodan: async (query: string, apiKey?: string) => {
    const res = await fetch(`${API_BASE}/task1/shodan-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, api_key: apiKey }),
    });
    return res.json();
  },
  selectTarget: async (data: any) => {
    const res = await fetch(`${API_BASE}/task1/select-target`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getTarget: async () => {
    const res = await fetch(`${API_BASE}/task1/target`);
    return res.json();
  },
  updateAuthorization: async (data: any) => {
    const res = await fetch(`${API_BASE}/task1/authorization`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Task 2: Host & Port Discovery
  previewScan: async (scanType: string) => {
    const res = await fetch(`${API_BASE}/task2/preview-command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scan_type: scanType }),
    });
    return res.json();
  },
  executeScan: async (scanType: string) => {
    const res = await fetch(`${API_BASE}/task2/execute-scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scan_type: scanType, confirmed: true }),
    });
    return res.json();
  },
  getScanHistory: async () => {
    const res = await fetch(`${API_BASE}/task2/scans`);
    return res.json();
  },
  cancelScan: async (sessionId: number) => {
    const res = await fetch(`${API_BASE}/task2/cancel/${sessionId}`, { method: 'POST' });
    return res.json();
  },

  // Task 3: Attack Surface
  getAttackSurface: async () => {
    const res = await fetch(`${API_BASE}/task3/attack-surface`);
    return res.json();
  },
  updatePort: async (portId: number, data: any) => {
    const res = await fetch(`${API_BASE}/task3/ports/${portId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Task 4: Service Enumeration
  getEnumerationServices: async () => {
    const res = await fetch(`${API_BASE}/task4/services`);
    return res.json();
  },
  runEnumeration: async (port: number, serviceName: string, toolName: string) => {
    const res = await fetch(`${API_BASE}/task4/enumerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ port, service_name: serviceName, tool_name: toolName }),
    });
    return res.json();
  },
  getEnumerations: async () => {
    const res = await fetch(`${API_BASE}/task4/enumerations`);
    return res.json();
  },

  // Task 5: FTP Security Assessment
  getFtpStatus: async () => {
    const res = await fetch(`${API_BASE}/task5/ftp-status`);
    return res.json();
  },
  runFtpAssessment: async (uploadTest: boolean, instructorConfirmed: boolean) => {
    const res = await fetch(`${API_BASE}/task5/assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        port: 21,
        run_controlled_upload_test: uploadTest,
        instructor_permission_acknowledged: instructorConfirmed,
      }),
    });
    return res.json();
  },
  getFtpResult: async () => {
    const res = await fetch(`${API_BASE}/task5/result`);
    return res.json();
  },

  // Task 6: Strategy Challenge
  getStrategyScenario: async () => {
    const res = await fetch(`${API_BASE}/task6/scenario`);
    return res.json();
  },
  saveStrategy: async (items: any[]) => {
    const res = await fetch(`${API_BASE}/task6/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    return res.json();
  },

  // Task 7: Unknown Service
  getUnknownServices: async () => {
    const res = await fetch(`${API_BASE}/task7/unknown-services`);
    return res.json();
  },
  investigateUnknown: async (port: number) => {
    const res = await fetch(`${API_BASE}/task7/investigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ port, probe_type: 'banner_http_tcp' }),
    });
    return res.json();
  },

  // Task 8: Final Assessment
  getFinalSummary: async () => {
    const res = await fetch(`${API_BASE}/task8/summary`);
    return res.json();
  },
  createFinding: async (data: any) => {
    const res = await fetch(`${API_BASE}/task8/findings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Evidence Management
  listEvidence: async (task?: string, category?: string) => {
    let url = `${API_BASE}/evidence`;
    const params = new URLSearchParams();
    if (task) params.append('task', task);
    if (category) params.append('category', category);
    if (params.toString()) url += `?${params.toString()}`;
    const res = await fetch(url);
    return res.json();
  },
  uploadEvidence: async (formData: FormData) => {
    const res = await fetch(`${API_BASE}/evidence/upload`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },
  deleteEvidence: async (id: number) => {
    const res = await fetch(`${API_BASE}/evidence/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Reports
  generateReport: async (studentName: string, batchTeam: string) => {
    const res = await fetch(`${API_BASE}/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_name: studentName, batch_team: batchTeam }),
    });
    return res.json();
  },

  // Marking Scheme
  getMarkingScheme: async () => {
    const res = await fetch(`${API_BASE}/marking-scheme`);
    return res.json();
  },
};

