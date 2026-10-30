import os
import re
import ftplib
import socket
import urllib.request
import urllib.error
import ssl
from typing import Dict, Any, Optional

def safe_grab_banner(ip: str, port: int, timeout: float = 3.0, probe_str: Optional[bytes] = None) -> str:
    """Safely grab an application service banner using a raw TCP socket connection."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(timeout)
        s.connect((ip, port))
        if probe_str:
            s.sendall(probe_str)
        data = s.recv(2048)
        s.close()
        return data.decode("utf-8", errors="replace").strip()
    except Exception as e:
        return f"Connection response/error: {str(e)}"

def enumerate_ftp(ip: str, port: int = 21) -> Dict[str, Any]:
    cmd = f"ftp {ip} {port} (automated safe read-only audit)"
    banner = ""
    anon_status = "Denied"
    file_list = []
    output_lines = []

    try:
        ftp = ftplib.FTP()
        ftp.connect(ip, port, timeout=5)
        banner = ftp.getwelcome()
        output_lines.append(f"[+] Connected to FTP service on {ip}:{port}")
        output_lines.append(f"[+] Banner received: {banner}")

        try:
            ftp.login("anonymous", "anonymous@rabbit-assessment.local")
            anon_status = "Allowed"
            output_lines.append("[!] VULNERABILITY: Anonymous login is ALLOWED without credentials!")
            
            try:
                lines = []
                ftp.retrlines("LIST", lines.append)
                file_list = lines
                output_lines.append(f"[+] Directory Listing retrieved ({len(lines)} items):")
                for line in lines[:10]:
                    output_lines.append(f"    {line}")
                if len(lines) > 10:
                    output_lines.append(f"    ... and {len(lines) - 10} more files.")
            except Exception as e_list:
                output_lines.append(f"[-] Could not list directory contents: {e_list}")

            ftp.quit()
        except ftplib.error_perm as e_perm:
            anon_status = "Denied"
            output_lines.append(f"[-] Anonymous login rejected: {e_perm}")
            try:
                ftp.quit()
            except Exception:
                pass
    except Exception as e:
        output_lines.append(f"[-] FTP connection failed on {ip}:{port} - {str(e)}")
        banner = f"Service unreachable: {str(e)}"

    output_str = "\n".join(output_lines)
    interpretation = (
        f"Target responds on port {port} with FTP banner '{banner}'. "
        + ("Anonymous access is enabled, permitting unauthenticated access to files." if anon_status == "Allowed"
           else "Anonymous access is properly restricted or disabled.")
    )
    security_relevance = (
        "FTP transmits credentials and payload data in unencrypted plaintext. "
        "Allowing anonymous access risks sensitive data exposure and potential reconnaissance."
    )
    next_step = (
        "Disable anonymous login if enabled; migrate configuration to SFTP (SSH File Transfer Protocol) "
        "or FTPS with strong TLS encryption and explicit access controls."
    )

    return {
        "command": cmd,
        "tool": "Python ftplib (Safe Read-Only)",
        "output": output_str,
        "banner": banner,
        "anonymous_status": anon_status,
        "files": file_list,
        "interpretation": interpretation,
        "security_relevance": security_relevance,
        "next_step": next_step
    }

def enumerate_ssh(ip: str, port: int = 22) -> Dict[str, Any]:
    cmd = f"nc -nv {ip} {port} / safe banner grab"
    banner = safe_grab_banner(ip, port)
    output_lines = [
        f"[+] Connecting to SSH on {ip}:{port}",
        f"[+] Raw identification banner: {banner}",
    ]
    is_ssh2 = "SSH-2.0" in banner
    if is_ssh2:
        output_lines.append("[+] Protocol SSHv2 detected (RFC 4253 compliant).")
    elif "SSH-1" in banner:
        output_lines.append("[!] DEPRECATED: Legacy SSHv1 protocol detected (cryptographically vulnerable).")

    software = banner.replace("SSH-2.0-", "").strip() if "SSH-2.0-" in banner else banner

    interpretation = f"SSH service identified on port {port}. Remote version identifier: {banner}."
    security_relevance = (
        "SSH provides encrypted remote management. Banner disclosure exposes the exact OS and OpenSSH build version, "
        "enabling an attacker to look up known CVEs."
    )
    next_step = (
        "Ensure SSH Protocol 2 is strictly enforced. Enforce public-key authentication, disable root password login, "
        "and configure Fail2ban or rate-limiting against automated brute-force attempts."
    )

    return {
        "command": cmd,
        "tool": "Netcat / Raw Socket (Safe Banner Audit)",
        "output": "\n".join(output_lines),
        "software": software,
        "interpretation": interpretation,
        "security_relevance": security_relevance,
        "next_step": next_step
    }

def enumerate_smtp(ip: str, port: int = 25) -> Dict[str, Any]:
    cmd = f"nc -nv {ip} {port} & EHLO rabbit.local"
    banner = ""
    ehlo_resp = ""
    output_lines = []

    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(5.0)
        s.connect((ip, port))
        banner = s.recv(1024).decode("utf-8", errors="replace").strip()
        output_lines.append(f"[+] Connected to SMTP on {ip}:{port}")
        output_lines.append(f"[+] Initial 220 Banner: {banner}")

        # Send safe EHLO
        s.sendall(b"EHLO rabbit.assessment.local\r\n")
        ehlo_resp = s.recv(2048).decode("utf-8", errors="replace").strip()
        output_lines.append("[+] Sent: EHLO rabbit.assessment.local")
        output_lines.append(f"[+] EHLO Capabilities Response:\n{ehlo_resp}")
        
        # Send safe QUIT
        s.sendall(b"QUIT\r\n")
        s.close()
    except Exception as e:
        output_lines.append(f"[-] SMTP communication error: {str(e)}")

    interpretation = f"SMTP service active on port {port}. Server greeting: '{banner}'."
    security_relevance = (
        "Misconfigured mail servers can be leveraged as open relays for spam distribution, "
        "user enumeration via VRFY/EXPN, or cleartext mail interception without STARTTLS."
    )
    next_step = (
        "Verify that STARTTLS is enforced, open relay is disabled for external addresses, "
        "and VRFY/EXPN commands are restricted."
    )

    return {
        "command": cmd,
        "tool": "SMTP Client / Socket (Safe EHLO Audit)",
        "output": "\n".join(output_lines),
        "banner": banner,
        "interpretation": interpretation,
        "security_relevance": security_relevance,
        "next_step": next_step
    }

def enumerate_http(ip: str, port: int = 80) -> Dict[str, Any]:
    scheme = "https" if port == 443 else "http"
    url = f"{scheme}://{ip}:{port}/"
    cmd = f"curl -i -s -k {url}"
    output_lines = [f"[+] Executing safe HTTP enumeration on {url}"]

    headers_dict = {}
    title = "Unknown"
    server = "Not Disclosed"

    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        req = urllib.request.Request(url, headers={"User-Agent": "RabbitSec-Assessment-Auditor/1.0"})
        with urllib.request.urlopen(req, timeout=5, context=ctx) as response:
            status_code = response.getcode()
            output_lines.append(f"[+] HTTP Status: {status_code}")
            headers = response.info()
            for k, v in headers.items():
                headers_dict[k] = v
                output_lines.append(f"    {k}: {v}")
                if k.lower() == "server":
                    server = v

            body = response.read(4096).decode("utf-8", errors="replace")
            m = re.search(r"<title>(.*?)</title>", body, re.IGNORECASE | re.DOTALL)
            if m:
                title = m.group(1).strip()
                output_lines.append(f"[+] HTML Page Title: {title}")
    except urllib.error.HTTPError as e:
        output_lines.append(f"[+] HTTP Response Code: {e.code} ({e.reason})")
        for k, v in e.headers.items():
            headers_dict[k] = v
            output_lines.append(f"    {k}: {v}")
    except Exception as e:
        output_lines.append(f"[-] HTTP connection failed: {str(e)}")

    # Check common security headers
    sec_headers = ["Strict-Transport-Security", "X-Content-Type-Options", "X-Frame-Options", "Content-Security-Policy"]
    missing_headers = [h for h in sec_headers if not any(k.lower() == h.lower() for k in headers_dict.keys())]
    if missing_headers:
        output_lines.append(f"[!] Security Alert: Missing recommended defensive headers: {', '.join(missing_headers)}")

    interpretation = f"Web application active on port {port}. Server signature: '{server}', Page title: '{title}'."
    security_relevance = (
        "Web servers represent a prominent attack surface. Missing security headers allow clickjacking "
        "and MIME-sniffing, while server header disclosure assists targeted software vulnerability research."
    )
    next_step = (
        "Implement missing defensive headers (Content-Security-Policy, HSTS, X-Frame-Options), "
        "disable verbose Server banner disclosure, and restrict administrative directories."
    )

    return {
        "command": cmd,
        "tool": "cURL / Safe HTTP Header Inspector",
        "output": "\n".join(output_lines),
        "server": server,
        "title": title,
        "headers": headers_dict,
        "interpretation": interpretation,
        "security_relevance": security_relevance,
        "next_step": next_step
    }

def enumerate_smb(ip: str, port: int = 445) -> Dict[str, Any]:
    cmd = f"smbclient -L //{ip} -N (safe read-only null session probe)"
    output_lines = [
        f"[+] Probing SMB service on {ip}:{port}",
        "[*] Attempting anonymous IPC$ / NULL session negotiation...",
    ]

    # Attempt a safe socket connection to test SMB handshake response
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(4.0)
        s.connect((ip, port))
        # SMB Negotiate Protocol Request (Harmless probe)
        smb_negotiate_pkt = b"\x00\x00\x00\x45\xff\x53\x4d\x42\x72\x00\x00\x00\x00\x18\x53\xc8\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xff\xfe\xfe\x00\x00\x00\x00\x00\x22\x00\x02\x4e\x54\x20\x4c\x4d\x20\x30\x2e\x31\x32\x00\x02\x53\x4d\x42\x20\x32\x2e\x30\x30\x32\x00\x02\x53\x4d\x42\x20\x32\x2e\x3f\x3f\x3f\x00"
        s.sendall(smb_negotiate_pkt)
        resp = s.recv(1024)
        s.close()
        if resp and len(resp) > 4 and resp[4:8] == b"\xffSMB":
            output_lines.append("[+] SMBv1 / CIFS protocol responded to negotiate probe.")
        elif resp and len(resp) > 4 and resp[4:8] == b"\xfeSMB":
            output_lines.append("[+] Modern SMBv2 / SMBv3 protocol dialect negotiated successfully.")
        else:
            output_lines.append(f"[+] SMB service answered probe ({len(resp)} bytes received).")
    except Exception as e:
        output_lines.append(f"[-] SMB connection note: {str(e)}")

    interpretation = f"SMB service identified on port {port}. Remote file and resource sharing protocol."
    security_relevance = (
        "SMB is a critical enterprise protocol. Unauthenticated guest or null session access can leak "
        "share paths, system usernames, and configuration files, leading to lateral movement."
    )
    next_step = (
        "Disable SMBv1 legacy protocol; enforce SMB message signing (SMB Signing = Required); "
        "and restrict network access to port 445 via firewall rules to authorized administrative subnets."
    )

    return {
        "command": cmd,
        "tool": "SMBclient / Safe SMB Protocol Prober",
        "output": "\n".join(output_lines),
        "interpretation": interpretation,
        "security_relevance": security_relevance,
        "next_step": next_step
    }

def enumerate_snmp(ip: str, port: int = 161) -> Dict[str, Any]:
    cmd = f"snmpwalk -v2c -c public {ip} system (safe read-only community audit)"
    output_lines = [
        f"[+] Auditing SNMP on UDP/{ip}:{port}",
        "[*] Probing default community string 'public' against OID 1.3.6.1.2.1.1.1.0 (sysDescr)...",
    ]

    try:
        # Construct SNMPv2c GET request packet for sysDescr (OID 1.3.6.1.2.1.1.1.0) with community "public"
        # 30: Sequence, len 41; 02: int (version 1 = v2c); 04: string (public); a0: GetRequest-PDU
        snmp_packet = bytes.fromhex(
            "302602010104067075626c6963a019020412345678020100020100300b300906052b060102010500"
        )
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(3.0)
        s.sendto(snmp_packet, (ip, port))
        resp, _ = s.recvfrom(2048)
        s.close()
        output_lines.append(f"[!] ALERT: SNMP service responded to community string 'public'! ({len(resp)} bytes)")
        output_lines.append("[!] Information disclosure risk: System metrics accessible without authentication.")
    except socket.timeout:
        output_lines.append("[-] SNMP probe timed out (service may be filtered, closed, or community 'public' rejected).")
    except Exception as e:
        output_lines.append(f"[-] SNMP probe error: {str(e)}")

    interpretation = f"SNMP service evaluation on UDP port {port}."
    security_relevance = (
        "SNMP allows network devices to be monitored and managed. Exposing SNMP with default community strings "
        "('public' or 'private') reveals complete system hardware, network interfaces, process lists, and routing tables."
    )
    next_step = (
        "Upgrade from SNMPv1/v2c to SNMPv3 with cryptographic authentication (SHA) and privacy encryption (AES). "
        "Disable community string 'public' and isolate UDP port 161 behind management firewalls."
    )

    return {
        "command": cmd,
        "tool": "SNMPsafe / UDP SNMP Audit Prober",
        "output": "\n".join(output_lines),
        "interpretation": interpretation,
        "security_relevance": security_relevance,
        "next_step": next_step
    }

