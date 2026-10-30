import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Globe,
  Radio,
  Layers,
  Network,
  FolderLock,
  GitPullRequest,
  HelpCircle,
  Award,
  Archive,
  FileText,
  Sliders,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

interface SidebarProps {
  currentSection: string;
  onSelectSection: (section: string) => void;
  tasksStatus: any;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  tasksStatus = {},
}) => {
  const navItems = [
    { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
    { id: 'overview', label: '2. Project Overview', icon: FileSpreadsheet },
    { id: 'task1', label: '3. Task 1 – Target ID', icon: Globe, taskKey: 'task1' },
    { id: 'task2', label: '4. Task 2 – Discovery', icon: Radio, taskKey: 'task2' },
    { id: 'task3', label: '5. Task 3 – Attack Surface', icon: Layers, taskKey: 'task3' },
    { id: 'task4', label: '6. Task 4 – Service Enum', icon: Network, taskKey: 'task4' },
    { id: 'task5', label: '7. Task 5 – FTP Security', icon: FolderLock, taskKey: 'task5' },
    { id: 'task6', label: '8. Task 6 – Strategy', icon: GitPullRequest, taskKey: 'task6' },
    { id: 'task7', label: '9. Task 7 – Unknown Service', icon: HelpCircle, taskKey: 'task7' },
    { id: 'task8', label: '10. Task 8 – Final Assessment', icon: Award, taskKey: 'task8' },
    { id: 'evidence', label: '11. Evidence Manager', icon: Archive },
    { id: 'report', label: '12. Final Report (13-Sec)', icon: FileText },
    { id: 'settings', label: '13. Settings & Marking', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-navy-900 border-r border-navy-700/80 flex flex-col flex-shrink-0 min-h-[calc(100vh-65px)]">
      <div className="p-4 border-b border-navy-800">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Assessment Workflow
        </p>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          const isDone = item.taskKey ? tasksStatus[item.taskKey] : false;

          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-navy-800/80 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-cyan-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.taskKey && (
                <div className="ml-2 flex-shrink-0">
                  {isDone ? (
                    <span title="Completed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </span>
                  ) : (
                    <span title="Pending">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="p-3.5 border-t border-navy-800 bg-navy-950/60 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span>Active Scope:</span>
          <span className="text-cyan-400 font-mono">Single Target</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Standard:</span>
          <span className="text-slate-300">50-Mark Rubric</span>
        </div>
      </div>
    </aside>
  );
};

