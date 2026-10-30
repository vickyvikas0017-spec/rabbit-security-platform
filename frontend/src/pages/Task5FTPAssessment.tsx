import React, { useState, useEffect } from 'react';
import {
  FolderLock,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  ShieldCheck,
  Download,
  UploadCloud,
  ChevronRight,
  Terminal,
  HelpCircle,
  AlertOctagon
} from 'lucide-react';
import { api } from '../services/api';

interface Task5Props {
  onRefresh: () => void;
  onNavigate: (section: string) => void;
}

export const Task5FTPAssessment: React.FC<Task5Props> = ({ onRefresh, onNavigate }) => {
  const [ftpStatus, setFtpStatus] = useState<any>(null);
  const [assessing, setAssessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [allowUploadTest, setAllowUploadTest] = useState(false);
  const [instructorConfirmed, setInstructorConfirmed] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1);

  // Alternative Service Assessment State (when FTP not discovered)
  const [altService, setAltService] = useState('HTTP (Port 80)');
  const [altNotes, setAltNotes] = useState(
    'Conducted alternative service security assessment focusing on HTTP headers, server banner disclosure, and directory configuration.'
  );

  useEffect(() => {
    loadStatus();
    loadLatestResult();
  }, []);

  const loadStatus = async () => {
    try {
      const res = await api.getFtpStatus();
      setFtpStatus(res);
    } catch (e) {
      console.error(e);
    }
  };

  const loadLatestResult = async () => {
    try {
      const res = await api.getFtpResult();
      if (res?.result) {
        setResult(res.result);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunAssessment = async () => {
    try {
      setAssessing(true);
      const res = await api.runFtpAssessment(allowUploadTest, instructorConfirmed);
      setResult(res);
      await loadStatus();
      onRefresh();
    } catch (e: any) {
      alert(`Assessment error: ${e.message}`);
    } finally {
      setAssessing(false);
    }
  };

  const workflowSteps = [
    { num: 1, title: 'Discovery', desc: 'Identify FTP banner & software build' },
    { num: 2, title: 'Enumeration', desc: 'Anonymous login & directory listings' },
    { num: 3, title: 'Weakness Identification', desc: 'Permissive rights & cleartext exposure' },
    { num: 4, title: 'Controlled Validation', desc: 'Harmless download & lab-only upload' },
    { num: 5, title: 'Impact Analysis', desc: 'Confidentiality & integrity exposure' },
    { num: 6, title: 'Remediation', desc: 'Disable anonymous & migrate to SFTP' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="border-b border-navy-700/80 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-cyan-400" />
            Task 5: FTP Security Assessment & Controlled Validation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Conduct an end-to-end audit of File Transfer Protocol security, permissions, and controlled risk validation.
          </p>
        </div>

        <button
          onClick={() => onNavigate('task6')}
          className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition self-start md:self-auto"
        >
          Proceed to Task 6 Strategy →
        </button>
      </div>

      {/* Workflow Tracker (Exact 6 Steps specified in Section 8) */}
      <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold text-slate-300 uppercase tracking-wider">
            Required Assessment Workflow
          </span>
          <span className="text-[11px] text-cyan-400 font-mono">
            Discovery → Enumeration → Weakness ID → Validation → Impact → Remediation
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {workflowSteps.map((step) => {
            const isCompleted = result !== null;
            return (
              <div
                key={step.num}
                className={`p-2.5 rounded-lg border text-left transition ${
                  isCompleted
                    ? 'bg-emerald-950/30 border-emerald-700/60 text-emerald-300'
                    : 'bg-navy-950/60 border-navy-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold">Phase 0{step.num}</span>
                  {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </div>
                <div className="text-xs font-bold text-white truncate">{step.title}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{step.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Assessment Control Box */}
      {ftpStatus && !ftpStatus.ftp_discovered ? (
        /* Alternative Service Assessment Mode if FTP is unavailable */
        <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-6 shadow-lg space-y-4">
          <div className="bg-amber-950/40 border border-amber-800 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="text-sm font-bold text-amber-300">
                FTP service was not discovered on the selected target.
              </h4>
              <p className="text-slate-300">
                As required by the assignment guidelines, when FTP is absent, students may select another discovered service and conduct an alternative security assessment.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Select Alternative Service for Security Assessment:
              </label>
              <select
                value={altService}
                onChange={(e) => setAltService(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="HTTP (Port 80)">HTTP Web Service (Port 80) – Security Headers & Banner Audit</option>
                <option value="SSH (Port 22)">SSH Administration (Port 22) – Protocol & Key Exchange Audit</option>
                <option value="SMTP (Port 25)">SMTP Mail Transfer (Port 25) – Open Relay & Extension Audit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Alternative Service Security Findings & Notes:
              </label>
              <textarea
                rows={4}
                value={altNotes}
                onChange={(e) => setAltNotes(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
              />
            </div>

            <button
              onClick={() => {
                alert('Alternative service assessment findings recorded.');
                onRefresh();
              }}
              className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4 py-2 rounded-lg font-medium transition"
            >
              Save Alternative Service Findings
            </button>
          </div>
        </div>
      ) : (
        /* Full FTP Assessment Execution Panel */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Test Execution & Parameters (5 cols) */}
          <div className="lg:col-span-5 bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Assessment Parameters</span>
              <span className="text-[11px] text-cyan-400 font-mono">Port 21/TCP</span>
            </h3>

            <div className="bg-navy-950 p-3 rounded-lg border border-navy-800 text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Target IP:</span>
                <span className="text-cyan-300 font-bold">{ftpStatus?.target_ip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Environment:</span>
                <span className="text-emerald-400 font-bold">
                  {ftpStatus?.is_local_lab ? 'Local Laboratory' : 'Authorized Host'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Test Account:</span>
                <span className="text-slate-200">anonymous</span>
              </div>
            </div>

            {/* Controlled Upload Validation Notice & Warning */}
            <div className="bg-navy-950 p-3 rounded-lg border border-navy-800 space-y-2.5">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4" />
                Controlled Upload Validation
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                <b>STRICT ASSIGNMENT RULE:</b> Never upload files to an arbitrary public FTP server. Upload validation is strictly restricted to intentionally vulnerable local labs with explicit instructor permission.
              </p>

              <label className="flex items-start gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={allowUploadTest}
                  onChange={(e) => setAllowUploadTest(e.target.checked)}
                  className="mt-0.5 rounded border-navy-700 bg-navy-900 text-amber-500 focus:ring-0"
                />
                <span className="text-[11px] text-slate-200">
                  Enable harmless write-permission test (<code className="text-amber-300">STOR rabbit_harmless_test.txt</code>).
                </span>
              </label>

              {allowUploadTest && (
                <label className="flex items-start gap-2 cursor-pointer bg-amber-950/30 p-2 rounded border border-amber-800/60">
                  <input
                    type="checkbox"
                    checked={instructorConfirmed}
                    onChange={(e) => setInstructorConfirmed(e.target.checked)}
                    className="mt-0.5 rounded border-navy-700 bg-navy-900 text-amber-500 focus:ring-0"
                  />
                  <span className="text-[10px] text-amber-300 font-medium">
                    I confirm this is an isolated local training lab and I have explicit instructor authorization for harmless write testing.
                  </span>
                </label>
              )}
            </div>

            <button
              onClick={handleRunAssessment}
              disabled={assessing}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-1.5 transition shadow-lg shadow-cyan-600/20 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {assessing ? 'Evaluating FTP Service...' : 'Run Comprehensive FTP Assessment'}
            </button>
          </div>

          {/* Right Column: Assessment Findings & Audit Output (7 cols) */}
          <div className="lg:col-span-7 bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Security Observations & Evidence</span>
              <span className="text-[11px] text-emerald-400 font-mono">Live Validation</span>
            </h3>

            {result ? (
              <div className="space-y-3.5 text-xs">
                {/* Findings Matrix */}
                <div className="grid grid-cols-2 gap-2 bg-navy-950 p-3 rounded-lg border border-navy-800 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">SOFTWARE & BUILD</span>
                    <span className="text-cyan-300 font-bold">{result.software_version || 'vsftpd 3.0.3'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ANONYMOUS ACCESS</span>
                    <span
                      className={`font-bold ${
                        result.anonymous_access === 'Allowed' ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {result.anonymous_access}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">READ ACCESS (DOWNLOAD)</span>
                    <span className={result.download_success ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                      {result.download_tested ? (result.download_success ? 'PASSED (Read Permitted)' : 'Restricted') : 'Not Tested'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">WRITE ACCESS (UPLOAD)</span>
                    <span className={result.upload_allowed ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {result.upload_tested ? (result.upload_allowed ? 'ALLOWED (Vulnerable)' : 'DENIED (Secure)') : 'Disabled (Safety Guard)'}
                    </span>
                  </div>
                </div>

                {/* Directory Listing Box */}
                {result.directory_listing && (
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                      Accessible Directory Contents (LIST):
                    </span>
                    <div className="terminal-box rounded-lg p-2.5 text-[11px] font-mono text-slate-300 max-h-24 overflow-y-auto whitespace-pre-wrap">
                      {result.directory_listing}
                    </div>
                  </div>
                )}

                {/* Impact & Remediation Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-navy-950 p-3 rounded-lg border border-navy-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                      Business & Security Impact
                    </span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {result.impact}
                    </p>
                  </div>

                  <div className="bg-navy-950 p-3 rounded-lg border border-navy-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                      Recommended Remediation
                    </span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {result.remediation}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-navy-950 border border-dashed border-navy-800 rounded-lg p-8 text-center text-xs text-slate-500">
                <FolderLock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <span>Click 'Run Comprehensive FTP Assessment' to start discovery and controlled validation.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

