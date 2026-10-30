# Rabbit Security Assessment Platform

**Rabbit Pvt. Ltd. – Network Discovery, Information Gathering, Enumeration and FTP Security Testing**  
*Integrated Cybersecurity Assessment Platform for Minor Project Demonstration*

---

## 1. Project Overview

The **Rabbit Security Assessment Platform** is a full-stack cybersecurity audit and demonstration platform developed for college-level practical cybersecurity minor project evaluations. 

All **eight mandatory assessment tasks** are unified into a **single integrated workflow** centered around one primary authorized target:

```
Shodan Target Identification (Task 1)
           ↓
Authorization & Scope Boundaries (Task 1)
           ↓
Nmap Network & Port Discovery (Task 2)
           ↓
Attack Surface Mapping & Triage (Task 3)
           ↓
Protocol-Aware Safe Service Enumeration (Task 4)
           ↓
FTP Security Assessment & Controlled Validation (Task 5)
           ↓
Enumeration Strategy Challenge (Task 6)
           ↓
Unknown Service Investigation (Task 7)
           ↓
Final Mini Security Assessment (Task 8)
           ↓
Centralized Evidence Preservation
           ↓
Automatic 13-Section Report Generation (DOCX & PDF)
```

---

## 2. Technology Stack

* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React icons, Recharts
* **Backend**: Python 3.10+ (tested on Python 3.13), FastAPI, Uvicorn, SQLAlchemy, Pydantic, Subprocess sandboxing
* **Database**: SQLite (persistent storage in `storage/rabbit_security.db`)
* **Security & Network Tools**: Nmap 7.92+, Shodan API client, Python ftplib, Socket banner auditor, HTTP/REST probes
* **Report Engines**: `python-docx` for Word documents (.docx), `ReportLab` for Adobe PDF (.pdf)
* **Laboratory**: Docker Compose stack (`lab/docker-compose.yml`) + native Python fallback lab (`lab/local_lab.py`)

---

## 3. Application Structure & Navigation (13 Sections)

1. **Dashboard**: Executive summary, overall task pipeline progress, ports by protocol, investigation priorities, and quick action launchpads.
2. **Project Overview**: Academic assignment context, editable student metadata, batch/team details, and rules of engagement.
3. **Task 1 – Target Identification**: Official Shodan search query interface, metadata display (IP, Hostname, Org, ISP, Geo, Open Ports, Banners), target selection sheet, and mandatory written scope authorization recording.
4. **Task 2 – Host & Port Discovery**: Real Nmap scanning integration with pre-execution command review, confirmation check, live output, duration timer, XML parsing, and cancellation.
   - Basic Scan: `nmap -sT -Pn --top-ports 1000 -T3 TARGET`
   - Full TCP Scan: `nmap -sT -Pn -p- -T3 TARGET`
   - Service Versioning: `nmap -sV -Pn TARGET`
   - OS Detection: `nmap -O -sV -Pn TARGET`
5. **Task 3 – Attack Surface Mapping**: Tabular matrix (`IP | Port | Protocol | Service | Version | Priority | Reason`), TCP/UDP and Priority filters, analytics charts, and limited-time strategy question.
6. **Task 4 – Service Enumeration**: Deep protocol-aware safe read-only enumeration for FTP (21), SSH (22), SMTP (25), HTTP (80/8080), SMB (445), and SNMP (161).
7. **Task 5 – FTP Security Assessment**: Software/version extraction, anonymous access audit, directory listing inspection, harmless test file download verification, and safety-guarded upload check for local lab only.
8. **Task 6 – Enumeration Strategy**: Standardized scenario analysis (Ports 21, 22, 25, 80, 445, 161) with customizable priority ranking, justification fields, and recommended security order.
9. **Task 7 – Unknown Service Investigation**: Investigation of non-standard ports (e.g. 8080/tcp) using multi-stage TCP socket probes and HTTP requests to identify hidden web gateways.
10. **Task 8 – Final Assessment**: Consolidated findings dashboard (Critical, High, Medium, Low, Informational), verification status distinctions, impact analysis, remediation, and evidence-backed technical conclusion.
11. **Evidence Manager**: Centralized artifact repository tracking Command, Output, Screenshot, "What it means", "Why it matters", and "What was done next".
12. **Final Report Generation**: Automatic generation and export of both DOCX and PDF reports conforming to the exact 13-section academic format.
13. **Settings & Marking Scheme**: 50-mark self-assessment rubric checklist, live system tool diagnostics, and local lab server controls.

