import os
import sys
import unittest
import json
from fastapi.testclient import TestClient

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.main import app
from backend.app.scanners.nmap_scanner import build_nmap_command, parse_nmap_xml, validate_target
from backend.app.enumeration.ftp_assessor import run_ftp_security_assessment
from backend.app.reports.report_generator import generate_assessment_docx, generate_assessment_pdf

class TestRabbitSecurityPlatform(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_health_and_system_status(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "ok")

        status_res = self.client.get("/api/system/status")
        self.assertEqual(status_res.status_code, 200)
        data = status_res.json()
        self.assertIn("nmap_installed", data)
        self.assertIn("storage_writable", data)
        self.assertTrue(data["storage_writable"])

    def test_02_project_creation_and_retrieval(self):
        res = self.client.get("/api/project")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("project", data)
        self.assertEqual(data["project"]["client_name"], "Rabbit Pvt. Ltd.")

    def test_03_target_validation_and_injection_prevention(self):
        # Valid targets
        self.assertTrue(validate_target("127.0.0.1"))
        self.assertTrue(validate_target("192.168.1.1"))
        self.assertTrue(validate_target("rabbit-target.local"))

        # Invalid targets / injection attempts (must be rejected)
        self.assertFalse(validate_target("192.168.1.0/24")) # CIDR range blocked
        self.assertFalse(validate_target("127.0.0.1; rm -rf /")) # Shell injection blocked
        self.assertFalse(validate_target("127.0.0.1 & dir")) # Shell chaining blocked
        self.assertFalse(validate_target("127.0.0.1 | whoami")) # Pipe blocked
        self.assertFalse(validate_target("127.0.0.1 192.168.1.2")) # Multi-target blocked

    def test_04_nmap_command_builder_specification(self):
        target = "127.0.0.1"
        xml_dummy = "test.xml"
        nmap_bin = "nmap"

        # Basic scan
        args, cmd, _ = build_nmap_command("basic", target, nmap_bin, xml_dummy)
        self.assertIn("-sT", args)
        self.assertIn("-Pn", args)
        self.assertIn("--top-ports", args)
        self.assertEqual(cmd, "nmap -sT -Pn --top-ports 1000 -T3 127.0.0.1")

        # Full TCP scan
        args, cmd, _ = build_nmap_command("full_tcp", target, nmap_bin, xml_dummy)
        self.assertIn("-p-", args)
        self.assertEqual(cmd, "nmap -sT -Pn -p- -T3 127.0.0.1")

        # Service detection scan
        args, cmd, _ = build_nmap_command("service_detect", target, nmap_bin, xml_dummy)
        self.assertIn("-sV", args)
        self.assertEqual(cmd, "nmap -sV -Pn 127.0.0.1")

        # OS detection scan
        args, cmd, _ = build_nmap_command("os_detect", target, nmap_bin, xml_dummy)
        self.assertIn("-O", args)
        self.assertIn("-sV", args)
        self.assertEqual(cmd, "nmap -O -sV -Pn 127.0.0.1")

    def test_05_nmap_xml_parser(self):
        sample_xml = """<?xml version="1.0" encoding="UTF-8"?>
        <nmaprun scanner="nmap" version="7.92">
          <host>
            <status state="up"/>
            <address addr="127.0.0.1" addrtype="ipv4"/>
            <ports>
              <port protocol="tcp" portid="21">
                <state state="open"/>
                <service name="ftp" product="vsftpd" version="3.0.3"/>
              </port>
              <port protocol="tcp" portid="80">
                <state state="open"/>
                <service name="http" product="Apache httpd" version="2.4.52"/>
              </port>
            </ports>
          </host>
        </nmaprun>
        """
        results = parse_nmap_xml(sample_xml)
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]["port"], 21)
        self.assertEqual(results[0]["service_name"], "ftp")
        self.assertEqual(results[0]["product"], "vsftpd")
        self.assertEqual(results[0]["priority"], "High")

        self.assertEqual(results[1]["port"], 80)
        self.assertEqual(results[1]["service_name"], "http")

    def test_06_shodan_search_endpoint(self):
        res = self.client.post("/api/task1/shodan-search", json={"query": "port:21 vsftpd"})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("results", data)
        self.assertGreater(len(data["results"]), 0)

    def test_07_target_selection_and_authorization(self):
        # Select target
        sel_res = self.client.post("/api/task1/select-target", json={
            "ip_str": "127.0.0.1",
            "hostname": "localhost",
            "selected_reason": "Automated unit test target",
            "is_local_lab": True
        })
        self.assertEqual(sel_res.status_code, 200)

        # Update authorization
        auth_res = self.client.post("/api/task1/authorization", json={
            "status": "Authorized",
            "auth_reference": "RABBIT-AUTH-TEST-001",
            "scope_description": "Single localhost authorized test target",
            "allowed_ports": "1-65535",
            "testing_restrictions": "Unit test read-only",
            "confirmed_by": "Test Harness",
            "legal_disclaimer_accepted": True
        })
        self.assertEqual(auth_res.status_code, 200)

        # Verify active target state
        t_res = self.client.get("/api/task1/target")
        self.assertEqual(t_res.status_code, 200)
        t_data = t_res.json()
        self.assertEqual(t_data["target"]["ip_address"], "127.0.0.1")
        self.assertEqual(t_data["authorization"]["status"], "Authorized")

    def test_08_ftp_security_assessment_logic(self):
        # Run FTP assessment logic against localhost (or simulated response)
        res = run_ftp_security_assessment("127.0.0.1", port=21, allow_upload_test=False)
        self.assertIn("available", res)
        self.assertIn("anonymous_access", res)

    def test_09_strategy_challenge_scenario(self):
        res = self.client.get("/api/task6/scenario")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["services"]), 6)
        ports = [s["port"] for s in data["services"]]
        self.assertIn("21", ports)
        self.assertIn("22", ports)
        self.assertIn("25", ports)
        self.assertIn("80", ports)
        self.assertIn("445", ports)
        self.assertIn("161/UDP", ports)

    def test_10_docx_and_pdf_report_generation(self):
        test_data = {
            "student_name": "Test Student",
            "batch_team": "Batch A",
            "target_ip": "127.0.0.1",
            "target_hostname": "rabbit-test.local",
            "auth_reference": "RABBIT-AUTH-TEST",
            "scope_description": "Unit test scope",
            "allowed_ports": "1-65535",
            "testing_restrictions": "Safe read-only",
            "shodan_info": {"org": "Test Org", "isp": "Test ISP", "ports": [21, 80]},
            "scans": [{"scan_type": "basic", "command": "nmap -sT -Pn --top-ports 1000 -T3 127.0.0.1", "duration": 1.2}],
            "attack_surface": [{"port": 21, "protocol": "tcp", "service": "ftp", "version": "vsftpd 3.0.3", "priority": "High"}],
            "enumerations": [{"port": 21, "service_name": "ftp", "tool_name": "ftplib", "interpretation": "Safe banner captured."}],
            "ftp_assessment": {"available": True, "software_version": "vsftpd 3.0.3", "anonymous_access": "Allowed", "download_success": True},
            "findings": [{"title": "FTP Anonymous Access", "severity": "High", "technical_explanation": "Anonymous login enabled."}]
        }

        docx_out = "test_report.docx"
        pdf_out = "test_report.pdf"

        try:
            generate_assessment_docx(test_data, docx_out)
            self.assertTrue(os.path.exists(docx_out))
            self.assertGreater(os.path.getsize(docx_out), 1000)

            generate_assessment_pdf(test_data, pdf_out)
            self.assertTrue(os.path.exists(pdf_out))
            self.assertGreater(os.path.getsize(pdf_out), 1000)
        finally:
            if os.path.exists(docx_out):
                os.remove(docx_out)
            if os.path.exists(pdf_out):
                os.remove(pdf_out)

if __name__ == "__main__":
    unittest.main()

