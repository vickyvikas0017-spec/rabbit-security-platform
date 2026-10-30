import React, { useState, useEffect } from 'react';
import {
  Globe,
  Search,
  ShieldCheck,
  ShieldAlert,
  Server,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Check,
  Building,
  MapPin,
  Calendar,
  Layers
} from 'lucide-react';
import { api } from '../services/api';

interface Task1Props {
  onRefresh: () => void;
  onNavigate: (section: string) => void;
}

export const Task1TargetId: React.FC<Task1Props> = ({ onRefresh, onNavigate }) => {
  const [query, setQuery] = useState('port:21 vsftpd');
  const [apiKey, setApiKey] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchSource, setSearchSource] = useState<string>('');
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [authRecord, setAuthRecord] = useState<any>(null);

  // Authorization Form State
  const [authForm, setAuthForm] = useState({
    status: 'Authorized',
    auth_reference: 'RABBIT-AUTH-2026-LAB-01',
    scope_description: 'Strictly authorized single target IP evaluation for Rabbit Pvt. Ltd. Minor Project.',
    allowed_ports: '1-65535',
    testing_restrictions: 'Conservative rate limits, no Denial of Service, safe read-only enumeration, no brute force.',
    confirmed_by: 'Academic Instructor / Student Lead',
    legal_disclaimer_accepted: true,
  });

  const [savingAuth, setSavingAuth] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [selectionReason, setSelectionReason] = useState(
    'Designated authorized training laboratory target with exposed FTP and multi-tier application services for Minor Project evaluation.'
  );

  // Screenshot Upload State
  const [uploadingShot, setUploadingShot] = useState(false);
  const [shotUploaded, setShotUploaded] = useState(false);

  useEffect(() => {
    loadTarget();
  }, []);

  const loadTarget = async () => {
    try {
      const data = await api.getTarget();
      if (data?.target) {
        setSelectedTarget(data.target);
        if (data.authorization) {
          setAuthRecord(data.authorization);
          setAuthForm({
            status: data.authorization.status || 'Authorized',
            auth_reference: data.authorization.auth_reference || 'RABBIT-AUTH-2026-LAB-01',
            scope_description: data.authorization.scope_description || '',
            allowed_ports: data.authorization.allowed_ports || '1-65535',
            testing_restrictions: data.authorization.testing_restrictions || '',
            confirmed_by: data.authorization.confirmed_by || '',
            legal_disclaimer_accepted: data.authorization.legal_disclaimer_accepted || false,
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      setSearching(true);
      const res = await api.searchShodan(query, apiKey);
      setSearchResults(res.results || []);
      setSearchSource(res.source || '');
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectTarget = async (item: any) => {
    try {
      await api.selectTarget({
        ip_str: item.ip_str,
        hostname: item.hostnames?.[0] || 'rabbit-target.local',
        domain: item.domains?.[0] || 'local',
        org: item.org,
        isp: item.isp,
        country: item.country_name,
        city: item.city,
        selected_reason: selectionReason,
        is_local_lab: item.ip_str === '127.0.0.1' || item.ip_str === 'localhost',
      });
      await loadTarget();
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authForm.legal_disclaimer_accepted) {
      alert('You must accept the legal & scope disclaimer before proceeding.');
      return;
    }
    try {
      setSavingAuth(true);
      await api.updateAuthorization(authForm);
      setAuthSuccess(true);
      setTimeout(() => setAuthSuccess(false), 2500);
      await loadTarget();
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setSavingAuth(false);
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingShot(true);
      const fd = new FormData();
      fd.append('task_name', 'Task 1 – Target Identification');
      fd.append('category', 'Target identification');
      fd.append('title', `Shodan Target Discovery Screenshot - ${selectedTarget?.ip_address || 'Target'}`);
      fd.append('description', 'Official Shodan reconnaissance screenshot verifying host metadata, geolocation, and ports.');
      fd.append('meaning', 'Verifies external discovery posture and initial attack surface before scanning.');
      fd.append('why_it_matters', 'Documented reconnaissance evidence establishing initial target discovery.');
      fd.append('what_next', 'Proceeded to Task 2 active host discovery scanning.');
      fd.append('file', file);

      await api.uploadEvidence(fd);
      setShotUploaded(true);
      setTimeout(() => setShotUploaded(false), 3000);
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setUploadingShot(false);
    }
  };

  const isAuthorized = authRecord?.status === 'Authorized';

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="border-b border-navy-700/80 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            Task 1: Target Identification & Scope Authorization
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Identify training targets using Shodan, record strict authorization boundaries, and establish scope.
          </p>
        </div>

        {selectedTarget && (
          <div className="flex items-center space-x-2 bg-navy-900 border border-navy-700 px-3.5 py-1.5 rounded-lg text-xs">
            <span className="text-slate-400">Current Target:</span>
            <span className="font-mono font-bold text-cyan-400">{selectedTarget.ip_address}</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                isAuthorized ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}
            >
              {authRecord?.status || 'Pending'}
            </span>
          </div>
        )}
      </div>

      {/* Shodan Search Interface */}
      <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center justify-between">
          <span>Shodan Search Query Interface</span>
          <span className="text-[11px] text-cyan-400 font-mono">Official Shodan API Integration</span>
        </h3>

        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Shodan search query (e.g. 'port:21 vsftpd', 'apache 2.4', 'country:IN')..."
                className="w-full bg-navy-950 border border-navy-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="sm:w-64">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Shodan API Key (Optional / Env fallback)"
                className="w-full bg-navy-950 border border-navy-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={searching}
              className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              {searching ? 'Querying...' : 'Search Shodan'}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>
              Query suggestions:{' '}
              <button
                type="button"
                onClick={() => setQuery('port:21 vsftpd')}
                className="text-cyan-400 hover:underline mr-2"
              >
                port:21 vsftpd
              </button>
              <button
                type="button"
                onClick={() => setQuery('port:8080 tomcat')}
                className="text-cyan-400 hover:underline mr-2"
              >
                port:8080 tomcat
              </button>
              <button
                type="button"
                onClick={() => setQuery('org:"Rabbit Pvt Ltd"')}
                className="text-cyan-400 hover:underline"
              >
                org:"Rabbit Pvt Ltd"
              </button>
            </span>
            {searchSource && <span className="text-amber-400 font-mono">{searchSource}</span>}
          </div>
        </form>

        {/* Search Results Display */}
        {searchResults.length > 0 && (
          <div className="mt-5 space-y-3 pt-4 border-t border-navy-800">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold">Discovered Potential Targets ({searchResults.length}):</span>
              <span className="text-[11px] text-slate-400">Click "Select Target" to assign as primary assessment host</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {searchResults.map((item, idx) => {
                const isCurrent = selectedTarget?.ip_address === item.ip_str;
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-lg border flex flex-col justify-between transition-all ${
                      isCurrent
                        ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md'
                        : 'bg-navy-950/80 border-navy-800 hover:border-navy-600'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-cyan-300">{item.ip_str}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-cyan-900/80 text-cyan-300 px-1.5 py-0.2 rounded font-mono font-medium">
                            Active Target
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-300 space-y-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{item.org || 'Unspecified Org'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>
                            {item.city || 'N/A'}, {item.country_name || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="font-mono text-cyan-400">
                            Ports: {item.ports?.join(', ') || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {item.banners?.[0] && (
                        <div className="bg-navy-900 border border-navy-800 p-1.5 rounded text-[10px] font-mono text-slate-400 truncate">
                          {item.banners[0]}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-navy-800/80">
                      <button
                        onClick={() => handleSelectTarget(item)}
                        disabled={isCurrent}
                        className={`w-full py-1.5 px-3 rounded text-xs font-medium transition ${
                          isCurrent
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800 cursor-default'
                            : 'bg-navy-800 hover:bg-cyan-600 text-slate-200 hover:text-white border border-navy-700'
                        }`}
                      >
                        {isCurrent ? 'Selected Target' : 'Select Target'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Target Selection Sheet & Authorization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Target Selection Sheet */}
        <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Target Selection Sheet</span>
            <span className="text-[11px] text-cyan-400 font-mono">Formal Record</span>
          </h3>

          {selectedTarget ? (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-navy-950 p-3 rounded-lg border border-navy-800 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">TARGET IP</span>
                  <span className="text-cyan-300 font-bold">{selectedTarget.ip_address}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">HOSTNAME</span>
                  <span className="text-slate-200">{selectedTarget.hostname || 'None'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ORGANIZATION</span>
                  <span className="text-slate-200">{selectedTarget.org || 'Rabbit Assessment'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ISP / NETWORK</span>
                  <span className="text-slate-200">{selectedTarget.isp || 'Internal Subnet'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Reason for Target Selection:
                </label>
                <textarea
                  rows={2}
                  value={selectionReason}
                  onChange={(e) => setSelectionReason(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              {/* Screenshot Upload Facility */}
              <div className="pt-2 border-t border-navy-800">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Upload Shodan Discovery Evidence Screenshot:
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 bg-navy-950 hover:bg-navy-800 border border-dashed border-navy-600 rounded-lg p-2.5 flex items-center justify-center gap-2 cursor-pointer transition">
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-slate-300">
                      {uploadingShot ? 'Uploading...' : 'Choose PNG/JPG Screenshot'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      disabled={uploadingShot}
                      className="hidden"
                    />
                  </label>
                </div>
                {shotUploaded && (
                  <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Screenshot attached to Evidence Manager!
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-navy-950 border border-dashed border-navy-800 rounded-lg p-8 text-center text-xs text-slate-400">
              <Globe className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <span>No target selected yet. Please use the search interface above.</span>
            </div>
          )}
        </div>

        {/* Right: Mandatory Scope & Authorization Verification Form */}
        <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Authorization & Scope Verification
            </h3>
            <span
              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                isAuthorized ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}
            >
              {authRecord?.status || 'Pending'}
            </span>
          </div>

          <div className="bg-amber-950/40 border border-amber-800/80 p-3 rounded-lg text-xs text-amber-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[11px] uppercase tracking-wider">Mandatory Ethical Restriction</p>
              <p className="text-[11px] text-amber-300 mt-0.5">
                Shodan discovery does NOT establish legal authorization. You must confirm this target is your own system, an approved training lab, or a system with explicit written testing scope before scanning is unlocked.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveAuth} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Authorization Status</label>
                <select
                  value={authForm.status}
                  onChange={(e) => setAuthForm({ ...authForm, status: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Authorized">Authorized</option>
                  <option value="Pending">Pending</option>
                  <option value="Denied">Denied</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Authorization Reference</label>
                <input
                  type="text"
                  value={authForm.auth_reference}
                  onChange={(e) => setAuthForm({ ...authForm, auth_reference: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Scope Description</label>
              <input
                type="text"
                value={authForm.scope_description}
                onChange={(e) => setAuthForm({ ...authForm, scope_description: e.target.value })}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Allowed Ports</label>
                <input
                  type="text"
                  value={authForm.allowed_ports}
                  onChange={(e) => setAuthForm({ ...authForm, allowed_ports: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Confirmed By</label>
                <input
                  type="text"
                  value={authForm.confirmed_by}
                  onChange={(e) => setAuthForm({ ...authForm, confirmed_by: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Testing Restrictions</label>
              <input
                type="text"
                value={authForm.testing_restrictions}
                onChange={(e) => setAuthForm({ ...authForm, testing_restrictions: e.target.value })}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={authForm.legal_disclaimer_accepted}
                  onChange={(e) => setAuthForm({ ...authForm, legal_disclaimer_accepted: e.target.checked })}
                  className="mt-0.5 rounded border-navy-700 bg-navy-950 text-cyan-500 focus:ring-0"
                />
                <span className="text-[11px] text-slate-300">
                  I confirm that testing will strictly adhere to safe, read-only rules of engagement against this authorized target.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-2">
              {authSuccess && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Authorization Verified!
                </span>
              )}
              <div className="ml-auto flex gap-2">
                <button
                  type="submit"
                  disabled={savingAuth}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {savingAuth ? 'Recording...' : 'Confirm Authorization Record'}
                </button>
                {isAuthorized && (
                  <button
                    type="button"
                    onClick={() => onNavigate('task2')}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4 py-2 rounded-lg font-medium transition"
                  >
                    Proceed to Task 2 →
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

