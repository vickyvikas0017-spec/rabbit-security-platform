import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Terminal, User, BookOpen } from 'lucide-react';

interface HeaderProps {
  projectData: any;
  currentSection: string;
}

export const Header: React.FC<HeaderProps> = ({ projectData }) => {
  const target = projectData?.target;
  const isAuthorized = target?.authorization_status === 'Authorized';
  const progress = projectData?.progress_percentage || 0;

  return (
    <header className="bg-navy-900 border-b border-navy-700/80 sticky top-0 z-40 px-6 py-3.5 backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Brand & Platform Title */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 tracking-wider uppercase">
                Enterprise Assessment
              </span>
              <span className="text-xs text-slate-400 font-mono">Rabbit Pvt. Ltd. Minor Project</span>
            </div>
            <h1 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
              RABBIT SECURITY ASSESSMENT PLATFORM
            </h1>
          </div>
        </div>

        {/* Right: Target Badge, Auth Status, Progress */}
        <div className="flex flex-wrap items-center gap-3.5">
          {/* Target Status Pill */}
          <div className="flex items-center space-x-2 bg-navy-950 border border-navy-700 px-3 py-1.5 rounded-md font-mono text-xs">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Target:</span>
            <span className="font-semibold text-cyan-300">
              {target?.ip_address || 'None Selected'}
            </span>
            {target?.is_local_lab && (
              <span className="bg-amber-950 text-amber-400 border border-amber-800 text-[10px] px-1.5 py-0.2 rounded font-sans">
                Lab Mode
              </span>
            )}
          </div>

          {/* Authorization Badge */}
          <div
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md border text-xs font-medium font-sans ${
              isAuthorized
                ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
                : 'bg-rose-950/70 border-rose-700 text-rose-300'
            }`}
          >
            {isAuthorized ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            )}
            <span>{isAuthorized ? 'Scope Authorized' : 'Authorization Required'}</span>
          </div>

          {/* Overall Progress */}
          <div className="hidden lg:flex items-center space-x-2 bg-navy-950 border border-navy-700 px-3 py-1.5 rounded-md">
            <span className="text-xs text-slate-400 font-medium">Progress:</span>
            <div className="w-24 bg-navy-800 rounded-full h-2 overflow-hidden border border-navy-700">
              <div
                className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-cyan-300">{progress}%</span>
          </div>

          {/* Student Profile Tag */}
          <div className="flex items-center space-x-2 text-xs text-slate-300 border-l border-navy-700 pl-3">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium hidden sm:inline">
              {projectData?.project?.student_name || 'Student Analyst'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

