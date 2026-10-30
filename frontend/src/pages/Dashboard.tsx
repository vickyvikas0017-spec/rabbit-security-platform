import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Server,
  Layers,
  FileCheck2,
  AlertTriangle,
  PlayCircle,
  ExternalLink,
  ChevronRight,
  Database
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

interface DashboardProps {
  onNavigate: (sectionId: string) => void;
  projectData: any;
  onRefresh: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, projectData, onRefresh }) => {
  const [attackSurface, setAttackSurface] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getAttackSurface();
      setAttackSurface(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const target = projectData?.target;
  const metrics = projectData?.metrics || {};
  const tasks = projectData?.tasks_status || {};
  const isAuthorized = target?.authorization_status === 'Authorized';

  // Chart data
  const protocolData = attackSurface?.charts?.protocols?.length
    ? attackSurface.charts.protocols
    : [{ name: 'TCP', value: metrics.tcp_ports || 5 }];

  const priorityData = attackSurface?.charts?.priorities?.length
    ? attackSurface.charts.priorities
    : [
        { name: 'High', value: 3 },
        { name: 'Medium', value: 2 },
        { name: 'Low', value: 1 },
      ];

  const serviceData = attackSurface?.charts?.services?.length
    ? attackSurface.charts.services
    : [
        { name: 'FTP', count: 1 },
        { name: 'SSH', count: 1 },
        { name: 'SMTP', count: 1 },
        { name: 'HTTP', count: 1 },
        { name: 'SMB', count: 1 },
      ];

  const PRIORITY_COLORS: Record<string, string> = {
    High: '#F43F5E',
    Medium: '#F59E0B',
    Low: '#10B981',
  };

  const PROTO_COLORS = ['#00F0FF', '#0072B2', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Top Banner: Project Title and Target Status */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-navy-700/80 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Rabbit Pvt. Ltd. Minor Project
              </span>
              <span className="text-xs text-slate-400 font-mono">Single Integrated Workflow</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Network Discovery, Information Gathering, Enumeration & FTP Testing
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Consolidated college-level practical cybersecurity assessment platform encompassing
              passive Shodan identification, active Nmap discovery, attack-surface modeling,
              deep protocol enumeration, and professional 13-section report generation.
            </p>
          </div>

          {/* Quick Target Action Card */}
          <div className="bg-navy-950/80 border border-navy-700 p-4 rounded-lg flex flex-col gap-2 min-w-[280px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Primary Target:</span>
              <span className="font-mono font-bold text-cyan-300">
                {target?.ip_address || 'Not Selected'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Authorization:</span>
              <span
                className={`font-semibold ${
                  isAuthorized ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {target?.authorization_status || 'Pending'}
              </span>
            </div>
            <div className="pt-2 border-t border-navy-800 flex gap-2">
              <button
                onClick={() => onNavigate('task1')}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs py-1.5 px-3 rounded font-medium flex items-center justify-center gap-1 transition"
              >
                {target ? 'Modify Scope' : 'Select Target'}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('report')}
                className="bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-600 text-xs py-1.5 px-3 rounded font-medium flex items-center justify-center gap-1 transition"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-4 flex flex-col">
          <span className="text-xs text-slate-400 font-medium">Tasks Completed</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold font-mono text-cyan-300">
              {projectData?.completed_count || 0}
            </span>
            <span className="text-xs text-slate-400">/ 8</span>
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 font-mono">
            {projectData?.progress_percentage || 0}% finished
          </span>
        </div>

        <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-4 flex flex-col">
          <span className="text-xs text-slate-400 font-medium">Open TCP Ports</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold font-mono text-white">
              {metrics.tcp_ports || 0}
            </span>
            <span className="text-xs text-cyan-400 font-mono">TCP</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Discovered via Nmap</span>
        </div>

        <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-4 flex flex-col">
          <span className="text-xs text-slate-400 font-medium">Discovered Services</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold font-mono text-white">
              {metrics.services_count || 0}
            </span>
            <span className="text-xs text-slate-400">Mapped</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Ready for enum</span>
        </div>

        <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-4 flex flex-col">
          <span className="text-xs text-slate-400 font-medium">Security Findings</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold font-mono text-amber-400">
              {metrics.findings_count || 0}
            </span>
            <span className="text-xs text-slate-400">Logged</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Risk classified</span>
        </div>

        <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-4 flex flex-col">
          <span className="text-xs text-slate-400 font-medium">Evidence Files</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold font-mono text-cyan-300">
              {metrics.evidence_count || 0}
            </span>
            <span className="text-xs text-slate-400">Preserved</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Terminal logs/shots</span>
        </div>

        <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-4 flex flex-col">
          <span className="text-xs text-slate-400 font-medium">Target Mode</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-sm font-bold font-mono text-emerald-400">
              {target?.is_local_lab ? 'Local Lab' : 'Authorized IP'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 truncate">
            {target?.org || 'Rabbit Assessment'}
          </span>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Protocol Distribution */}
        <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center justify-between">
            <span>Ports by Protocol</span>
            <span className="text-[11px] text-cyan-400 font-mono">Task 3 Analysis</span>
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={protocolData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {protocolData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PROTO_COLORS[index % PROTO_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B132B',
                    borderColor: '#2A3656',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Investigation Priority */}
        <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center justify-between">
            <span>Investigation Priorities</span>
            <span className="text-[11px] text-cyan-400 font-mono">Risk Level</span>
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B132B',
                    borderColor: '#2A3656',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry: any, index: number) => (
                    <Cell key={`bar-${index}`} fill={PRIORITY_COLORS[entry.name] || '#38BDF8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Discovered Services Summary */}
        <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center justify-between">
            <span>Discovered Services</span>
            <span className="text-[11px] text-cyan-400 font-mono">Nmap -sV</span>
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={serviceData}
                margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
              >
                <XAxis type="number" stroke="#64748B" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B132B',
                    borderColor: '#2A3656',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#00F0FF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Launchpad & Workflow Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate('task1')}
          className="bg-navy-900 hover:bg-navy-850 border border-navy-700/80 p-4 rounded-xl text-left transition flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between text-cyan-400 mb-2">
              <span className="text-[10px] font-mono uppercase font-bold">Step 1</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
            <h4 className="text-sm font-bold text-white">Target Identification</h4>
            <p className="text-xs text-slate-400 mt-1">
              Shodan API search & formal target authorization recording.
            </p>
          </div>
          <span
            className={`text-[11px] mt-4 font-medium ${
              tasks.task1 ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {tasks.task1 ? '✓ Authorized & Configured' : '● Action Required'}
          </span>
        </button>

        <button
          onClick={() => onNavigate('task2')}
          className="bg-navy-900 hover:bg-navy-850 border border-navy-700/80 p-4 rounded-xl text-left transition flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between text-cyan-400 mb-2">
              <span className="text-[10px] font-mono uppercase font-bold">Step 2</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
            <h4 className="text-sm font-bold text-white">Nmap Discovery Scans</h4>
            <p className="text-xs text-slate-400 mt-1">
              Basic, full TCP, service detection & OS fingerprinting.
            </p>
          </div>
          <span
            className={`text-[11px] mt-4 font-medium ${
              tasks.task2 ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            {tasks.task2 ? '✓ Scans Completed' : '○ Ready to Execute'}
          </span>
        </button>

        <button
          onClick={() => onNavigate('task5')}
          className="bg-navy-900 hover:bg-navy-850 border border-navy-700/80 p-4 rounded-xl text-left transition flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between text-cyan-400 mb-2">
              <span className="text-[10px] font-mono uppercase font-bold">Step 5</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
            <h4 className="text-sm font-bold text-white">FTP Security Audit</h4>
            <p className="text-xs text-slate-400 mt-1">
              Anonymous login, listing, harmless download & controlled upload.
            </p>
          </div>
          <span
            className={`text-[11px] mt-4 font-medium ${
              tasks.task5 ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            {tasks.task5 ? '✓ Audited' : '○ Ready for Assessment'}
          </span>
        </button>

        <button
          onClick={() => onNavigate('report')}
          className="bg-navy-900 hover:bg-navy-850 border border-navy-700/80 p-4 rounded-xl text-left transition flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between text-cyan-400 mb-2">
              <span className="text-[10px] font-mono uppercase font-bold">Delivery</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
            <h4 className="text-sm font-bold text-white">Generate 13-Sec Report</h4>
            <p className="text-xs text-slate-400 mt-1">
              Compliant DOCX and PDF academic assessment reports.
            </p>
          </div>
          <span className="text-[11px] mt-4 font-medium text-cyan-400">
            One-Click Export Available
          </span>
        </button>
      </div>
    </div>
  );
};

