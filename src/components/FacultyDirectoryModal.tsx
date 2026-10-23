import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Star, 
  X,
  AlertTriangle
} from 'lucide-react';
import { allFacultyRatings } from '../utils/courseData';

interface FacultyDirectoryProps {
  theme: 'light' | 'dark';
  onClose?: () => void;
  isModal?: boolean;
}

export const FacultyDirectory: React.FC<FacultyDirectoryProps> = ({
  theme,
  onClose,
  isModal = false
}) => {
  const isLight = theme === 'light';
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'teaching' | 'workload'>('rating');

  const filteredFaculty = allFacultyRatings
    .filter(f => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return f.name.toLowerCase().includes(q) || (f.designation && f.designation.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (sortBy === 'rating') {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return (b.reviews || 0) - (a.reviews || 0);
      }
      if (sortBy === 'teaching') return (b.teaching || 0) - (a.teaching || 0);
      if (sortBy === 'workload') return (b.workload || 0) - (a.workload || 0);
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl p-5 border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-800/80 border-slate-700/80 shadow-xl'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Faculty Directory
            </h2>
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
              isLight ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-indigo-500/20 text-indigo-300'
            }`}>
              CSE Dept
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Explore faculty members and evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search faculty name..."
              className={`w-full border rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
              }`}
            />
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className={`border rounded-xl px-2.5 py-1.5 text-xs ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-700 text-white'
            }`}
          >
            <option value="rating">Top Rated</option>
            <option value="teaching">Highest Teaching</option>
            <option value="workload">Easiest Workload</option>
          </select>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-700 text-slate-400 hover:text-white'}`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Note on Faculty Ratings as requested by user */}
      <div className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 transition-colors ${
        isLight 
          ? 'bg-amber-50/80 border-amber-200 text-amber-900' 
          : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
      }`}>
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <span>
          <strong>Note on Faculty Ratings:</strong> Some faculty ratings may be invalid or outdated. Please double-check or ask some of your seniors before making final section choices.
        </span>
      </div>

      {/* Grid of Faculty Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[640px] overflow-y-auto pr-1">
        {filteredFaculty.map(fac => (
          <div
            key={fac.name}
            className={`p-4 rounded-xl border transition-all space-y-3 ${
              isLight ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs' : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{fac.name}</h4>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {fac.designation || 'Lecturer'} • Dept of CSE
                </p>
              </div>

              {fac.rating > 0 && (
                <div className="flex items-center gap-1 text-xs font-bold font-mono text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                  <span>{fac.rating.toFixed(1)}/10</span>
                </div>
              )}
            </div>

            {/* Performance Metric Breakdown */}
            <div className={`grid grid-cols-4 gap-1.5 pt-2 border-t text-center text-[10px] ${
              isLight ? 'border-slate-100' : 'border-slate-800/80'
            }`}>
              <div className={`p-1.5 rounded ${isLight ? 'bg-slate-50' : 'bg-slate-800/60'}`}>
                <span className={`block text-[9px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Teaching</span>
                <span className={`font-bold font-mono ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{fac.teaching || '-'}</span>
              </div>
              <div className={`p-1.5 rounded ${isLight ? 'bg-slate-50' : 'bg-slate-800/60'}`}>
                <span className={`block text-[9px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Response</span>
                <span className={`font-bold font-mono ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{fac.response || '-'}</span>
              </div>
              <div className={`p-1.5 rounded ${isLight ? 'bg-slate-50' : 'bg-slate-800/60'}`}>
                <span className={`block text-[9px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Workload</span>
                <span className={`font-bold font-mono ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{fac.workload || '-'}</span>
              </div>
              <div className={`p-1.5 rounded ${isLight ? 'bg-slate-50' : 'bg-slate-800/60'}`}>
                <span className={`block text-[9px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Clarity</span>
                <span className={`font-bold font-mono ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{fac.clarity || '-'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
