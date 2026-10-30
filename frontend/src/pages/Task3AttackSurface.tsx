import React, { useState, useEffect } from 'react';
import {
  Layers,
  Filter,
  AlertTriangle,
  HelpCircle,
  Save,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart3,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api } from '../services/api';

interface Task3Props {
  onRefresh: () => void;
  onNavigate: (section: string) => void;
}

export const Task3AttackSurface: React.FC<Task3Props> = ({ onRefresh, onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filterProto, setFilterProto] = useState<string>('all'); // all, tcp, udp
  const [filterPriority, setFilterPriority] = useState<string>('all'); // all, High, Medium, Low
  const [strategyAnswer, setStrategyAnswer] = useState<string>('');
  const [savedAnswer, setSavedAnswer] = useState(false);

  useEffect(() => {
    loadAttackSurface();
  }, []);

  const loadAttackSurface = async () => {
    try {
      setLoading(true);
      const res = await api.getAttackSurface();
      setData(res);
      if (res?.strategy_recommendation) {
        setStrategyAnswer(
          `Recommendation: Prioritize ${res.strategy_recommendation.recommended_first} because ${res.strategy_recommendation.reason}`
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePriority = async (portId: number, newPrio: string) => {
    try {
      await api.updatePort(portId, { priority: newPrio });
      await loadAttackSurface();
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveStrategy = () => {
    setSavedAnswer(true);
    setTimeout(() => setSavedAnswer(false), 2500);
  };

  const ports = data?.ports || [];

  // Filter logic
  const filteredPorts = ports.filter((p: any) => {
    if (filterProto !== 'all' && p.protocol.toLowerCase() !== filterProto.toLowerCase()) {
      return false;
    }
    if (filterPriority !== 'all' && p.priority !== filterPriority) {
      return false;
    }
    return true;
  });

  const PRIORITY_BADGES: Record<string, string> = {
    High: 'bg-rose-950 text-rose-400 border border-rose-800',
    Medium: 'bg-amber-950 text-amber-400 border border-amber-800',
    Low: 'bg-emerald-950 text-emerald-400 border border-emerald-800',
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="border-b border-navy-700/80 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Task 3: Attack Surface Mapping & Risk Prioritization
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Transform Nmap findings into an organized attack surface matrix with risk-based investigation priorities.
          </p>
        </div>

        <button
          onClick={() => onNavigate('task4')}
          className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition self-start md:self-auto"
        >
          Proceed to Task 4 Enumeration →
        </button>
      </div>

      {/* Visual Analytics */}
      {data?.charts && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-4 shadow-lg">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
              <span>Open Ports by Protocol</span>
              <span className="text-[10px] text-cyan-400 font-mono">TCP / UDP</span>
            </h4>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.charts.protocols}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.charts.protocols.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#00F0FF' : '#0072B2'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B132B',
                      borderColor: '#2A3656',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-4 shadow-lg">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
              <span>Investigation Priorities</span>
              <span className="text-[10px] text-rose-400 font-mono">Triage</span>
            </h4>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.priorities} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B132B',
                      borderColor: '#2A3656',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    <Cell fill="#F43F5E" />
                    <Cell fill="#F59E0B" />
                    <Cell fill="#10B981" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-4 shadow-lg">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
              <span>Discovered Services</span>
              <span className="text-[10px] text-cyan-400 font-mono">Signatures</span>
            </h4>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data.charts.services} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <XAxis type="number" stroke="#64748B" fontSize={10} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B132B',
                      borderColor: '#2A3656',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="count" fill="#00F0FF" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Filters:</span>

          {/* Protocol Filter */}
          <div className="flex bg-navy-950 p-0.5 rounded-lg border border-navy-800 text-xs">
            {['all', 'tcp', 'udp'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterProto(p)}
                className={`px-3 py-1 rounded-md uppercase font-mono font-medium transition ${
                  filterProto === p ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <div className="flex bg-navy-950 p-0.5 rounded-lg border border-navy-800 text-xs">
            {['all', 'High', 'Medium', 'Low'].map((prio) => (
              <button
                key={prio}
                onClick={() => setFilterPriority(prio)}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  filterPriority === prio
                    ? 'bg-navy-800 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {prio}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Displaying {filteredPorts.length} of {ports.length} mapped ports
        </span>
      </div>

      {/* Attack Surface Table */}
      <div className="bg-navy-900 border border-navy-700/80 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950 text-slate-300 font-mono uppercase text-[10px] tracking-wider border-b border-navy-800">
              <tr>
                <th className="p-3.5">IP</th>
                <th className="p-3.5">Port</th>
                <th className="p-3.5">Protocol</th>
                <th className="p-3.5">Service</th>
                <th className="p-3.5">Version</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">Reason for Priority</th>
                <th className="p-3.5 text-right">Triage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {filteredPorts.length > 0 ? (
                filteredPorts.map((p: any) => (
                  <tr key={p.id} className="hover:bg-navy-850/60 transition-colors">
                    <td className="p-3.5 font-mono text-cyan-300">{p.ip}</td>
                    <td className="p-3.5 font-mono font-bold text-white">{p.port}</td>
                    <td className="p-3.5 font-mono uppercase text-slate-400">{p.protocol}</td>
                    <td className="p-3.5 font-semibold text-slate-200">
                      <div>{p.service}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{p.purpose}</div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">{p.version || 'Unspecified'}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${PRIORITY_BADGES[p.priority]}`}>
                        {p.priority}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 max-w-xs">{p.reason}</td>
                    <td className="p-3.5 text-right">
                      <select
                        value={p.priority}
                        onChange={(e) => handleUpdatePriority(p.id, e.target.value)}
                        className="bg-navy-950 border border-navy-700 text-slate-200 text-[10px] rounded px-2 py-1 focus:outline-none"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No ports match the selected filter criteria. Execute a scan in Task 2 to populate attack surface.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategy Question Box */}
      <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <HelpCircle className="w-5 h-5" />
          <h3 className="text-sm font-bold text-white">
            Strategy Question: Limited Time Triage
          </h3>
        </div>

        <p className="text-xs text-slate-300 italic bg-navy-950 p-3 rounded-lg border border-navy-800">
          "If you discover five services but have limited time, which service will you investigate first and why?"
        </p>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Student Technical Reasoning (Editable response):
          </label>
          <textarea
            rows={3}
            value={strategyAnswer}
            onChange={(e) => setStrategyAnswer(e.target.value)}
            className="w-full bg-navy-950 border border-navy-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400">
            Auto-generated baseline from discovered services. Will be recorded in the final report.
          </span>
          <button
            onClick={handleSaveStrategy}
            className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition"
          >
            {savedAnswer ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
            {savedAnswer ? 'Saved to Assessment' : 'Save Strategy Answer'}
          </button>
        </div>
      </div>
    </div>
  );
};

