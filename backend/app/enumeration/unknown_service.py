import socket
import urllib.request
import urllib.error
import ssl
from typing import Dict, Any

def investigate_unknown_service(ip: str, port: int, probe_type: str = "banner_http_tcp") -> Dict[str, Any]:
    """
    Performs safe investigation of an unfamiliar or non-standard service (e.g. 8080/tcp).
    Safely probes with banner grab, HTTP fallback request, and raw socket exchange without exploits.
    """
    cmd = f"nc -nv {ip} {port} / curl -i http://{ip}:{port}/"
    raw_response = ""
    technology_identified = "Unidentified Service"
    interpretation = ""
    next_recommended_action = ""
    log_lines = [f"[*] Commencing safe investigation of unknown service on {ip}:{port}"]

    # 1. Passive / Gentle Raw Socket Probe
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(3.5)
        s.connect((ip, port))
        
        # Some services output banner immediately upon connection
        s.settimeout(1.5)
        try:
            initial_data = s.recv(1024)
            if initial_data:
                banner_str = initial_data.decode("utf-8", errors="replace").strip()
                log_lines.append(f"[+] Direct connection banner received: {banner_str}")
                raw_response += f"--- Direct Banner ---\n{banner_str}\n\n"
        except socket.timeout:
            pass

        # Send HTTP GET / Request
        http_probe = b"GET / HTTP/1.1\r\nHost: " + ip.encode() + b"\r\nUser-Agent: RabbitUnknownProbe/1.0\r\nConnection: close\r\n\r\n"
        s.settimeout(3.0)
        s.sendall(http_probe)
        http_resp = s.recv(4096)
        s.close()

        if http_resp:
            resp_str = http_resp.decode("utf-8", errors="replace")
            raw_response += f"--- HTTP Probe Response ---\n{resp_str[:1500]}\n"
            log_lines.append(f"[+] Service responded to HTTP probe ({len(http_resp)} bytes).")

            # Analyze HTTP headers & tech
            if "HTTP/" in resp_str:
                technology_identified = "HTTP-based Web Service / Application Gateway"
                if "Server:" in resp_str:
                    for line in resp_str.splitlines():
                        if line.lower().startswith("server:"):
                            technology_identified = f"HTTP Server ({line.split(':', 1)[1].strip()})"
                elif "Tomcat" in resp_str or "Apache-Coyote" in resp_str:
                    technology_identified = "Apache Tomcat Java Servlet Container"
                elif "Node" in resp_str or "Express" in resp_str:
                    technology_identified = "Node.js / Express Web Application"
                elif "Rabbit" in resp_str:
                    technology_identified = "Rabbit Pvt. Ltd. Internal API Service"
    except Exception as e:
        log_lines.append(f"[-] Raw probe encountered error: {str(e)}")

    # Interpretation
    if "HTTP" in technology_identified:
        interpretation = (
            f"The service on port {port} is an HTTP-compatible application endpoint ({technology_identified}). "
            "It responded with HTTP headers indicating a custom web service, administrative interface, or internal API."
        )
        next_recommended_action = (
            "Review API documentation, inspect robots.txt or OpenAPI / Swagger endpoints (/swagger-ui.html, /docs), "
            "verify authentication controls, and assess whether the service should be exposed externally."
        )
    elif raw_response:
        interpretation = (
            f"Service answered with raw textual data. Signature suggests a custom daemon or administrative console. "
            f"Captured banner length: {len(raw_response)} characters."
        )
        next_recommended_action = (
            "Analyze raw packet capture using Wireshark; cross-reference captured banner strings against Nmap nmap-service-probes "
            "database, and evaluate access control lists."
        )
    else:
        interpretation = (
            f"Port {port} did not return an identifiable banner or text response to standard probes. "
            "The service may employ binary protocols, require specific client authentication certificates, or be filtered."
        )
        next_recommended_action = (
            "Execute an advanced Nmap version scan with all probes: nmap -sV --version-all TARGET -p " + str(port)
        )

    return {
        "port": port,
        "protocol": "tcp",
        "initial_identification": "Unfamiliar / Non-standard port",
        "probe_method": "Multi-stage TCP Connection & HTTP Probe",
        "command_run": cmd,
        "raw_response": raw_response if raw_response else "No printable text returned from service probe.",
        "technology_identified": technology_identified,
        "interpretation": interpretation,
        "next_recommended_action": next_recommended_action,
        "log": "\n".join(log_lines)
    }

