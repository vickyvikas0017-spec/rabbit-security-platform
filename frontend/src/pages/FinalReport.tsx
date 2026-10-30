import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  FileDown,
  CheckCircle2,
  Clock,
  Archive,
  BookOpen,
  Printer,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';

interface ReportProps {
  projectData: any;
  onRefresh: () => void;
}

export const FinalReport: React.FC<ReportProps> = ({ projectData, onRefresh }) => {
  const [generating, setGenerating] = useState(false);
  const [reportResult, setReportResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'sections' | 'downloads'>('preview');

  const proj = projectData?.project || {};
  const target = projectData?.target || {};

  const handleGenerateReports = async () => {
    try {
      setGenerating(true);
      const res = await api.generateReport(
        proj.student_name || 'Student Analyst',
        proj.batch_team || 'CyberSec Minor Batch A'
      );
      setReportResult(res);
      onRefresh();
    } catch (e: any) {
      alert(`Report generation error: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const sectionsList = [
    { num: 1, title: 'Cover Page', desc: 'Rabbit Pvt. Ltd. Assessment metadata, Student Name, Batch/Team, Target' },
    { num: 2, title: 'Target and Scope', desc: 'Authorized IP, authorization reference, boundaries, and testing restrictions' },
    { num: 3, title: 'Shodan Target Discovery Evidence', desc: 'Reconnaissance metadata, organization, ISP, geodata, selection justification' },
    { num: 4, title: 'Methodology', desc: 'Five-phase ethical assessment framework conforming to academic standards' },
    { num: 5, title: 'Nmap Scanning', desc: 'Executed commands, scan rationales, durations, raw console outputs' },
    { num: 6, title: 'Attack Surface Table', desc: 'Structured matrix: IP, Port, Proto, Service, Version, Priority, Reason' },
    { num: 7, title: 'Service Enumeration', desc: 'Detailed safe read-only protocol evaluations (FTP, SSH, SMTP, HTTP, SMB, SNMP)' },
    { num: 8, title: 'FTP Assessment / Alternative Service', desc: 'Anonymous login, directory listing, harmless download test, controlled upload test' },
    { num: 9, title: 'Strategy Questions', desc: 'Technical triage justification and limited-time assessment reasoning' },
    { num: 10, title: 'Findings and Evidence', desc: 'Verified security weaknesses classified by severity with technical explanations' },
    { num: 11, title: 'Impact', desc: 'Organizational risk exposure from unencrypted protocols and anonymous access' },
    { num: 12, title: 'Remediation', desc: 'Concrete hardening guidance: TLS enforcement, SFTP migration, ACL rules' },
    { num: 13, title: 'Conclusion', desc: 'Final technical summary of audit posture and perimeter defense recommendations' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="border-b border-navy-700/80 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Final Security Assessment Report (13-Section Structure)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate compliant DOCX and PDF deliverables strictly conforming to the Rabbit Pvt. Ltd. assessment specifications.
          </p>
        </div>

        <button
          onClick={handleGenerateReports}
          disabled={generating}
          className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition shadow-lg shadow-cyan-600/20 disabled:opacity-50 self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          {generating ? 'Compiling 13 Sections...' : 'Generate DOCX & PDF Reports'}
        </button>
      </div>

      {/* Generation Status & Download Banner */}
      {reportResult && (
        <div className="bg-emerald-950/40 border border-emerald-700/80 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-emerald-300">
                13-Section Reports Successfully Generated!
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Saved files: <code className="text-cyan-300 font-mono">{reportResult.docx_filename}</code> and{' '}
                <code className="text-cyan-300 font-mono">{reportResult.pdf_filename}</code>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={reportResult.docx_url}
              download
              className="bg-navy-900 hover:bg-navy-800 border border-navy-700 text-cyan-300 text-xs px-3.5 py-2 rounded-lg font-medium flex items-center gap-1.5 transition"
            >
              <FileDown className="w-4 h-4 text-cyan-400" />
              Download DOCX
            </a>
            <a
              href={reportResult.pdf_url}
              download
              className="bg-navy-900 hover:bg-navy-800 border border-navy-700 text-cyan-300 text-xs px-3.5 py-2 rounded-lg font-medium flex items-center gap-1.5 transition"
            >
              <FileDown className="w-4 h-4 text-rose-400" />
              Download PDF
            </a>
            <a
              href="/api/reports/download-raw-scans"
              download
              className="bg-navy-900 hover:bg-navy-800 border border-navy-700 text-slate-300 text-xs px-3.5 py-2 rounded-lg font-medium flex items-center gap-1.5 transition"
            >
              <Archive className="w-4 h-4 text-amber-400" />
              Raw Scans ZIP
            </a>
          </div>
        </div>
      )}

      {/* Tabs: Preview vs Section Structure */}
      <div className="flex border-b border-navy-800 text-xs font-medium space-x-4">
        <button
          onClick={() => setActiveTab('preview')}
          className={`pb-2.5 transition border-b-2 ${
            activeTab === 'preview'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Document Preview & Cover Page
        </button>
        <button
          onClick={() => setActiveTab('sections')}
          className={`pb-2.5 transition border-b-2 ${
            activeTab === 'sections'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          13-Section Specification Checklist
        </button>
      </div>

      {activeTab === 'preview' ? (
        /* Report Mockup Preview Sheet */
        <div className="bg-white text-slate-900 rounded-xl p-8 shadow-2xl max-w-4xl mx-auto space-y-8 font-sans">
          {/* Cover Page Card */}
          <div className="border-4 border-slate-900 p-8 rounded-lg text-center space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              RABBIT PVT. LTD.
            </h1>
            <h2 className="text-lg font-bold text-sky-800 tracking-wide uppercase">
              MINOR PROJECT ASSESSMENT
            </h2>
            <div className="w-24 h-1 bg-sky-700 mx-auto" />
            <p className="text-sm italic text-slate-700 max-w-lg mx-auto">
              Network Discovery, Information Gathering, Enumeration and FTP Security Testing
            </p>

            <div className="pt-8 max-w-md mx-auto">
              <table className="w-full text-left text-xs border border-slate-300">
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-700 w-44">Target System:</td>
                    <td className="p-2.5 font-mono font-bold text-slate-900">{target?.ip_address || '127.0.0.1'}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-700">Target Hostname:</td>
                    <td className="p-2.5 font-mono text-slate-800">{target?.hostname || 'N/A'}</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-700">Student Name:</td>
                    <td className="p-2.5 font-semibold text-slate-900">{proj?.student_name || 'Student Analyst'}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-700">Batch / Team:</td>
                    <td className="p-2.5 text-slate-800">{proj?.batch_team || 'CyberSec Minor Batch A'}</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-700">Date of Assessment:</td>
                    <td className="p-2.5 text-slate-800">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-700">Authorized Scope:</td>
                    <td className="p-2.5 text-slate-800">{target?.auth_reference || 'RABBIT-AUTH-2026-LAB-01'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section Summary Outline Inside Preview */}
          <div className="space-y-4 text-xs text-slate-800 leading-relaxed pt-4 border-t border-slate-200">
            <h3 className="text-base font-bold text-slate-900 border-b pb-1">
              Executive Summary & Scope Overview
            </h3>
            <p>
              This comprehensive security assessment was conducted strictly against the pre-authorized target system{' '}
              <b>{target?.ip_address || '127.0.0.1'}</b> under authorization reference{' '}
              <b>{target?.auth_reference || 'RABBIT-AUTH-2026-LAB-01'}</b>. All eight phases of the assessment—including passive Shodan discovery, active Nmap port scanning, attack surface modeling, deep service enumeration, controlled FTP assessment, triage strategy, and unknown service investigation—were executed within authorized boundaries using non-destructive techniques.
            </p>

            <h3 className="text-base font-bold text-slate-900 border-b pb-1 pt-3">
              Key Discovered Services Matrix
            </h3>
            <p className="text-slate-600">
              The attack surface table maps each listening protocol, service banner, and assigned investigation priority:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-slate-300 text-xs">
                <thead className="bg-slate-900 text-white font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-2">Port</th>
                    <th className="p-2">Proto</th>
                    <th className="p-2">Service</th>
                    <th className="p-2">Version</th>
                    <th className="p-2">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  <tr>
                    <td className="p-2 font-bold">21</td>
                    <td className="p-2">TCP</td>
                    <td className="p-2 font-sans font-semibold">FTP (vsftpd)</td>
                    <td className="p-2">3.0.3</td>
                    <td className="p-2 font-sans font-bold text-rose-600">High</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-2 font-bold">22</td>
                    <td className="p-2">TCP</td>
                    <td className="p-2 font-sans font-semibold">SSH (OpenSSH)</td>
                    <td className="p-2">8.9p1 Ubuntu</td>
                    <td className="p-2 font-sans font-bold text-amber-600">Medium</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">80</td>
                    <td className="p-2">TCP</td>
                    <td className="p-2 font-sans font-semibold">HTTP (Apache)</td>
                    <td className="p-2">2.4.52</td>
                    <td className="p-2 font-sans font-bold text-rose-600">High</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-2 font-bold">445</td>
                    <td className="p-2">TCP</td>
                    <td className="p-2 font-sans font-semibold">SMB (Samba)</td>
                    <td className="p-2">4.15.13</td>
                    <td className="p-2 font-sans font-bold text-rose-600">High</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">8080</td>
                    <td className="p-2">TCP</td>
                    <td className="p-2 font-sans font-semibold">HTTP Proxy / Gateway</td>
                    <td className="p-2">Custom Gateway</td>
                    <td className="p-2 font-sans font-bold text-rose-600">High</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-4 text-center">
              <span className="text-slate-400 text-[11px] italic">
                ... Complete 13 sections with findings, evidence logs, remediation, and conclusion are embedded in the full downloadable DOCX/PDF ...
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* 13-Section Specification Checklist */
        <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Rabbit Pvt. Ltd. PDF 13-Section Specification Verification
          </h3>

          <div className="space-y-2">
            {sectionsList.map((sec) => (
              <div
                key={sec.num}
                className="bg-navy-950 p-3 rounded-lg border border-navy-800 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-bold font-mono flex items-center justify-center flex-shrink-0">
                    {sec.num}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{sec.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{sec.desc}</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-medium flex-shrink-0">
                  Included in Generator
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

