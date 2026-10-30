import React, { useState } from 'react';
import { ShieldCheck, BookOpen, User, Users, Calendar, Save, Check } from 'lucide-react';
import { api } from '../services/api';

interface ProjectOverviewProps {
  projectData: any;
  onRefresh: () => void;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({ projectData, onRefresh }) => {
  const proj = projectData?.project || {};
  const [formData, setFormData] = useState({
    name: proj.name || 'Rabbit Pvt. Ltd. Security Assessment',
    client_name: proj.client_name || 'Rabbit Pvt. Ltd.',
    student_name: proj.student_name || 'Student Analyst',
    batch_team: proj.batch_team || 'CyberSec Minor Batch A',
    academic_year: proj.academic_year || '2025-2026',
    description: proj.description || 'Network Discovery, Information Gathering, Enumeration and FTP Security Testing',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateProject(formData);
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
    <div className="space-y-6 max-w-5xl">
      <div className="border-b border-navy-700/80 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          Project Overview & Academic Context
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Rabbit Pvt. Ltd. Cybersecurity Assessment Minor Project Specifications & Student Details
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Editable Student & Project Metadata */}
        <div className="md:col-span-2 bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center justify-between">
            <span>Assessment Metadata</span>
            <span className="text-[11px] text-cyan-400 font-mono">Editable Fields</span>
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  value={formData.student_name}
                  onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Batch / Team Name
                </label>
                <input
                  type="text"
                  value={formData.batch_team}
                  onChange={(e) => setFormData({ ...formData, batch_team: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Client / Organization
                </label>
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Project Title
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Project Scope & Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition disabled:opacity-50"
              >
                {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
                {saved ? 'Saved Successfully' : saving ? 'Saving...' : 'Update Assessment Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Key Tenets & Ethics */}
        <div className="space-y-4">
          <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Assessment Rules of Engagement
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span><b>Single Target Policy:</b> All 8 tasks operate strictly against ONE authorized target.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span><b>Explicit Written Permission:</b> Shodan search does not grant authorization. Written scope confirmation is required.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span><b>Conservative Scanning:</b> No intrusive DoS tests, no destructive scripts, conservative timing (-T3).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span><b>Non-Destructive Enumeration:</b> Only safe read-only protocol queries are permitted.</span>
              </li>
            </ul>
          </div>

          <div className="bg-navy-950 border border-navy-800 rounded-xl p-4 text-xs text-slate-400 space-y-2 font-mono">
            <div className="flex justify-between">
              <span>Frontend:</span>
              <span className="text-slate-200">React 18 + Vite + TS + Tailwind</span>
            </div>
            <div className="flex justify-between">
              <span>Backend:</span>
              <span className="text-slate-200">FastAPI + Python 3.13</span>
            </div>
            <div className="flex justify-between">
              <span>Database:</span>
              <span className="text-slate-200">SQLite (Persistent)</span>
            </div>
            <div className="flex justify-between">
              <span>Scanner:</span>
              <span className="text-slate-200">Nmap (Integrated)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

