import React, { useState, useEffect } from 'react';
import {
  Radio,
  Play,
  StopCircle,
  Clock,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Info
} from 'lucide-react';
import { api } from '../services/api';

interface Task2Props {
  onRefresh: () => void;
  onNavigate: (section: string) => void;
}

export const Task2HostDiscovery: React.FC<Task2Props> = ({ onRefresh, onNavigate }) => {
  const [targetInfo, setTargetInfo] = useState<any>(null);
  const [selectedScanType, setSelectedScanType] = useState<string>('basic');
  const [preview, setPreview] = useState<any>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [running, setRunning] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [latestScanResult, setLatestScanResult] = useState<any>(null);

  const scanOptions = [
    {
      id: 'basic',
      name: '1. Basic Nmap Scan',
      cmd: 'nmap -sT -Pn --top-ports 1000 -T3 TARGET',
      desc: 'Top 1000 TCP ports scan via TCP Connect without ping.',
    },
    {
      id: 'full_tcp',
      name: '2. Full TCP Port Scan',
      cmd: 'nmap -sT -Pn -p- -T3 TARGET',
      desc: 'Comprehensive scan across all 65,535 TCP ports.',
    },
    {
      id: 'service_detect',
      name: '3. Service & Version Detection',
      cmd: 'nmap -sV -Pn TARGET',
      desc: 'In-depth banner grabbing and version determination.',
    },
    {
      id: 'os_detect',
      name: '4. Operating System Detection',
      cmd: 'nmap -O -sV -Pn TARGET',
      desc: 'TCP/IP stack fingerprinting for OS identification (Requires Admin).',
    },
  ];

  useEffect(() => {
    loadTargetAndScans();
  }, []);

  useEffect(() => {
    loadPreview();
  }, [selectedScanType]);

  const loadTargetAndScans = async () => {
    try {
      const t = await api.getTarget();
      setTargetInfo(t);
      const hist = await api.getScanHistory();
      setScanHistory(hist || []);
      if (hist && hist.length > 0) {
        setTerminalOutput(hist[0].raw_output || '');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadPreview = async () => {
    try {
      setConfirmed(false);
      const res = await api.previewScan(selectedScanType);
      setPreview(res);
    } catch (e) {
      setPreview(null);
    }
  };

  const handleExecuteScan = async () => {
    if (!confirmed) {
      alert('Please check the confirmation box before executing the network scan.');
      return;
    }

    try {
      setRunning(true);
      setTerminalOutput(`[*] Initializing scan pipeline against ${targetInfo?.target?.ip_address}...\n[*] Command: ${preview?.command}\n[*] Executing backend subprocess...\n`);
      
      const res = await api.executeScan(selectedScanType);
      setCurrentSessionId(res.session_id);
      setTerminalOutput(res.raw_output || 'Scan completed.');
      setLatestScanResult(res);
      await loadTargetAndScans();
      onRefresh();
    } catch (e: any) {
      setTerminalOutput(`[-] Scan execution error: ${e.message || 'Subprocess failure.'}`);
    } finally {
      setRunning(false);
    }
  };

  const handleCancelScan = async () => {
    if (!currentSessionId) return;
    try {
      await api.cancelScan(currentSessionId);
      setRunning(false);
      setTerminalOutput((prev) => prev + '\n[!] User issued SIGTERM cancellation. Scan aborted.');
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const target = targetInfo?.target;
  const isAuthorized = targetInfo?.authorization?.status === 'Authorized';

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="border-b border-navy-700/80 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            Task 2: Host & Port Discovery (Nmap Integration)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Execute real Nmap scanning against the selected authorized target with command review, cancellation, and XML parsing.
          </p>
        </div>

        {target && (
          <div className="flex items-center space-x-2 bg-navy-900 border border-navy-700 px-3.5 py-1.5 rounded-lg text-xs">
            <span className="text-slate-400">Target IP:</span>
            <span className="font-mono font-bold text-cyan-400">{target.ip_address}</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                isAuthorized ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}
            >
              {isAuthorized ? 'Authorized' : 'Unauthorized'}
            </span>
          </div>
        )}
      </div>

      {!isAuthorized && (
        <div className="bg-rose-950/40 border border-rose-800 p-4 rounded-xl flex items-start gap-3 text-rose-200 text-xs">
          <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold uppercase tracking-wider text-rose-300">Scanning Locked - Authorization Required</p>
            <p>
              Under ethical cybersecurity standards, active port scanning cannot be initiated without recorded authorization. Please verify authorization in Task 1.
            </p>
            <button
              onClick={() => onNavigate('task1')}
              className="mt-2 bg-rose-900 hover:bg-rose-800 text-white text-xs px-3 py-1.5 rounded font-medium transition"
            >
              Return to Task 1 Authorization →
            </button>
          </div>
        </div>
      )}

      {/* Main Scan Configuration & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scan Selector (5 cols) */}
        <div className="lg:col-span-5 bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Select Scan Profile</span>
            <span className="text-[11px] text-cyan-400 font-mono">Assignment Standard</span>
          </h3>

          <div className="space-y-2.5">
            {scanOptions.map((opt) => {
              const isSelected = selectedScanType === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedScanType(opt.id)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-sm'
                      : 'bg-navy-950/60 border-navy-800 hover:border-navy-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{opt.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400">
                      {opt.id === 'os_detect' ? 'Requires Raw Socket' : 'Non-Intrusive'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">{opt.desc}</p>
                  <code className="text-[10px] font-mono bg-navy-900 px-2 py-1 rounded block text-cyan-300 truncate">
                    {opt.cmd.replace('TARGET', target?.ip_address || '127.0.0.1')}
                  </code>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Execution Controller & Command Inspection (7 cols) */}
        <div className="lg:col-span-7 bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Command Review & Confirmation</span>
              <span className="text-[11px] text-emerald-400 font-mono">Pre-Execution Inspection</span>
            </h3>

            {preview ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block mb-1">
                    Exact Command to Execute:
                  </span>
                  <div className="bg-navy-950 border border-navy-800 p-2.5 rounded-lg font-mono text-cyan-300 text-xs">
                    {preview.command}
                  </div>
                </div>

                <div className="bg-navy-950/80 border border-navy-800 p-3 rounded-lg text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-400">
                    <Info className="w-3.5 h-3.5" />
                    <span>Technical Rationale:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    {preview.rationale}
                  </p>
                </div>

                {preview.warning && (
                  <div className="bg-amber-950/40 border border-amber-800 p-2.5 rounded-lg text-amber-300 text-[11px] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{preview.warning}</span>
                  </div>
                )}

                <div className="pt-2">
                  <label className="flex items-start gap-2 cursor-pointer bg-navy-950 p-2.5 rounded-lg border border-navy-800">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      disabled={!isAuthorized || running}
                      className="mt-0.5 rounded border-navy-700 bg-navy-900 text-cyan-500 focus:ring-0"
                    />
                    <span className="text-[11px] text-slate-200">
                      I have reviewed the exact command line arguments and confirm execution against authorized target{' '}
                      <b className="text-cyan-300 font-mono">{target?.ip_address}</b>.
                    </span>
                  </label>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Loading command preview...</p>
            )}
          </div>

          <div className="pt-4 border-t border-navy-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-400">
              {running ? (
                <span className="flex items-center gap-2 text-cyan-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  Nmap probe in progress...
                </span>
              ) : (
                <span>Ready for scan invocation</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {running ? (
                <button
                  onClick={handleCancelScan}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition"
                >
                  <StopCircle className="w-4 h-4" />
                  Cancel Scan
                </button>
              ) : (
                <button
                  onClick={handleExecuteScan}
                  disabled={!isAuthorized || !confirmed || running}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-5 py-2 rounded-lg font-medium flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-cyan-600/20"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Confirm & Execute Scan
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Terminal View: Live Output & Scan Results */}
      <div className="bg-navy-950 border border-navy-700/80 rounded-xl p-4 shadow-xl font-mono text-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-navy-800">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-bold">Nmap Terminal Execution Output</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            {latestScanResult && (
              <span className="text-emerald-400">
                Duration: {latestScanResult.duration_seconds || '1.2'}s
              </span>
            )}
            <button
              onClick={() => onNavigate('task3')}
              className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-sans"
            >
              Proceed to Attack Surface (Task 3) →
            </button>
          </div>
        </div>

        <div className="terminal-box rounded-lg p-4 h-64 overflow-y-auto text-slate-300 whitespace-pre-wrap leading-relaxed select-text">
          {terminalOutput || (
            <span className="text-slate-600 italic">
              No scan session has been executed yet. Select a scan option above and click 'Confirm & Execute Scan' to run Nmap.
            </span>
          )}
        </div>
      </div>

      {/* Scan History Table */}
      {scanHistory.length > 0 && (
        <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-4 shadow-lg">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center justify-between">
            <span>Historical Scan Sessions</span>
            <span className="text-[11px] text-slate-400 font-mono">SQLite Persistent History</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950 text-slate-400 uppercase text-[10px] font-mono">
                <tr>
                  <th className="p-2.5">ID</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Command</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Duration</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800 font-mono text-[11px]">
                {scanHistory.map((s) => (
                  <tr key={s.id} className="hover:bg-navy-850/50">
                    <td className="p-2.5 text-slate-500">#{s.id}</td>
                    <td className="p-2.5 text-cyan-400 font-semibold uppercase">{s.scan_type}</td>
                    <td className="p-2.5 text-slate-300 truncate max-w-xs">{s.command}</td>
                    <td className="p-2.5">
                      <span className="text-emerald-400 font-sans font-medium">{s.status}</span>
                    </td>
                    <td className="p-2.5 text-slate-400">{s.duration_seconds || '0.8'}s</td>
                    <td className="p-2.5 text-right font-sans">
                      <button
                        onClick={() => setTerminalOutput(s.raw_output || '')}
                        className="text-cyan-400 hover:underline text-xs"
                      >
                        View Output
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

