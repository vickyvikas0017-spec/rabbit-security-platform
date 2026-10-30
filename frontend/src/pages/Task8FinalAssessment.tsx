import React, { useState, useEffect } from 'react';
import {
  Award,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Plus,
  FileText,
  ChevronRight,
  TrendingUp,
  FileDown
} from 'lucide-react';
import { api } from '../services/api';

interface Task8Props {
  onRefresh: () => void;
  onNavigate: (section: string) => void;
}

export const Task8FinalAssessment: React.FC<Task8Props> = ({ onRefresh, onNavigate }) => {
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFinding, setNewFinding] = useState({
    title: '',
    affected_port: '80/tcp',
    severity: 'Medium',
    verification_status: 'Confirmed',
    technical_explanation: '',
    impact: '',
    remediation: '',
    task_source: 'Task 8 – Final Assessment',
  });

  const [finalized, setFinalized] = useState(false);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const res = await api.getFinalSummary();
      setSummaryData(res);
      onRefresh(); // Instantly update header, sidebar, and workflow progress bar
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    setFinalized(true);
    await loadSummary();
    onRefresh();
    setTimeout(() => setFinalized(false), 3000);
  };

  const handleCreateFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createFinding(newFinding);
      setShowAddModal(false);
      setNewFinding({
        title: '',
        affected_port: '80/tcp',
        severity: 'Medium',
        verification_status: 'Confirmed',
        technical_explanation: '',
        impact: '',
        remediation: '',
        task_source: 'Task 8 – Final Assessment',
      });
      await loadSummary();
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const findings = summaryData?.findings || [];
  const stats = summaryData?.statistics || {};
  const sevs = stats.severity_counts || {};

  const SEV_BADGES: Record<string, string> = {
    Critical: 'bg-rose-950 text-rose-400 border border-rose-800',
    High: 'bg-rose-900/60 text-rose-300 border border-rose-700',
    Medium: 'bg-amber-950 text-amber-400 border border-amber-800',
    Low: 'bg-blue-950 text-blue-400 border border-blue-800',
    Informational: 'bg-slate-800 text-slate-300 border border-slate-700',
  };

  const VERIFY_BADGES: Record<string, string> = {
    Confirmed: 'text-emerald-400 bg-emerald-950/80 border-emerald-800',
    'Potential weakness': 'text-amber-400 bg-amber-950/80 border-amber-800',
    Informational: 'text-slate-400 bg-navy-950 border-navy-700',
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="border-b border-navy-700/80 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            Task 8: Final Mini Security Assessment Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Consolidate findings across all seven precursor tasks into a verified findings matrix and technical conclusion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleFinalize}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3.5 py-2 rounded-lg font-medium flex items-center gap-1.5 transition shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            {finalized ? 'Assessment Verified!' : 'Confirm & Finalize Task 8'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 text-xs px-3.5 py-2 rounded-lg font-medium flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            Add Finding
          </button>
          <button
            onClick={() => onNavigate('report')}
            className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition"
          >
            <FileText className="w-3.5 h-3.5" />
            Generate Report →
          </button>
        </div>
      </div>

      {/* Aggregate Pipeline Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-navy-900 border border-navy-700/80 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Target Scope</span>
          <span className="text-sm font-bold text-cyan-300 font-mono truncate block mt-1">
            {summaryData?.target?.ip_address || '127.0.0.1'}
          </span>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">
            {summaryData?.target?.auth_status || 'Authorized'}
          </span>
        </div>

        <div className="bg-navy-900 border border-navy-700/80 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Scans Run (Task 2)</span>
          <span className="text-xl font-bold font-mono text-white block mt-0.5">
            {stats.scans_executed || 0}
          </span>
          <span className="text-[10px] text-slate-400">Nmap Sessions</span>
        </div>

        <div className="bg-navy-900 border border-navy-700/80 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Ports Mapped (Task 3)</span>
          <span className="text-xl font-bold font-mono text-white block mt-0.5">
            {stats.ports_discovered || 0}
          </span>
          <span className="text-[10px] text-cyan-400">Attack Surface</span>
        </div>

        <div className="bg-navy-900 border border-navy-700/80 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Services Audited (Task 4)</span>
          <span className="text-xl font-bold font-mono text-white block mt-0.5">
            {stats.services_enumerated || 0}
          </span>
          <span className="text-[10px] text-emerald-400">Safe Probes</span>
        </div>

        <div className="bg-navy-900 border border-navy-700/80 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">High/Crit Vulnerabilities</span>
          <span className="text-xl font-bold font-mono text-rose-400 block mt-0.5">
            {(sevs.Critical || 0) + (sevs.High || 0)}
          </span>
          <span className="text-[10px] text-rose-300">Triage Action</span>
        </div>

        <div className="bg-navy-900 border border-navy-700/80 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Evidence Collected</span>
          <span className="text-xl font-bold font-mono text-cyan-300 block mt-0.5">
            {stats.evidence_count || 0}
          </span>
          <span className="text-[10px] text-slate-400">Artifacts</span>
        </div>
      </div>

      {/* Findings Matrix Section */}
      <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-navy-800">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Technical Security Findings
            </h3>
            <span className="text-[11px] text-slate-400">
              Clear distinction between verified weaknesses, potential observations, and informational records.
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 text-[10px]">
              High: {sevs.High || 0}
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 text-[10px]">
              Medium: {sevs.Medium || 0}
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 text-[10px]">
              Low: {sevs.Low || 0}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {findings.map((f: any) => (
            <div
              key={f.id}
              className="bg-navy-950 border border-navy-800 rounded-xl p-4 space-y-3 hover:border-navy-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${SEV_BADGES[f.severity] || SEV_BADGES.Medium}`}>
                    {f.severity}
                  </span>
                  <h4 className="text-sm font-bold text-white">{f.title}</h4>
                </div>

                <div className="flex items-center space-x-2 text-[11px]">
                  <span className="font-mono text-cyan-300">
                    {f.affected_ip}:{f.affected_port}
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${VERIFY_BADGES[f.verification_status] || VERIFY_BADGES['Potential weakness']}`}>
                    {f.verification_status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                    Technical Explanation
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {f.technical_explanation}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-amber-400 font-bold block">
                    Security Impact
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {f.impact}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold block">
                    Remediation
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {f.remediation}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-navy-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Task Source: {f.task_source}</span>
                <span>Audit Verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final Technical Conclusion */}
      <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          Final Technical Conclusion (Based on Collected Evidence)
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed bg-navy-950 p-4 rounded-xl border border-navy-800">
          {summaryData?.conclusion ||
            'The comprehensive security assessment against the authorized target identified key service listening interfaces. Safe read-only enumeration verified that remediating cleartext protocols and enforcing modern cryptographic standards will substantially mitigate risk across the organization perimeter.'}
        </p>
      </div>

      {/* Add Finding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-xl p-5 max-w-lg w-full space-y-4">
            <h3 className="text-sm font-bold text-white">Add Security Finding</h3>
            <form onSubmit={handleCreateFinding} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Finding Title</label>
                <input
                  type="text"
                  value={newFinding.title}
                  onChange={(e) => setNewFinding({ ...newFinding, title: e.target.value })}
                  placeholder="e.g. Insecure SNMP Community String Configured"
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Affected Port</label>
                  <input
                    type="text"
                    value={newFinding.affected_port}
                    onChange={(e) => setNewFinding({ ...newFinding, affected_port: e.target.value })}
                    className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Severity</label>
                  <select
                    value={newFinding.severity}
                    onChange={(e) => setNewFinding({ ...newFinding, severity: e.target.value })}
                    className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Informational">Informational</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Technical Explanation</label>
                <textarea
                  rows={2}
                  value={newFinding.technical_explanation}
                  onChange={(e) => setNewFinding({ ...newFinding, technical_explanation: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Impact</label>
                <textarea
                  rows={2}
                  value={newFinding.impact}
                  onChange={(e) => setNewFinding({ ...newFinding, impact: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Remediation</label>
                <textarea
                  rows={2}
                  value={newFinding.remediation}
                  onChange={(e) => setNewFinding({ ...newFinding, remediation: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-navy-800 text-slate-300 px-4 py-2 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-xs font-medium"
                >
                  Save Finding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

