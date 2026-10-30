import React, { useState, useEffect } from 'react';
import {
  Network,
  Play,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Info,
  ChevronRight,
  ArrowRight,
  Upload,
  AlertTriangle,
  FileCode
} from 'lucide-react';
import { api } from '../services/api';

interface Task4Props {
  onRefresh: () => void;
  onNavigate: (section: string) => void;
}

export const Task4ServiceEnum: React.FC<Task4Props> = ({ onRefresh, onNavigate }) => {
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [targetIp, setTargetIp] = useState<string>('127.0.0.1');
  const [enumerating, setEnumerating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('console'); // console, history
  const [enumRecords, setEnumRecords] = useState<any[]>([]);
  const [latestResult, setLatestResult] = useState<any>(null);

  useEffect(() => {
    loadServices();
    loadEnumerations();
  }, []);

  const loadServices = async () => {
    try {
      const res = await api.getEnumerationServices();
      setServices(res.services || []);
      setTargetIp(res.target || '127.0.0.1');
      if (res.services && res.services.length > 0) {
        setSelectedService(res.services[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadEnumerations = async () => {
    try {
      const recs = await api.getEnumerations();
      setEnumRecords(recs || []);
      if (recs && recs.length > 0) {
        setLatestResult(recs[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunEnumeration = async () => {
    if (!selectedService) return;

    try {
      setEnumerating(true);
      const res = await api.runEnumeration(
        selectedService.port,
        selectedService.service_name,
        getToolForService(selectedService.port, selectedService.service_name)
      );
      setLatestResult(res);
      await loadEnumerations();
      onRefresh();
    } catch (e: any) {
      alert(`Enumeration error: ${e.message}`);
    } finally {
      setEnumerating(false);
    }
  };

  const getToolForService = (port: number, sName: string): string => {
    const s = sName.toLowerCase();
    if (port === 21 || s.includes('ftp')) return 'Python ftplib / Nmap NSE';
    if (port === 22 || s.includes('ssh')) return 'Netcat / SSH Client Banner Grab';
    if (port === 25 || s.includes('smtp')) return 'SMTP Client / EHLO Probe';
    if (port === 80 || port === 8080 || s.includes('http')) return 'cURL / HTTP Header Inspector';
    if (port === 445 || s.includes('smb')) return 'SMBclient / Null Session Probe';
    if (port === 161 || s.includes('snmp')) return 'SNMP Client / UDP Probe';
    return 'Raw Socket Banner Prober';
  };

  const getTechniqueForService = (port: number, sName: string): string => {
    const s = sName.toLowerCase();
    if (port === 21 || s.includes('ftp')) return 'Passive banner inspection, unauthenticated anonymous login testing, root NLST/LIST enumeration.';
    if (port === 22 || s.includes('ssh')) return 'Direct TCP socket banner query to extract SSH RFC protocol version and implementation build.';
    if (port === 25 || s.includes('smtp')) return 'RFC 5321 EHLO exchange to review supported extensions without relaying mail.';
    if (port === 80 || port === 8080 || s.includes('http')) return 'Safe HTTP GET/HEAD inspection, Server header extraction, defensive headers audit.';
    if (port === 445 || s.includes('smb')) return 'SMB protocol negotiation and anonymous IPC$ null session inspection.';
    if (port === 161 || s.includes('snmp')) return 'SNMPv2c UDP query with community string "public" against MIB-II system description.';
    return 'Non-destructive TCP connect and protocol probe to capture application identification string.';
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="border-b border-navy-700/80 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            Task 4: Service Enumeration (Safe, Read-Only Techniques)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Perform in-depth, protocol-aware enumeration on discovered ports strictly using safe read-only commands.
          </p>
        </div>

        <button
          onClick={() => onNavigate('task5')}
          className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition self-start md:self-auto"
        >
          Proceed to Task 5 FTP Assessment →
        </button>
      </div>

      {/* Grid: Services List and Active Enumeration Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Discovered Services List (4 cols) */}
        <div className="lg:col-span-4 bg-navy-900 border border-navy-700/80 rounded-xl p-4 shadow-lg space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Discovered Services</span>
            <span className="text-[10px] text-cyan-400 font-mono">From Task 3</span>
          </h3>

          <div className="space-y-2">
            {services.map((s) => {
              const isSelected = selectedService?.port === s.port;
              return (
                <button
                  key={s.port}
                  onClick={() => setSelectedService(s)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-500 shadow-sm'
                      : 'bg-navy-950/60 border-navy-800 hover:border-navy-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-cyan-300">
                      Port {s.port}/{s.protocol}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                        s.priority === 'High'
                          ? 'bg-rose-950 text-rose-400'
                          : s.priority === 'Medium'
                          ? 'bg-amber-950 text-amber-400'
                          : 'bg-emerald-950 text-emerald-400'
                      }`}
                    >
                      {s.priority}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white">{s.service_name}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {s.version || 'Version unverified'}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-navy-800/60 text-[10px] text-slate-500">
                    <span>Enum Runs: {s.enumerations_count}</span>
                    <span className="text-cyan-400 font-sans">Click to inspect</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Enumeration Execution Workspace (8 cols) */}
        <div className="lg:col-span-8 bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg space-y-4">
          {selectedService ? (
            <>
              {/* Service Details Card */}
              <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      Target: {targetIp}:{selectedService.port}
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="text-xs font-bold text-white uppercase">
                      {selectedService.service_name}
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-medium">
                    Safe Read-Only Mode
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Recommended Tool</span>
                    <span className="font-semibold text-slate-200">
                      {getToolForService(selectedService.port, selectedService.service_name)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Reported Version</span>
                    <span className="font-mono text-slate-300">
                      {selectedService.version || 'Detected dynamically during probe'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
                    Enumeration Technique & Scope:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {getTechniqueForService(selectedService.port, selectedService.service_name)}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-navy-800">
                  <span className="text-[11px] text-slate-400">
                    No brute force, credential guessing, or disruptive payloads.
                  </span>
                  <button
                    onClick={handleRunEnumeration}
                    disabled={enumerating}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {enumerating ? 'Probing Service...' : 'Execute Safe Enumeration'}
                  </button>
                </div>
              </div>

              {/* Execution Output & Technical Interpretation */}
              {latestResult && latestResult.port === selectedService.port && (
                <div className="space-y-4">
                  {/* Terminal Box */}
                  <div className="bg-navy-950 border border-navy-800 rounded-xl p-3.5 font-mono text-xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-navy-800 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-slate-300">{latestResult.command_run}</span>
                      </div>
                      <span className="text-emerald-400 font-sans">Execution Success</span>
                    </div>
                    <pre className="text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap select-text leading-relaxed">
                      {latestResult.execution_output}
                    </pre>
                  </div>

                  {/* Analysis Breakdown: Interpretation, Relevance, Next Step */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-navy-950 p-3 rounded-lg border border-navy-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                        Output Interpretation
                      </span>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        {latestResult.interpretation}
                      </p>
                    </div>

                    <div className="bg-navy-950 p-3 rounded-lg border border-navy-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                        Security Relevance
                      </span>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        {latestResult.security_relevance}
                      </p>
                    </div>

                    <div className="bg-navy-950 p-3 rounded-lg border border-navy-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                        Recommended Next Step
                      </span>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        {latestResult.next_step}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-8 text-xs text-slate-500">
              Select a discovered service on the left to inspect enumeration methods and execute audits.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

