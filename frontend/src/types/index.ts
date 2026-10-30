export interface Project {
  id: number;
  name: string;
  description: string;
  client_name: string;
  student_name: string;
  batch_team: string;
  academic_year: string;
}

export interface Target {
  id: number;
  ip_address: string;
  hostname?: string;
  domain?: string;
  org?: string;
  isp?: string;
  country?: string;
  city?: string;
  selected_reason?: string;
  is_local_lab: boolean;
  authorization_status: string;
  auth_reference?: string;
}

export interface AuthorizationRecord {
  id?: number;
  status: string;
  auth_reference: string;
  scope_description: string;
  allowed_ports: string;
  testing_restrictions: string;
  confirmed_by: string;
  confirmed_at?: string;
  legal_disclaimer_accepted: boolean;
}

export interface TaskStatusMap {
  task1: boolean;
  task2: boolean;
  task3: boolean;
  task4: boolean;
  task5: boolean;
  task6: boolean;
  task7: boolean;
  task8: boolean;
}

export interface DiscoveredPort {
  id: number;
  ip: string;
  port: number;
  protocol: string;
  service: string;
  product?: string;
  version?: string;
  state: string;
  priority: 'High' | 'Medium' | 'Low';
  reason?: string;
  purpose?: string;
  risk_explanation?: string;
}

export interface EvidenceItem {
  id: number;
  task_name: string;
  category: string;
  title: string;
  description?: string;
  file_path?: string;
  file_type: string;
  command_run?: string;
  meaning?: string;
  why_it_matters?: string;
  what_next?: string;
  is_simulated_lab: boolean;
  created_at: string;
}

export interface SecurityFinding {
  id: number;
  title: string;
  affected_ip: string;
  affected_port: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
  verification_status: 'Confirmed' | 'Potential weakness' | 'Informational';
  technical_explanation: string;
  impact: string;
  remediation: string;
  task_source: string;
  created_at: string;
}

