import os
import re
import sys
import time
import shutil
import subprocess
import threading
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Dict, Any, Optional, List, Tuple

# Process tracker for cancellation
RUNNING_PROCESSES: Dict[int, subprocess.Popen] = {}
PROCESS_LOCK = threading.Lock()

def find_nmap_path() -> Optional[str]:
    # Check common Windows paths
    custom_paths = [
        r"C:\Users\VIKAS VICKY\AppData\Local\Programs\nmap\nmap.exe",
        r"C:\Program Files (x86)\Nmap\nmap.exe",
        r"C:\Program Files\Nmap\nmap.exe",
    ]
    for p in custom_paths:
        if os.path.exists(p):
            return p
    
    # Check system PATH
    found = shutil.which("nmap")
    if found:
        return found
    return None

def validate_target(target: str) -> bool:
    """Validate target is a single IP address or clean domain name without injection or CIDR."""
    # Block CIDR ranges, commas, multiple targets, shell characters
    if "/" in target or ";" in target or "&" in target or "|" in target or " " in target or "`" in target or "$" in target:
        return False
    # Validate IPv4
    ipv4_pattern = r"^(\d{1,3}\.){3}\d{1,3}$"
    if re.match(ipv4_pattern, target):
        parts = target.split(".")
        return all(0 <= int(p) <= 255 for p in parts)
    # Validate Hostname/Domain
    domain_pattern = r"^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63})*$"
    return bool(re.match(domain_pattern, target))

def build_nmap_command(scan_type: str, target: str, nmap_bin: str, xml_path: str) -> Tuple[List[str], str, str]:
    """
    Returns (cmd_args_list, full_command_str, rationale)
    Strictly adheres to required prompt commands:
    Basic: nmap -sT -Pn --top-ports 1000 -T3 TARGET
    Full TCP: nmap -sT -Pn -p- -T3 TARGET
    Service: nmap -sV -Pn TARGET
    OS: nmap -O -sV -Pn TARGET
    """
    if not validate_target(target):
        raise ValueError(f"Invalid target specification: {target}. Must be a single IP address or hostname without range/CIDR.")

    if scan_type == "basic":
        args = [nmap_bin, "-sT", "-Pn", "--top-ports", "1000", "-T3", target, "-oX", xml_path]
        cmd_str = f"nmap -sT -Pn --top-ports 1000 -T3 {target}"
        rationale = "Performs a standard TCP Connect (-sT) scan across the top 1,000 most prevalent ports without ICMP ping (-Pn) at normal timing (-T3). Safe, conservative, and does not require administrator privileges."
    elif scan_type == "full_tcp":
        args = [nmap_bin, "-sT", "-Pn", "-p-", "-T3", target, "-oX", xml_path]
        cmd_str = f"nmap -sT -Pn -p- -T3 {target}"
        rationale = "Comprehensive TCP Connect scan probing all 65,535 ports (-p-) to detect non-standard listening services and hidden administration ports."
    elif scan_type == "service_detect":
        args = [nmap_bin, "-sV", "-Pn", target, "-oX", xml_path]
        cmd_str = f"nmap -sV -Pn {target}"
        rationale = "Probes open ports using Nmap service detection database (-sV) to determine application banners, software vendor, and exact version numbers for vulnerability correlation."
    elif scan_type == "os_detect":
        args = [nmap_bin, "-O", "-sV", "-Pn", target, "-oX", xml_path]
        cmd_str = f"nmap -O -sV -Pn {target}"
        rationale = "Enables TCP/IP fingerprinting (-O) and service versioning (-sV) to infer operating system family, kernel release, and hardware architecture. Note: OS detection requires raw socket privileges."
    else:
        raise ValueError(f"Unknown scan type: {scan_type}")

    return args, cmd_str, rationale

def parse_nmap_xml(xml_content: str) -> List[Dict[str, Any]]:
    """Parse Nmap XML output into structured port and service objects."""
    results = []
    if not xml_content or not xml_content.strip():
        return results

    try:
        root = ET.fromstring(xml_content)
        for host in root.findall("host"):
            ports_elem = host.find("ports")
            if ports_elem is not None:
                for port_elem in ports_elem.findall("port"):
                    port_id = int(port_elem.get("portid", 0))
                    protocol = port_elem.get("protocol", "tcp")
                    
                    state_elem = port_elem.find("state")
                    state = state_elem.get("state", "unknown") if state_elem is not None else "unknown"

                    service_elem = port_elem.find("service")
                    service_name = service_elem.get("name", "unknown") if service_elem is not None else "unknown"
                    product = service_elem.get("product", "") if service_elem is not None else ""
                    version = service_elem.get("version", "") if service_elem is not None else ""
                    extrainfo = service_elem.get("extrainfo", "") if service_elem is not None else ""

                    cpe_elem = service_elem.find("cpe") if service_elem is not None else None
                    cpe = cpe_elem.text if cpe_elem is not None else ""

                    # Default priority & analysis logic
                    priority = "Medium"
                    reason = "Standard network service requiring baseline security validation."
                    purpose = "General network application"

                    if port_id == 21 or service_name == "ftp":
                        priority = "High"
                        reason = "Cleartext credential risk and unauthenticated anonymous access exposure."
                        purpose = "File Transfer Protocol (FTP)"
                    elif port_id == 445 or service_name in ["microsoft-ds", "netbios-ssn", "smb"]:
                        priority = "High"
                        reason = "High exploitability, share enumeration, anonymous guest access."
                        purpose = "Server Message Block (SMB) File Sharing"
                    elif port_id in [80, 8080, 443] or "http" in service_name:
                        priority = "High"
                        reason = "Primary web attack surface; headers, endpoints, and server banners."
                        purpose = "HyperText Transfer Protocol (HTTP/Web)"
                    elif port_id == 161 or "snmp" in service_name:
                        priority = "High"
                        reason = "Default community strings (public/private) disclose system metrics."
                        purpose = "Simple Network Management Protocol"
                    elif port_id == 22 or service_name == "ssh":
                        priority = "Medium"
                        reason = "Encrypted shell; inspect protocol version and host key algorithms."
                        purpose = "Secure Shell (SSH) Remote Administration"
                    elif port_id == 25 or service_name == "smtp":
                        priority = "Medium"
                        reason = "Mail transfer; inspect mail banner and open relay commands."
                        purpose = "Simple Mail Transfer Protocol"
                    else:
                        priority = "Low" if state == "open" else "Low"

                    results.append({
                        "port": port_id,
                        "protocol": protocol,
                        "state": state,
                        "service_name": service_name,
                        "product": product,
                        "version": version,
                        "extra_info": extrainfo,
                        "cpe": cpe,
                        "priority": priority,
                        "reason": reason,
                        "purpose": purpose
                    })
    except Exception as e:
        print(f"Error parsing Nmap XML: {e}")
    return results

def cancel_scan(session_id: int) -> bool:
    with PROCESS_LOCK:
        proc = RUNNING_PROCESSES.get(session_id)
        if proc:
            try:
                proc.terminate()
                time.sleep(0.5)
                if proc.poll() is None:
                    proc.kill()
                del RUNNING_PROCESSES[session_id]
                return True
            except Exception:
                return False
    return False

