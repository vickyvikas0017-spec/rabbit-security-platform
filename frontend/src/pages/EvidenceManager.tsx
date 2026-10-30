import React, { useState, useEffect } from 'react';
import {
  Archive,
  Upload,
  Trash2,
  ExternalLink,
  Filter,
  FileCode,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Plus
} from 'lucide-react';
import { api } from '../services/api';

interface EvidenceProps {
  onRefresh: () => void;
}

export const EvidenceManager: React.FC<EvidenceProps> = ({ onRefresh }) => {
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTaskFilter, setSelectedTaskFilter] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    task_name: 'Task 1 – Target Identification',
    category: 'Target identification',
    title: '',
    description: '',
    command_run: '',
    meaning: '',
    why_it_matters: '',
    what_next: '',
  });
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const taskOptions = [
    'Task 1 – Target Identification',
    'Task 2 – Host & Port Discovery',
    'Task 3 – Attack Surface Mapping',
    'Task 4 – Service Enumeration',
    'Task 5 – FTP Security Assessment',
    'Task 6 – Enumeration Strategy',
    'Task 7 – Unknown Service Investigation',
    'Task 8 – Final Assessment',
  ];

  const categoryOptions = [
    'Target identification',
    'Port scanning',
    'Service enumeration',
    'FTP assessment',
    'Strategy',
    'Unknown service',
    'Final findings',
  ];

  useEffect(() => {
    loadEvidence();
  }, [selectedTaskFilter]);

  const loadEvidence = async () => {
    try {
      setLoading(true);
      const res = await api.listEvidence(selectedTaskFilter !== 'all' ? selectedTaskFilter : undefined);
      setEvidenceList(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title.trim()) {
      alert('Please provide an evidence title.');
      return;
    }

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('task_name', uploadForm.task_name);
      fd.append('category', uploadForm.category);
      fd.append('title', uploadForm.title);
      fd.append('description', uploadForm.description);
      fd.append('command_run', uploadForm.command_run);
      fd.append('meaning', uploadForm.meaning);
      fd.append('why_it_matters', uploadForm.why_it_matters);
      fd.append('what_next', uploadForm.what_next);
      if (fileToUpload) {
        fd.append('file', fileToUpload);
      }

      await api.uploadEvidence(fd);
      setShowUploadModal(false);
      setFileToUpload(null);
      setUploadForm({
        task_name: 'Task 1 – Target Identification',
        category: 'Target identification',
        title: '',
        description: '',
        command_run: '',
        meaning: '',
        why_it_matters: '',
        what_next: '',
      });
      await loadEvidence();
      onRefresh();
    } catch (e: any) {
      alert(`Upload error: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this evidence record?')) return;
    try {
      await api.deleteEvidence(id);
      await loadEvidence();
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="border-b border-navy-700/80 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Archive className="w-5 h-5 text-cyan-400" />
            Centralized Evidence Management System
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Maintain rigorous audit trails: Command, Output, Screenshot, What it means, Why it matters, and What was done next.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Attach New Evidence Artifact
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Filter by Task:</span>
          <select
            value={selectedTaskFilter}
            onChange={(e) => setSelectedTaskFilter(e.target.value)}
            className="bg-navy-950 border border-navy-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Assessment Tasks</option>
            {taskOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Total Attached Records: {evidenceList.length}
        </span>
      </div>

      {/* Evidence Cards Grid */}
      {evidenceList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evidenceList.map((ev) => (
            <div
              key={ev.id}
              className="bg-navy-900 border border-navy-700/80 rounded-xl p-4 shadow-lg space-y-3 flex flex-col justify-between hover:border-navy-600 transition"
            >
              <div className="space-y-2.5">
                {/* Top Badge Row */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-950 text-cyan-400 border border-navy-800">
                    {ev.task_name}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(ev.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition"
                      title="Delete Evidence"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                {ev.description && <p className="text-xs text-slate-300">{ev.description}</p>}

                {/* Command & Image Preview */}
                {ev.command_run && (
                  <div className="bg-navy-950 p-2 rounded-lg border border-navy-800 text-[10px] font-mono text-cyan-300 truncate">
                    <code>$ {ev.command_run}</code>
                  </div>
                )}

                {ev.file_path && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-navy-800 bg-navy-950 max-h-48 flex items-center justify-center">
                    {ev.file_path.match(/\.(png|jpe?g|gif|webp)$/i) ? (
                      <img
                        src={ev.file_path}
                        alt={ev.title}
                        className="object-contain w-full max-h-48"
                      />
                    ) : (
                      <div className="p-4 text-xs font-mono text-slate-400 flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-cyan-400" />
                        <span>Log / Text File: {ev.file_path}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 3 Pillars: What it means, Why it matters, What was done next */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-navy-800 text-[11px]">
                  <div className="bg-navy-950 p-2 rounded border border-navy-800/80">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-0.5">
                      What it means
                    </span>
                    <p className="text-slate-300 text-[10px] leading-tight">
                      {ev.meaning || 'N/A'}
                    </p>
                  </div>

                  <div className="bg-navy-950 p-2 rounded border border-navy-800/80">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">
                      Why it matters
                    </span>
                    <p className="text-slate-300 text-[10px] leading-tight">
                      {ev.why_it_matters || 'N/A'}
                    </p>
                  </div>

                  <div className="bg-navy-950 p-2 rounded border border-navy-800/80">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">
                      What was done next
                    </span>
                    <p className="text-slate-300 text-[10px] leading-tight">
                      {ev.what_next || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-navy-900 border border-dashed border-navy-700/80 rounded-xl p-12 text-center text-xs text-slate-500">
          <Archive className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <span>No evidence records found for the selected filter. Click 'Attach New Evidence Artifact' above to record screenshots, terminal outputs, and scan logs.</span>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-xl p-5 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-white">Attach New Evidence Artifact</h3>
            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Task Association</label>
                  <select
                    value={uploadForm.task_name}
                    onChange={(e) => setUploadForm({ ...uploadForm, task_name: e.target.value })}
                    className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {taskOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Evidence Category</label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Artifact Title</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="e.g. Nmap TCP Connect Scan Output / Shodan Discovery Screenshot"
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Executed Command (if applicable)</label>
                <input
                  type="text"
                  value={uploadForm.command_run}
                  onChange={(e) => setUploadForm({ ...uploadForm, command_run: e.target.value })}
                  placeholder="e.g. nmap -sT -Pn -p- -T3 127.0.0.1"
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Attach File / Screenshot (PNG, JPG, XML, LOG)</label>
                <input
                  type="file"
                  onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-cyan-600 file:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">What it means</label>
                <textarea
                  rows={2}
                  value={uploadForm.meaning}
                  onChange={(e) => setUploadForm({ ...uploadForm, meaning: e.target.value })}
                  placeholder="Technical interpretation of this evidence artifact..."
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Why it matters</label>
                <textarea
                  rows={2}
                  value={uploadForm.why_it_matters}
                  onChange={(e) => setUploadForm({ ...uploadForm, why_it_matters: e.target.value })}
                  placeholder="Security and risk relevance to Rabbit Pvt. Ltd..."
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">What was done next</label>
                <textarea
                  rows={2}
                  value={uploadForm.what_next}
                  onChange={(e) => setUploadForm({ ...uploadForm, what_next: e.target.value })}
                  placeholder="Next investigative action performed following this observation..."
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="bg-navy-800 text-slate-300 px-4 py-2 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-xs font-medium transition disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Save Evidence Artifact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