---

## 4. Quick Start & Execution

### Windows (PowerShell)

Run the automated one-click launcher:
```powershell
.\run.ps1
```
*The script automatically verifies dependencies, starts the FastAPI server on port 8000, and opens `http://127.0.0.1:8000` in your default browser.*

### Linux / macOS (Bash)

```bash
chmod +x run.sh
./run.sh
```

---

## 5. Manual Step-by-Step Setup

### Step 1: Install Python Dependencies
```bash
python -m pip install -r backend/requirements.txt
```

### Step 2: Build the Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

### Step 3: Start the Backend Service
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
Open your browser and navigate to:
* **Web Application**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
* **Interactive API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 6. Local Laboratory Environment

For testing without an external approved target, the platform provides two options:

### Option A: Native Python Lab (No Docker Required)
In a separate terminal, run:
```bash
python lab/local_lab.py
```
This binds lightweight demonstration services on localhost:
* Port 21: FTP (vsftpd 3.0.3 banner & anonymous responder)
* Port 22: SSH (OpenSSH 8.9p1 banner)
* Port 25: SMTP (ESMTP Postfix banner)
* Port 8080: Unknown REST API Service

### Option B: Docker Compose Lab (Containers)
```bash
cd lab
docker compose up -d
```

---

## 7. Report Generation (Exact 13-Section Format)

Reports generated by the platform adhere to the academic structure specified in the project PDF:

1. **Cover Page**: RABBIT PVT. LTD. Minor Project Assessment details
2. **Target and Scope**: IP, scope boundaries, authorization reference, testing restrictions
3. **Shodan Target Discovery Evidence**: Reconnaissance metadata & justification
4. **Methodology**: Five-phase defensive assessment lifecycle
5. **Nmap Scanning**: Basic, Full TCP, Service versioning, and OS detection scan logs
6. **Attack Surface Table**: Port, Protocol, Service, Version, Priority, Reason
7. **Service Enumeration**: Safe read-only protocol evaluations
8. **FTP Assessment / Alternative Service Assessment**: Anonymous access, directory listings, harmless download validation
9. **Strategy Questions**: Triage justification and technical explanations
10. **Findings and Evidence**: Verified security weaknesses classified by severity
11. **Impact**: Business and network security implications
12. **Remediation**: Step-by-step mitigation instructions
13. **Conclusion**: Final security evaluation and defensive recommendations

Downloads available from the platform:
* **Download DOCX**: Fully styled Word document with tables and cover page.
* **Download PDF**: Formatted Adobe PDF report via ReportLab.
* **Download Raw Scans ZIP**: Archive of all original Nmap XML and console outputs.

---

## 8. Academic Marking Scheme (50 Marks)

| Assessment Area | Marks |
|---|---:|
| Target identification, scope and authorization reasoning | 5 |
| Network/port scanning and interpretation | 10 |
| Service enumeration and attack-surface mapping | 10 |
| FTP assessment / alternative service assessment | 8 |
| Strategy and prioritization | 7 |
| Evidence and technical reasoning | 5 |
| Report quality and presentation | 5 |
| **TOTAL** | **50** |

*Access the live self-assessment checklist under the **Settings & Marking** section inside the application.*

---

## 9. Security & Ethical Development Compliance

* **Single Host Scope**: Strictly rejects CIDR blocks, ranges, and target lists.
* **Command Injection Prevention**: Process invocation uses array argument lists (`subprocess.Popen(args, ...)`), never raw `shell=True`.
* **Safe Enumeration Only**: Zero brute force, zero credential stuffing, zero exploit delivery, and zero denial-of-service tests.
* **Controlled Write Guard**: Write/upload testing in Task 5 is disabled by default and requires explicit instructor authorization strictly in local lab mode.

