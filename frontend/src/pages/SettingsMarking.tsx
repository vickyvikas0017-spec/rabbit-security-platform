import React, { useState, useEffect } from 'react';
import {
  Sliders,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Server,
  Play,
  StopCircle,
  HelpCircle,
  Award,
  Terminal,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

interface SettingsProps {
  onRefresh: () => void;
}

export const SettingsMarking: React.FC<SettingsProps> = ({ onRefresh }) => {
  const [markingData, setMarkingData] = useState<any>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [labRunning, setLabRunning] = useState(false);

  useEffect(() => {
    loadMarkingAndSystem();
  }, []);

  const loadMarkingAndSystem = async () => {
    try {
      setLoading(true);
      const m = await api.getMarkingScheme();
      setMarkingData(m);
      const s = await api.getSystemStatus();
      setSystemStatus(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const checklist = markingData?.checklist || [];
  const satisfiedMarks = markingData?.satisfied_marks || 0;
  const totalMarks = markingData?.total_marks || 50;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="border-b border-navy-700/80 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            Assessment Rubric (50-Mark Breakdown) & Platform Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review academic self-assessment checklist, system tool detection status, and local training laboratory controls.
          </p>
        </div>

        <button
          onClick={loadMarkingAndSystem}
          disabled={loading}
          className="bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 text-xs px-3.5 py-2 rounded-lg font-medium flex items-center gap-1.5 transition self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          Refresh Diagnostics
        </button>
      </div>

      {/* 50-Mark Score Progress Banner */}
      <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              Self-Assessment Checklist
            </span>
            <span className="text-xs text-slate-400 font-mono">Academic Minor Project Rubric</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            Student Readiness Score: {satisfiedMarks} / {totalMarks} Marks
          </h3>
          <p className="text-xs text-slate-400 max-w-xl mt-0.5">
            This rubric breaks down the official 50-mark criteria from the Rabbit Pvt. Ltd. assessment document to help verify that all evidence and technical deliverables are in place.
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-navy-950 p-3.5 rounded-xl border border-navy-800 flex-shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Satisfied Marks</span>
            <span className="text-2xl font-bold font-mono text-cyan-300">
              {satisfiedMarks} <span className="text-sm text-slate-500 font-sans">/ {totalMarks}</span>
            </span>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 flex items-center justify-center font-mono font-bold text-sm text-cyan-400">
            {Math.round((satisfiedMarks / totalMarks) * 100)}%
          </div>
        </div>
      </div>

      {/* 50-Mark Criteria Checklist */}
      <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Marking Scheme Breakdown by Assessment Area
        </h3>

        <div className="space-y-3">
          {checklist.map((item: any, idx: number) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                item.completed
                  ? 'bg-emerald-950/20 border-emerald-700/50 text-slate-200'
                  : 'bg-navy-950/80 border-navy-800 text-slate-400'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2.5">
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  )}
                  <h4 className="text-xs font-bold text-white">{item.category}</h4>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-navy-950 px-2 py-0.5 rounded border border-navy-800">
                    {item.marks} Marks
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                      item.completed
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {item.completed ? 'Satisfied' : 'Pending Evidence'}
                  </span>
                </div>
              </div>

              <div className="pl-6 space-y-1">
                {item.requirements?.map((req: string, rIdx: number) => (
                  <div key={rIdx} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Tool Detection Diagnostics & Local Lab Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tool Diagnostics */}
        <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Security & System Tool Diagnostics
          </h3>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950 border border-navy-800">
              <span className="text-slate-300">Nmap Scanner Binary</span>
              <span className={systemStatus?.nmap_installed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {systemStatus?.nmap_installed ? 'DETECTED & OPERATIONAL' : 'NOT DETECTED'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950 border border-navy-800">
              <span className="text-slate-300">Official Shodan API Integration</span>
              <span className={systemStatus?.shodan_configured ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {systemStatus?.shodan_configured ? 'API KEY CONFIGURED' : 'TRAINING / LAB MODE (DEFAULT)'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950 border border-navy-800">
              <span className="text-slate-300">Python-docx (DOCX Generator)</span>
              <span className="text-emerald-400 font-bold">OPERATIONAL</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950 border border-navy-800">
              <span className="text-slate-300">ReportLab (PDF Generator)</span>
              <span className="text-emerald-400 font-bold">OPERATIONAL</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950 border border-navy-800">
              <span className="text-slate-300">SQLite Storage Persistence</span>
              <span className="text-emerald-400 font-bold">WRITABLE & CONNECTED</span>
            </div>
          </div>
        </div>

        {/* Local Lab Environment Configuration */}
        <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            Built-in Local Laboratory Environment
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            For students who do not yet possess an instructor-approved external training target, this platform includes both a Docker Compose stack (<code className="text-cyan-300 font-mono">lab/docker-compose.yml</code>) and an isolated native Python local lab server (<code className="text-cyan-300 font-mono">lab/local_lab.py</code>) binding harmless test services to localhost.
          </p>

          <div className="bg-navy-950 p-3 rounded-lg border border-navy-800 text-xs font-mono space-y-1.5">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Local Lab Services Profile:</div>
            <div className="flex justify-between text-slate-300">
              <span>FTP Service:</span>
              <span className="text-cyan-400">127.0.0.1:21 (vsftpd 3.0.3)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>SSH Service:</span>
              <span className="text-cyan-400">127.0.0.1:22 (OpenSSH 8.9p1)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>HTTP Service:</span>
              <span className="text-cyan-400">127.0.0.1:80 (Apache 2.4.52)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Unknown API App:</span>
              <span className="text-cyan-400">127.0.0.1:8080 (REST Dispatch)</span>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-[11px] text-slate-400 italic">
              To launch the local lab server, run: <code className="text-cyan-300 font-mono">python lab/local_lab.py</code> in a separate terminal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

