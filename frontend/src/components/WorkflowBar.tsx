import React from 'react';
import { ArrowRight, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

interface WorkflowBarProps {
  tasksStatus: any;
  onNavigate: (sectionId: string) => void;
}

export const WorkflowBar: React.FC<WorkflowBarProps> = ({ tasksStatus = {}, onNavigate }) => {
  const steps = [
    { id: 'task1', label: '1. Target ID', key: 'task1' },
    { id: 'task2', label: '2. Nmap Discovery', key: 'task2' },
    { id: 'task3', label: '3. Attack Surface', key: 'task3' },
    { id: 'task4', label: '4. Service Enum', key: 'task4' },
    { id: 'task5', label: '5. FTP Security', key: 'task5' },
    { id: 'task6', label: '6. Strategy', key: 'task6' },
    { id: 'task7', label: '7. Unknown Service', key: 'task7' },
    { id: 'task8', label: '8. Final Assessment', key: 'task8' },
  ];

  return (
    <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-4 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <span>Integrated Assessment Pipeline (8 Tasks)</span>
        </h3>
        <span className="text-[11px] text-cyan-400 font-mono">
          Single Unified Workflow • Selected Target
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {steps.map((step, idx) => {
          const isDone = tasksStatus[step.key];
          // Task 2+ is blocked if Task 1 is not done
          const isBlocked = step.key !== 'task1' && !tasksStatus.task1;

          return (
            <button
              key={step.id}
              onClick={() => onNavigate(step.id)}
              className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all ${
                isDone
                  ? 'bg-emerald-950/40 border-emerald-700/60 hover:bg-emerald-900/40 text-emerald-200'
                  : isBlocked
                  ? 'bg-navy-950/50 border-navy-800 text-slate-500 opacity-60'
                  : 'bg-navy-800/80 border-navy-700 hover:border-cyan-500/50 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[10px] font-mono font-semibold uppercase text-slate-400">
                  Step 0{idx + 1}
                </span>
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isBlocked ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500/70" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                )}
              </div>
              <span className="text-xs font-bold truncate w-full">{step.label}</span>
              <span className="text-[10px] mt-0.5 text-slate-400">
                {isDone ? 'Completed' : isBlocked ? 'Requires Auth' : 'Pending'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

