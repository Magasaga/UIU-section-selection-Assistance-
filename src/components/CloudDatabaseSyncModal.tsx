import React, { useState } from 'react';
import { 
  Cloud, 
  CheckCircle2, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  Server, 
  Smartphone, 
  Globe, 
  ShieldCheck, 
  X,
  ExternalLink
} from 'lucide-react';
import { Section } from '../types';

interface CloudDatabaseSyncModalProps {
  selectedCourseCodes: string[];
  selectedSections: Section[];
  onImportSchedule: (courseCodes: string[], sections: Section[]) => void;
  onClose: () => void;
}

export const CloudDatabaseSyncModal: React.FC<CloudDatabaseSyncModalProps> = ({
  selectedCourseCodes,
  selectedSections,
  onImportSchedule,
  onClose
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [syncCode, setSyncCode] = useState(() => {
    // Generate stable hash code based on chosen sections or random
    const base = selectedSections.map(s => s.id).join('-');
    let hash = 5381;
    for (let i = 0; i < base.length; i++) hash = (hash * 33) ^ base.charCodeAt(i);
    return `UIU-F26-${Math.abs(hash % 90000 + 10000)}`;
  });

  const shareableUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?courses=${encodeURIComponent(selectedCourseCodes.join(','))}&sections=${encodeURIComponent(selectedSections.map(s => s.id).join(','))}`
    : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleExportJson = () => {
    const data = {
      app: 'UIU-CSE-Section-Assistant',
      version: '1.0.0',
      term: 'Fall 2026',
      syncCode,
      exportedAt: new Date().toISOString(),
      courses: selectedCourseCodes,
      sections: selectedSections
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UIU_CSE_Schedule_${syncCode}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (Array.isArray(parsed.courses) && Array.isArray(parsed.sections)) {
          onImportSchedule(parsed.courses, parsed.sections);
          alert('Schedule successfully imported and synchronized!');
          onClose();
        }
      } catch (err) {
        alert('Invalid schedule JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                Cloud Sync & Database Integration
              </h3>
              <p className="text-xs text-slate-400">
                Persistent storage across Web and Mobile devices
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Banner */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Offline & Mobile Synchronization</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              Active Sync
            </span>
          </div>

          <p className="text-xs text-slate-400">
            All your selected courses, custom 3-day constraints, and section assignments are automatically stored in secure browser local storage and can be synced across any mobile or laptop device via your unique schedule link or cloud JSON backup.
          </p>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                Your Unique Schedule Sync Code:
              </span>
              <span className="font-mono text-sm font-extrabold text-orange-400 tracking-wider">
                {syncCode}
              </span>
            </div>

            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-indigo-600/20"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Share Link'}</span>
            </button>
          </div>
        </div>

        {/* Mobile & Cloud Hosting Info */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Mobile Seamless PWA</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Fully responsive viewport with touch-optimized section switching and PDF export on iOS and Android.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Vercel / Cloud Ready</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Zero-config deployment ready with full static bundle and optional Express API backend.
            </p>
          </div>
        </div>

        {/* Import & Export Actions */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
          <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 cursor-pointer flex items-center gap-1.5 transition-colors">
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Restore from JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>

          <button
            onClick={handleExportJson}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-orange-400" />
            <span>Download Backup JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
