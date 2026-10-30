"""
Rabbit Security Assessment Platform - Standalone Local Laboratory Server
Enables students to run isolated safe mock target services locally on Windows/Linux without Docker.
Binds to localhost (127.0.0.1) only.
"""

import socket
import threading
import sys
import os
import time

def run_mock_banner_server(port: int, banner: bytes, service_name: str):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind(("127.0.0.1", port))
        s.listen(5)
        print(f"[+] Lab {service_name} listening on 127.0.0.1:{port}")
        while True:
            conn, addr = s.accept()
            try:
                conn.sendall(banner)
                conn.settimeout(2.0)
                data = conn.recv(1024)
                if b"QUIT" in data or b"exit" in data:
                    conn.sendall(b"221 Goodbye.\r\n")
            except Exception:
                pass
            finally:
                conn.close()
    except Exception as e:
        print(f"[-] Could not bind {service_name} to 127.0.0.1:{port} ({e})")

def run_mock_http_server(port: int = 8080):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind(("127.0.0.1", port))
        s.listen(5)
        print(f"[+] Lab HTTP/API Unknown Service listening on 127.0.0.1:{port}")
        while True:
            conn, addr = s.accept()
            try:
                req = conn.recv(1024)
                body = "{\"status\": \"operational\", \"service\": \"Rabbit Internal API v2.1\", \"auth\": \"None required for staging\"}\n"
                resp = (
                    "HTTP/1.1 200 OK\r\n"
                    "Server: RabbitGateway/2.1 (Staging)\r\n"
                    "Content-Type: application/json\r\n"
                    f"Content-Length: {len(body)}\r\n"
                    "Connection: close\r\n\r\n" + body
                )
                conn.sendall(resp.encode())
            except Exception:
                pass
            finally:
                conn.close()
    except Exception as e:
        print(f"[-] Could not bind HTTP server to 127.0.0.1:{port} ({e})")

if __name__ == "__main__":
    print("=" * 60)
    print("  RABBIT SECURITY ASSESSMENT PLATFORM - LOCAL DEMO LAB")
    print("  Binds strictly to 127.0.0.1 (Localhost)")
    print("=" * 60)

    # Start lightweight threads
    t_ftp = threading.Thread(target=run_mock_banner_server, args=(21, b"220 vsftpd 3.0.3 (Ubuntu) - Rabbit Pvt. Ltd. Training Lab\r\n", "FTP"), daemon=True)
    t_ssh = threading.Thread(target=run_mock_banner_server, args=(22, b"SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.6\r\n", "SSH"), daemon=True)
    t_smtp = threading.Thread(target=run_mock_banner_server, args=(25, b"220 mail.rabbit-lab.local ESMTP Postfix (Ubuntu)\r\n", "SMTP"), daemon=True)
    t_http = threading.Thread(target=run_mock_http_server, args=(8080,), daemon=True)

    t_ftp.start()
    t_ssh.start()
    t_smtp.start()
    t_http.start()

    print("[*] Local demo lab services running. Press Ctrl+C to terminate.")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[*] Stopping lab.")

