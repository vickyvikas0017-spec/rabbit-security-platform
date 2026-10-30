import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from ..database.connection import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), default="Rabbit Pvt. Ltd. Security Assessment")
    description = Column(Text, default="Network Discovery, Information Gathering, Enumeration and FTP Security Testing")
    client_name = Column(String(255), default="Rabbit Pvt. Ltd.")
    student_name = Column(String(255), default="Student Analyst")
    batch_team = Column(String(255), default="CyberSec Minor Batch A")
    academic_year = Column(String(50), default="2025-2026")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    targets = relationship("Target", back_populates="project", cascade="all, delete-orphan")
    shodan_searches = relationship("ShodanSearch", back_populates="project", cascade="all, delete-orphan")
    scan_sessions = relationship("ScanSession", back_populates="project", cascade="all, delete-orphan")
    discovered_ports = relationship("DiscoveredPort", back_populates="project", cascade="all, delete-orphan")
    enumerations = relationship("Enumeration", back_populates="project", cascade="all, delete-orphan")
    ftp_assessments = relationship("FTPAssessment", back_populates="project", cascade="all, delete-orphan")
    strategy_answers = relationship("StrategyAnswer", back_populates="project", cascade="all, delete-orphan")
    unknown_service_tests = relationship("UnknownServiceTest", back_populates="project", cascade="all, delete-orphan")
    security_findings = relationship("SecurityFinding", back_populates="project", cascade="all, delete-orphan")
    evidence_items = relationship("Evidence", back_populates="project", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="project", cascade="all, delete-orphan")


class Target(Base):
    __tablename__ = "targets"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    ip_address = Column(String(100), nullable=False)
    hostname = Column(String(255), nullable=True)
    domain = Column(String(255), nullable=True)
    org = Column(String(255), nullable=True)
    isp = Column(String(255), nullable=True)
    country = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    selected_reason = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    is_local_lab = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="targets")
    authorization = relationship("AuthorizationRecord", back_populates="target", uselist=False, cascade="all, delete-orphan")
    scan_sessions = relationship("ScanSession", back_populates="target", cascade="all, delete-orphan")
    discovered_ports = relationship("DiscoveredPort", back_populates="target", cascade="all, delete-orphan")
    services = relationship("Service", back_populates="target", cascade="all, delete-orphan")
    enumerations = relationship("Enumeration", back_populates="target", cascade="all, delete-orphan")
    ftp_assessments = relationship("FTPAssessment", back_populates="target", cascade="all, delete-orphan")
    unknown_service_tests = relationship("UnknownServiceTest", back_populates="target", cascade="all, delete-orphan")
    security_findings = relationship("SecurityFinding", back_populates="target", cascade="all, delete-orphan")


class AuthorizationRecord(Base):
    __tablename__ = "authorization_records"

    id = Column(Integer, primary_key=True, index=True)
    target_id = Column(Integer, ForeignKey("targets.id"), nullable=False, unique=True)
    status = Column(String(50), default="Pending") # Authorized, Pending, Denied
    auth_reference = Column(String(255), nullable=True) # e.g. "RABBIT-AUTH-2026-LAB-01"
    scope_description = Column(Text, nullable=True) # Scope boundaries
    allowed_ports = Column(String(255), default="1-65535")
    testing_restrictions = Column(Text, default="No DoS, conservative rate limits, read-only testing, no brute force")
    confirmed_by = Column(String(100), nullable=True)
    confirmed_at = Column(DateTime, nullable=True)
    legal_disclaimer_accepted = Column(Boolean, default=False)

    target = relationship("Target", back_populates="authorization")


class ShodanSearch(Base):
    __tablename__ = "shodan_searches"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    query = Column(String(255), nullable=False)
    total_results = Column(Integer, default=0)
    search_timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="shodan_searches")
    results = relationship("ShodanResult", back_populates="search", cascade="all, delete-orphan")


