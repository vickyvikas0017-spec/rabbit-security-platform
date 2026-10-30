import os
import io
import ftplib
from typing import Dict, Any, List

def run_ftp_security_assessment(
    ip: str, 
    port: int = 21, 
    allow_upload_test: bool = False, 
    instructor_confirmed: bool = False,
    is_local_lab: bool = False
) -> Dict[str, Any]:
    """
    Executes a comprehensive, controlled FTP security assessment adhering to Task 5 criteria.
    Includes anonymous check, directory listing, harmless download validation, and strictly controlled upload validation.
    """
    banner = "Unknown"
    software_version = "Unknown"
    anonymous_status = "Not Tested"
    dir_listing_raw = ""
    files_found: List[str] = []
    download_tested = False
    download_success = False
    upload_tested = False
    upload_allowed = False
    test_file_name = "rabbit_harmless_test.txt"
    log_messages = []

    log_messages.append(f"[*] Starting FTP Security Assessment against {ip}:{port}")
    try:
        ftp = ftplib.FTP()
        ftp.connect(ip, port, timeout=6)
        banner = ftp.getwelcome().strip()
        log_messages.append(f"[+] Service Banner: {banner}")

        # Extract software / version
        if "vsftpd" in banner.lower():
            software_version = "vsftpd"
            parts = banner.split()
            for p in parts:
                if "." in p and any(char.isdigit() for char in p):
                    software_version = f"vsftpd {p}"
                    break
        elif "proftpd" in banner.lower():
            software_version = "ProFTPD"
        elif "pure-ftpd" in banner.lower():
            software_version = "Pure-FTPd"
        elif "microsoft" in banner.lower():
            software_version = "Microsoft IIS FTP Service"
        else:
            software_version = banner[:60]

        # Anonymous access test
        try:
            ftp.login("anonymous", "anonymous@rabbit-assessment.org")
            anonymous_status = "Allowed"
            log_messages.append("[!] VULNERABILITY DETECTED: Anonymous login succeeded (access granted).")

            # Investigate accessible directories and files
            lines = []
            try:
                ftp.retrlines("LIST", lines.append)
                dir_listing_raw = "\n".join(lines)
                for line in lines:
                    parts = line.split()
                    if parts:
                        files_found.append(parts[-1])
                log_messages.append(f"[+] Directory Listing retrieved successfully: {len(files_found)} entries found.")
            except Exception as e_list:
                dir_listing_raw = f"Error during directory listing: {str(e_list)}"
                log_messages.append(f"[-] Directory listing failed: {str(e_list)}")

            # Harmless download test (Step 5)
            # Look for an innocuous file or the test file
            download_tested = True
            target_download_file = None
            for fn in files_found:
                if fn.lower().endswith((".txt", ".md", ".log", ".cfg", ".sample")):
                    target_download_file = fn
                    break
            
            if target_download_file:
                try:
                    sio = io.BytesIO()
                    ftp.retrbinary(f"RETR {target_download_file}", sio.write, maxmult=1024)
                    download_success = True
                    log_messages.append(f"[+] Harmless Download Test PASSED: Read-only access validated on '{target_download_file}' ({sio.tell()} bytes read).")
                except Exception as e_down:
                    download_success = False
                    log_messages.append(f"[-] Harmless Download Test restricted: {e_down}")
            else:
                log_messages.append("[*] No plain text file present in root to test RETR read permissions.")

            # Controlled Upload Test (Step 6)
            # STRICT REQUIREMENT: Only in intentionally vulnerable local lab with instructor permission!
            if allow_upload_test:
                if not is_local_lab or not instructor_confirmed:
                    log_messages.append("[!] BLOCKED: Upload testing is prohibited on non-local or unconfirmed targets.")
                else:
                    upload_tested = True
                    log_messages.append("[*] Performing controlled harmless upload validation (Instructor authorization confirmed in Local Lab)...")
                    try:
                        dummy_content = b"Rabbit Pvt. Ltd. Harmless Audit Verification Marker\r\n"
                        buf = io.BytesIO(dummy_content)
                        ftp.storbinary(f"STOR {test_file_name}", buf)
                        upload_allowed = True
                        log_messages.append(f"[!] CRITICAL MISCONFIGURATION: Upload permission CONFIRMED! '{test_file_name}' was written.")
                        # Clean up test file immediately
                        try:
                            ftp.delete(test_file_name)
                            log_messages.append(f"[+] Audit cleanup: Harmless test file '{test_file_name}' deleted.")
                        except Exception:
                            pass
                    except ftplib.error_perm as e_upload:
                        upload_allowed = False
                        log_messages.append(f"[+] Upload securely denied: Server rejected write attempt ({e_upload}).")
                    except Exception as e_up:
                        upload_allowed = False
                        log_messages.append(f"[-] Upload test error: {e_up}")

            ftp.quit()
        except ftplib.error_perm as e_anon:
            anonymous_status = "Denied"
            log_messages.append(f"[+] Anonymous login securely rejected by server: {e_anon}")
            try:
                ftp.quit()
            except Exception:
                pass

    except Exception as e:
        log_messages.append(f"[-] FTP service assessment error on {ip}:{port}: {str(e)}")
        if "connection refused" in str(e).lower() or "timeout" in str(e).lower():
            return {
                "available": False,
                "banner": "Service unreachable or closed",
                "message": "FTP service was not discovered on the selected target."
            }

    # Generate impact and remediation
    if anonymous_status == "Allowed":
        if upload_allowed:
            observation = "Anonymous read and write access is enabled on the FTP service."
            impact = (
                "An unauthenticated attacker can view, exfiltrate, replace, or upload arbitrary files. "
                "This could allow malicious script uploads, data tampering, or unauthorized storage staging."
            )
            remediation = (
                "Immediately revoke write permissions for anonymous users. Disable anonymous authentication entirely "
                "(e.g., set 'anonymous_enable=NO' in vsftpd.conf). Require authenticated, encrypted SFTP access."
            )
        else:
            observation = "Anonymous read-only access is permitted on the FTP service."
            impact = (
                "Unauthenticated users can browse directory structures and download published documents. "
                "Sensitive business records, backup files, or internal credentials may be exposed to public disclosure."
            )
            remediation = (
                "Disable anonymous access in the FTP server configuration. Enforce strong multi-factor authentication "
                "and ensure directories have strict OS-level permissions."
            )
    else:
        observation = "FTP service responds but rejects unauthenticated anonymous access."
        impact = (
            "Anonymous access is mitigated. However, cleartext transmission of credentials and data remains a risk "
            "if users authenticate over unencrypted FTP (RFC 959) on public networks."
        )
        remediation = (
            "Migrate from cleartext FTP to SFTP (Port 22) or FTPS (FTP over TLS/SSL) with enforced encryption. "
            "Implement strong password policies and brute-force lockout rules."
        )

    return {
        "available": True,
        "banner": banner,
        "software_version": software_version,
        "anonymous_access": anonymous_status,
        "directory_listing": dir_listing_raw,
        "files_found": files_found,
        "download_tested": download_tested,
        "download_success": download_success,
        "upload_tested": upload_tested,
        "upload_allowed": upload_allowed,
        "test_file_name": test_file_name,
        "security_observation": observation,
        "impact": impact,
        "remediation": remediation,
        "audit_log": "\n".join(log_messages)
    }

