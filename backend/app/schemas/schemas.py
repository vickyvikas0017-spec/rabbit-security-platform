from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ProjectBase(BaseModel):
    name: str = "Rabbit Pvt. Ltd. Security Assessment"
    description: str = "Network Discovery, Information Gathering, Enumeration and FTP Security Testing"
    client_name: str = "Rabbit Pvt. Ltd."
    student_name: str = "Student Analyst"
    batch_team: str = "CyberSec Minor Batch A"
    academic_year: str = "2025-2026"

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class TargetBase(BaseModel):
    ip_address: str
    hostname: Optional[str] = None
    domain: Optional[str] = None
    org: Optional[str] = None
    isp: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    selected_reason: Optional[str] = None
    is_active: bool = True
    is_local_lab: bool = False

class TargetCreate(TargetBase):
    project_id: int

class TargetResponse(TargetBase):
    id: int
    project_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class AuthorizationUpdate(BaseModel):
    status: str # Authorized, Pending, Denied
    auth_reference: str
    scope_description: str
    allowed_ports: str = "1-65535"
    testing_restrictions: str = "No DoS, conservative rate limits, read-only testing, no brute force"
    confirmed_by: str
    legal_disclaimer_accepted: bool

class AuthorizationResponse(BaseModel):
    id: int
    target_id: int
    status: str
    auth_reference: Optional[str] = None
    scope_description: Optional[str] = None
    allowed_ports: str
    testing_restrictions: str
    confirmed_by: Optional[str] = None
    confirmed_at: Optional[datetime] = None
    legal_disclaimer_accepted: bool
    class Config:
        from_attributes = True

class ShodanSearchRequest(BaseModel):
    query: str
    api_key: Optional[str] = None

class ShodanResultItem(BaseModel):
    ip_str: str
    hostnames: List[str] = []
    domains: List[str] = []
    org: Optional[str] = None
    isp: Optional[str] = None
    asn: Optional[str] = None
    country_name: Optional[str] = None
    city: Optional[str] = None
    ports: List[int] = []
    banners: List[str] = []
    last_update: Optional[str] = None

class ShodanSearchResponse(BaseModel):
    search_id: int
    query: str
    total_results: int
    results: List[ShodanResultItem]

class TargetSelectRequest(BaseModel):
    ip_str: str
    hostname: Optional[str] = None
    domain: Optional[str] = None
    org: Optional[str] = None
    isp: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    selected_reason: str
    is_local_lab: bool = False

class ScanRequest(BaseModel):
    scan_type: str # basic, full_tcp, service_detect, os_detect
    confirmed: bool = False
    custom_ports: Optional[str] = None

class ScanSessionResponse(BaseModel):
    id: int
    project_id: int
    target_id: int
    scan_type: str
    command: str
    status: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    exit_code: Optional[int] = None
    raw_output: Optional[str] = None
    rationale: Optional[str] = None
    class Config:
        from_attributes = True

class DiscoveredPortItem(BaseModel):
    id: int
    port: int
    protocol: str
    service: str
    product: Optional[str] = None
    version: Optional[str] = None
    state: str
    priority: str
    reason: Optional[str] = None
    purpose: Optional[str] = None
    risk_explanation: Optional[str] = None
    is_verified: bool
    class Config:
        from_attributes = True

class DiscoveredPortUpdate(BaseModel):
    priority: Optional[str] = None
    reason: Optional[str] = None
    risk_explanation: Optional[str] = None

class AttackSurfaceStrategyRequest(BaseModel):
    answer: str

class EnumerationRequest(BaseModel):
    port: int
    service_name: str
    tool_name: str # nmap_nse, curl, whatweb, smbclient, ftplib, snmp, etc.
    custom_options: Optional[str] = None

class EnumerationResponse(BaseModel):
    id: int
    port: int
    service_name: str
    tool_name: str
    command_run: str
    execution_output: str
    interpretation: str
    security_relevance: str
    next_step: str
    is_safe_mode: bool
    timestamp: datetime
    class Config:
        from_attributes = True

class FTPAssessmentRunRequest(BaseModel):
    port: int = 21
    run_controlled_upload_test: bool = False
    instructor_permission_acknowledged: bool = False

class FTPAssessmentResponse(BaseModel):
    id: int
    port: int
    software_version: Optional[str] = None
    banner: Optional[str] = None
    anonymous_access: str
    directory_listing: Optional[str] = None
    files_found: List[str] = []
    download_tested: bool
    download_success: bool
    upload_tested: bool
    upload_allowed: bool
    test_file_name: str
    security_observation: Optional[str] = None
    impact: Optional[str] = None
    remediation: Optional[str] = None
    is_alternative_service: bool
    alternative_service_name: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class StrategyItem(BaseModel):
    port: str
    service_name: str
    priority_rank: int
    why_explanation: str
    first_enumeration_action: str
    suggested_priority: int
    is_scenario_service: bool = True

class StrategySaveRequest(BaseModel):
    items: List[StrategyItem]

class UnknownServiceTestRequest(BaseModel):
    port: int
    probe_type: str = "banner_http_tcp" # banner, http, raw_tcp

class UnknownServiceResponse(BaseModel):
    id: int
    port: int
    protocol: str
    initial_identification: str
    banner_captured: Optional[str] = None
    probe_method: str
    command_run: Optional[str] = None
    raw_response: Optional[str] = None
    technology_identified: Optional[str] = None
    interpretation: Optional[str] = None
    next_recommended_action: Optional[str] = None
    tested_at: datetime
    class Config:
        from_attributes = True

class SecurityFindingCreate(BaseModel):
    title: str
    affected_ip: Optional[str] = None
    affected_port: Optional[str] = None
    severity: str # Critical, High, Medium, Low, Informational
    verification_status: str # Confirmed, Potential weakness, Informational
    technical_explanation: str
    impact: str
    remediation: str
    task_source: str = "General Assessment"

class SecurityFindingResponse(SecurityFindingCreate):
    id: int
    project_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class EvidenceCreate(BaseModel):
    task_name: str
    category: str
    title: str
    description: Optional[str] = None
    file_type: str = "screenshot"
    command_run: Optional[str] = None
    output_summary: Optional[str] = None
    meaning: Optional[str] = None
    why_it_matters: Optional[str] = None
    what_next: Optional[str] = None
    is_simulated_lab: bool = False

class EvidenceResponse(EvidenceCreate):
    id: int
    project_id: int
    file_path: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class ReportRequest(BaseModel):
    student_name: str = "Student Analyst"
    batch_team: str = "CyberSec Minor Batch A"
    academic_year: str = "2025-2026"
    include_simulated_notice: bool = True

class ReportFileResponse(BaseModel):
    docx_url: str
    pdf_url: str
    generated_at: str

class SystemToolStatus(BaseModel):
    nmap_installed: bool
    nmap_path: Optional[str] = None
    shodan_configured: bool
    docker_available: bool
    python_docx_available: bool
    reportlab_available: bool
    storage_writable: bool
    local_lab_running: bool