class ShodanResult(Base):
    __tablename__ = "shodan_results"

    id = Column(Integer, primary_key=True, index=True)
    search_id = Column(Integer, ForeignKey("shodan_searches.id"), nullable=False)
    ip_str = Column(String(100), nullable=False)
    hostnames_json = Column(Text, default="[]")
    domains_json = Column(Text, default="[]")
    org = Column(String(255), nullable=True)
    isp = Column(String(255), nullable=True)
    asn = Column(String(100), nullable=True)
    country_name = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    ports_json = Column(Text, default="[]")
    banners_json = Column(Text, default="[]")
    last_update = Column(String(100), nullable=True)
    raw_json = Column(Text, nullable=True)
    is_selected = Column(Boolean, default=False)

    search = relationship("ShodanSearch", back_populates="results")


class ScanSession(Base):
    __tablename__ = "scan_sessions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    target_id = Column(Integer, ForeignKey("targets.id"), nullable=False)
    scan_type = Column(String(50), nullable=False) # basic, full_tcp, service_detect, os_detect
    command = Column(String(500), nullable=False)
    status = Column(String(50), default="pending") # pending, running, completed, failed, cancelled
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    duration_seconds = Column(Float, nullable=True)
    exit_code = Column(Integer, nullable=True)
    raw_output = Column(Text, nullable=True)
    xml_output = Column(Text, nullable=True)
    rationale = Column(Text, nullable=True)

    project = relationship("Project", back_populates="scan_sessions")
    target = relationship("Target", back_populates="scan_sessions")
    scan_results = relationship("ScanResult", back_populates="session", cascade="all, delete-orphan")


class ScanResult(Base):
    __tablename__ = "scan_results"

    id = Column(Integer, primary_key=True, index=True)
    scan_session_id = Column(Integer, ForeignKey("scan_sessions.id"), nullable=False)
    port = Column(Integer, nullable=False)
    protocol = Column(String(20), default="tcp")
    state = Column(String(50), default="open") # open, filtered, closed
    service_name = Column(String(100), nullable=True)
    product = Column(String(255), nullable=True)
    version = Column(String(100), nullable=True)
    extra_info = Column(String(255), nullable=True)
    cpe = Column(String(255), nullable=True)
    os_match = Column(String(255), nullable=True)
    confidence = Column(Integer, nullable=True)

    session = relationship("ScanSession", back_populates="scan_results")


class DiscoveredPort(Base):
    __tablename__ = "discovered_ports"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    target_id = Column(Integer, ForeignKey("targets.id"), nullable=False)
    port = Column(Integer, nullable=False)
    protocol = Column(String(20), default="tcp")
    service = Column(String(100), nullable=False)
    product = Column(String(255), nullable=True)
    version = Column(String(100), nullable=True)
    state = Column(String(50), default="open")
    priority = Column(String(20), default="Medium") # High, Medium, Low
    reason = Column(Text, nullable=True) # Why port matters
    purpose = Column(Text, nullable=True) # Standard port purpose
    risk_explanation = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=False)
    discovered_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="discovered_ports")
    target = relationship("Target", back_populates="discovered_ports")


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    target_id = Column(Integer, ForeignKey("targets.id"), nullable=False)
    port = Column(Integer, nullable=False)
    protocol = Column(String(20), default="tcp")
    service_name = Column(String(100), nullable=False)
    banner = Column(Text, nullable=True)
    software_version = Column(String(255), nullable=True)
    status = Column(String(50), default="active")

    target = relationship("Target", back_populates="services")


class Enumeration(Base):
    __tablename__ = "enumerations"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    target_id = Column(Integer, ForeignKey("targets.id"), nullable=False)
    port = Column(Integer, nullable=False)
    service_name = Column(String(100), nullable=False)
    tool_name = Column(String(100), nullable=False)
    command_run = Column(String(500), nullable=False)
    execution_output = Column(Text, nullable=True)
    interpretation = Column(Text, nullable=True)
    security_relevance = Column(Text, nullable=True)
    next_step = Column(Text, nullable=True)
    is_safe_mode = Column(Boolean, default=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="enumerations")
    target = relationship("Target", back_populates="enumerations")


