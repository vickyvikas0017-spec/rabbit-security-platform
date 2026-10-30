import React, { useState, useEffect } from 'react';
import {
  GitPullRequest,
  ArrowUpDown,
  Save,
  CheckCircle2,
  Sparkles,
  Info,
  ChevronUp,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

interface Task6Props {
  onRefresh: () => void;
  onNavigate: (section: string) => void;
}

export const Task6Strategy: React.FC<Task6Props> = ({ onRefresh, onNavigate }) => {
  const [scenarioNotice, setScenarioNotice] = useState<string>('');
  const [items, setItems] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadScenario();
  }, []);

  const loadScenario = async () => {
    try {
      const res = await api.getStrategyScenario();
      setScenarioNotice(res.scenario_notice || '');
      setItems(res.services || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    // Swap ranks
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    // Re-index ranks 1 to N
    newItems.forEach((it, idx) => {
      it.priority_rank = idx + 1;
    });

    setItems(newItems);
  };

  const handleUpdateField = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleApplySuggestedOrder = () => {
    // Sort by suggested_priority
    const sorted = [...items].sort((a, b) => (a.suggested_priority || 1) - (b.suggested_priority || 1));
    sorted.forEach((it, idx) => {
      it.priority_rank = idx + 1;
    });
    setItems(sorted);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.saveStrategy(items);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="border-b border-navy-700/80 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-cyan-400" />
            Task 6: Enumeration Strategy & Prioritization Challenge
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Analyze the standard six-service scenario, rank investigation priorities, and justify initial actions.
          </p>
        </div>

        <button
          onClick={() => onNavigate('task7')}
          className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition self-start md:self-auto"
        >
          Proceed to Task 7 Unknown Service →
        </button>
      </div>

      {/* Mandatory Scenario Notice Alert */}
      <div className="bg-navy-950 border border-cyan-800/80 p-4 rounded-xl flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-cyan-300 uppercase tracking-wider text-[11px]">
            Academic Scenario Isolation Disclaimer
          </p>
          <p className="text-slate-300 leading-relaxed">
            {scenarioNotice ||
              'IMPORTANT: These six services are provided as a standardized strategy scenario in the Rabbit Pvt. Ltd. assignment. Do not falsely report that all six were discovered on the actual target. Show actual target findings separately from scenario-based answers.'}
          </p>
        </div>
      </div>

      {/* Strategy Table & Controls */}
      <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-navy-800">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Scenario Investigation Priority Matrix
            </h3>
            <span className="text-[11px] text-slate-400">
              Use the arrow buttons to re-order priority rank or apply security recommendations.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApplySuggestedOrder}
              className="bg-navy-800 hover:bg-navy-700 text-cyan-300 border border-navy-700 text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Apply Suggested Security Order
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {saved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
              {saved ? 'Strategy Saved' : saving ? 'Saving...' : 'Save Completed Strategy'}
            </button>
          </div>
        </div>

        {/* Editable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-navy-800">
              <tr>
                <th className="p-3 w-16 text-center">Rank</th>
                <th className="p-3 w-28">Port</th>
                <th className="p-3 w-28">Service</th>
                <th className="p-3">Why Investigate First? (Justification)</th>
                <th className="p-3">First Enumeration Action</th>
                <th className="p-3 w-24 text-center">Re-Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {items.map((it, idx) => (
                <tr key={it.id || idx} className="hover:bg-navy-850/50">
                  <td className="p-3 text-center">
                    <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono font-bold flex items-center justify-center mx-auto text-xs">
                      {it.priority_rank}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-cyan-300">{it.port}</td>
                  <td className="p-3 font-semibold text-white">{it.service_name}</td>
                  <td className="p-3">
                    <textarea
                      rows={2}
                      value={it.why_explanation}
                      onChange={(e) => handleUpdateField(idx, 'why_explanation', e.target.value)}
                      className="w-full bg-navy-950 border border-navy-700 rounded p-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                    />
                  </td>
                  <td className="p-3">
                    <textarea
                      rows={2}
                      value={it.first_enumeration_action}
                      onChange={(e) => handleUpdateField(idx, 'first_enumeration_action', e.target.value)}
                      className="w-full bg-navy-950 border border-navy-700 rounded p-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleMove(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded bg-navy-950 hover:bg-navy-800 text-slate-300 hover:text-white disabled:opacity-30"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(idx, 'down')}
                        disabled={idx === items.length - 1}
                        className="p-1 rounded bg-navy-950 hover:bg-navy-800 text-slate-300 hover:text-white disabled:opacity-30"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Rationale Explanation Box */}
      <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
          Reasoning Behind Suggested Security Prioritization
        </h4>
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            <b>1. FTP (Port 21) & SMB (Port 445) First:</b> These protocols frequently suffer from unauthenticated anonymous access (null sessions or anonymous FTP logins), allowing an assessor to verify immediate high-impact information disclosure or sensitive file exposure with zero credentials.
          </p>
          <p>
            <b>2. HTTP (Port 80/8080) Second:</b> Web interfaces present the largest interactive application attack surface, including public headers, exposed administration consoles, and technology stack vulnerabilities.
          </p>
          <p>
            <b>3. SNMP (UDP 161) Third:</b> Simple Network Management Protocol with default community strings ('public') exposes full system metrics, process tables, and network interfaces.
          </p>
          <p>
            <b>4. SMTP (Port 25) & SSH (Port 22) Fourth/Fifth:</b> While crucial, standard SSH installations are strongly encrypted by default, and SMTP open relaying is less prevalent in modern hardened networks. Banner collection establishes version intelligence without immediate exploitability.
          </p>
        </div>
      </div>
    </div>
  );
};

