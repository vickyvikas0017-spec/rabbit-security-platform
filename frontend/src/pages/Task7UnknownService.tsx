import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Play,
  Terminal,
  CheckCircle2,
  FileSearch,
  ChevronRight,
  ShieldAlert,
  Server,
  Layers,
  Info
} from 'lucide-react';
import { api } from '../services/api';

interface Task7Props {
  onRefresh: () => void;
  onNavigate: (section: string) => void;
}

export const Task7UnknownService: React.FC<Task7Props> = ({ onRefresh, onNavigate }) => {
  const [unknownData, setUnknownData] = useState<any>(null);
  const [selectedPort, setSelectedPort] = useState<number>(8080);
  const [investigating, setInvestigating] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadUnknownServices();
  }, []);

  const loadUnknownServices = async () => {
    try {
      const res = await api.getUnknownServices();
      setUnknownData(res);
      if (res?.services?.length > 0) {
        setSelectedPort(res.services[0].port);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleInvestigate = async () => {
    try {
      setInvestigating(true);
      const res = await api.investigateUnknown(selectedPort);
      setResult(res);
      onRefresh();
    } catch (e: any) {
      alert(`Investigation error: ${e.message}`);
    } finally {
      setInvestigating(false);
    }
  };

  const services = unknownData?.services || [];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="border-b border-navy-700/80 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            Task 7: Unknown / Unfamiliar Service Investigation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Investigate non-standard listening ports (e.g. 8080/tcp) safely using multi-stage protocol probes and banner capture.
          </p>
        </div>

        <button
          onClick={() => onNavigate('task8')}
          className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition self-start md:self-auto"
        >
          Proceed to Task 8 Final Assessment →
        </button>
      </div>

      {/* Grid: Service Selection & Investigation Trigger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Candidate Ports (4 cols) */}
        <div className="lg:col-span-4 bg-navy-900 border border-navy-700/80 rounded-xl p-4 shadow-lg space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Unfamiliar Candidate Services</span>
            <span className="text-[10px] text-cyan-400 font-mono">Triage</span>
          </h3>

          <div className="space-y-2">
            {services.map((s: any) => {
              const isSelected = selectedPort === s.port;
              return (
                <button
                  key={s.port}
                  onClick={() => setSelectedPort(s.port)}
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
                    <span className="text-[10px] bg-navy-900 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                      Non-Standard
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white">{s.service}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{s.reason}</div>
                </button>
              );
            })}
          </div>

          <div className="bg-navy-950 p-3 rounded-lg border border-navy-800 text-[11px] text-slate-400">
            <span className="text-cyan-400 font-bold block mb-1">Honest Reporting Policy:</span>
            If an external target has no unknown ports, the assessment allows documenting this finding honestly or evaluating port 8080 in the isolated local demonstration laboratory.
          </div>
        </div>

        {/* Right Column: Execution & Discovery Analysis (8 cols) */}
        <div className="lg:col-span-8 bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-navy-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Safe Multi-Stage Investigation Probe
              </h3>
              <p className="text-[11px] text-slate-400">
                Probing Target IP: <code className="text-cyan-300 font-mono">{unknownData?.target_ip}</code> on Port{' '}
                <code className="text-cyan-300 font-mono">{selectedPort}</code>
              </p>
            </div>

            <button
              onClick={handleInvestigate}
              disabled={investigating}
              className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {investigating ? 'Executing Probes...' : 'Execute Investigation'}
            </button>
          </div>

          {/* Results Display */}
          {result ? (
            <div className="space-y-4 text-xs">
              {/* Technology Identified Banner */}
              <div className="bg-navy-950 p-3.5 rounded-xl border border-navy-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">
                    Inferred Technology / Application
                  </span>
                  <span className="text-sm font-bold text-cyan-300">
                    {result.technology_identified || 'Custom Web Application / Gateway'}
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-medium">
                  Harmless Read-Only Audit
                </span>
              </div>

              {/* Raw Response Terminal */}
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                  Captured Banner / Raw Probe Output:
                </span>
                <div className="terminal-box rounded-lg p-3 text-[11px] text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed select-text">
                  {result.raw_response}
                </div>
              </div>

              {/* Technical Interpretation & Recommended Next Step */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-navy-950 p-3.5 rounded-lg border border-navy-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                    What Was Learned
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {result.interpretation}
                  </p>
                </div>

                <div className="bg-navy-950 p-3.5 rounded-lg border border-navy-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                    Recommended Next Action
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {result.next_recommended_action}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-navy-950 border border-dashed border-navy-800 rounded-lg p-8 text-center text-xs text-slate-500">
              <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <span>Select an unfamiliar port and click 'Execute Investigation' to run multi-stage protocol checks.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