class FTPAssessment(Base):
    __tablename__ = "ftp_assessments"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    target_id = Column(Integer, ForeignKey("targets.id"), nullable=False)
    port = Column(Integer, default=21)
    software_version = Column(String(255), nullable=True)
    banner = Column(Text, nullable=True)
    anonymous_access = Column(String(50), default="Not Tested") # Allowed, Denied, Error, Not Applicable
    directory_listing = Column(Text, nullable=True)
    files_found_json = Column(Text, default="[]")
    download_tested = Column(Boolean, default=False)
    download_success = Column(Boolean, default=False)
    upload_tested = Column(Boolean, default=False)
    upload_allowed = Column(Boolean, default=False)
    test_file_name = Column(String(100), default="rabbit_harmless_test.txt")
    security_observation = Column(Text, nullable=True)
    impact = Column(Text, nullable=True)
    remediation = Column(Text, nullable=True)
    is_alternative_service = Column(Boolean, default=False)
    alternative_service_name = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="ftp_assessments")
    target = relationship("Target", back_populates="ftp_assessments")


class StrategyAnswer(Base):
    __tablename__ = "strategy_answers"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    port = Column(String(50), nullable=False) # e.g. "21", "22", "161/UDP"
    service_name = Column(String(100), nullable=False)
    priority_rank = Column(Integer, nullable=False) # 1 to 6
    why_explanation = Column(Text, nullable=True)
    first_enumeration_action = Column(Text, nullable=True)
    suggested_priority = Column(Integer, nullable=True)
    is_scenario_service = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="strategy_answers")


class UnknownServiceTest(Base):
    __tablename__ = "unknown_service_tests"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    target_id = Column(Integer, ForeignKey("targets.id"), nullable=False)
    port = Column(Integer, nullable=False)
    protocol = Column(String(20), default="tcp")
    initial_identification = Column(String(255), default="Unknown / Non-standard service")
    banner_captured = Column(Text, nullable=True)
    probe_method = Column(String(100), default="Safe Banner Grab & Protocol Probe")
    command_run = Column(String(500), nullable=True)
    raw_response = Column(Text, nullable=True)
    technology_identified = Column(String(255), nullable=True)
    interpretation = Column(Text, nullable=True)
    next_recommended_action = Column(Text, nullable=True)
    tested_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="unknown_service_tests")
    target = relationship("Target", back_populates="unknown_service_tests")


class SecurityFinding(Base):
    __tablename__ = "security_findings"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    target_id = Column(Integer, ForeignKey("targets.id"), nullable=True)
    title = Column(String(255), nullable=False)
    affected_ip = Column(String(100), nullable=True)
    affected_port = Column(String(50), nullable=True)
    severity = Column(String(20), default="Medium") # Critical, High, Medium, Low, Informational
    verification_status = Column(String(50), default="Potential weakness") # Confirmed, Potential weakness, Informational
    technical_explanation = Column(Text, nullable=False)
    impact = Column(Text, nullable=False)
    remediation = Column(Text, nullable=False)
    evidence_ids_json = Column(Text, default="[]")
    task_source = Column(String(100), default="General Assessment")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="security_findings")
    target = relationship("Target", back_populates="security_findings")


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    task_name = Column(String(100), nullable=False) # Task 1, Task 2, etc.
    category = Column(String(100), nullable=False) # Target identification, Port scanning, etc.
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    file_path = Column(String(500), nullable=True) # relative path in storage/evidence
    file_type = Column(String(50), default="screenshot") # screenshot, terminal_log, xml, text, report
    command_run = Column(String(500), nullable=True)
    output_summary = Column(Text, nullable=True)
    meaning = Column(Text, nullable=True) # "What it means"
    why_it_matters = Column(Text, nullable=True) # "Why it matters"
    what_next = Column(Text, nullable=True) # "What was done next"
    is_simulated_lab = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="evidence_items")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    report_type = Column(String(20), nullable=False) # docx, pdf
    file_path = Column(String(500), nullable=False)
    filename = Column(String(255), nullable=False)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
    section_count = Column(Integer, default=13)
    student_name = Column(String(255), nullable=True)
    batch_team = Column(String(255), nullable=True)

    project = relationship("Project", back_populates="reports")

