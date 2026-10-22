import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  BookOpen, 
  Layers, 
  ArrowRightLeft, 
  X,
  CreditCard
} from 'lucide-react';
import { Course } from '../types';
import { allCourses, getTrimesterGroup, getTrimesterNumber } from '../utils/courseData';

interface CourseSelectorProps {
  selectedCodes: string[];
  totalCredits: number;
  theme: 'light' | 'dark';
  onAddCourse: (code: string) => void;
  onRemoveCourse: (code: string) => void;
  onSwitchCourse: (oldCode: string, newCode: string) => void;
  onClearAll: () => void;
}

export const CourseSelector: React.FC<CourseSelectorProps> = ({
  selectedCodes,
  totalCredits,
  theme,
  onAddCourse,
  onRemoveCourse,
  onSwitchCourse,
  onClearAll
}) => {
  const isLight = theme === 'light';
  const [searchQuery, setSearchQuery] = useState('');
  // User requested: "trimester will be 1 to 3 4 to 6 and so on"
  const [trimesterGroup, setTrimesterGroup] = useState<'ALL' | '1-3' | '4-6' | '7-9' | '10-12'>('ALL');
  const [switchingCourseCode, setSwitchingCourseCode] = useState<string | null>(null);

  // Filter UIU CSE courses by trimester group and search
  const filteredCourses = allCourses.filter(course => {
    if (course.program !== 'BSCSE') return false;

    // Search query match (NO "e.g." in placeholder)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = course.code.toLowerCase().includes(q);
      const matchTitle = course.title.toLowerCase().includes(q) || course.fullTitle.toLowerCase().includes(q);
      if (!matchCode && !matchTitle) return false;
    }

    // Trimester group filter: 1 to 3, 4 to 6, 7 to 9, 10 to 12
    if (trimesterGroup !== 'ALL') {
      return getTrimesterGroup(course.code) === trimesterGroup;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* CSE Course Selection Box */}
      <div className={`rounded-2xl p-5 border shadow-sm transition-colors ${
        isLight 
          ? 'bg-white border-slate-200' 
          : 'bg-slate-800/80 border-slate-700/80 shadow-xl'
      }`}>
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b ${
          isLight ? 'border-slate-100' : 'border-slate-700/60'
        }`}>
          <div>
            <h2 className={`text-base font-bold flex items-center gap-2 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <span>CSE Course Selection</span>
            </h2>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Select your courses from the trimester catalog below.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Enrolled credits kept inside the course selection box */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border ${
              isLight 
                ? 'bg-slate-50 border-slate-200 text-slate-700' 
                : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}>
              <CreditCard className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-medium">Enrolled Credits:</span>
              <span className="text-xs font-extrabold font-mono text-orange-500">
                {totalCredits.toFixed(2)} Cr
              </span>
            </div>

            {selectedCodes.length > 0 && (
              <button
                onClick={onClearAll}
                className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 text-xs font-semibold border border-rose-200 transition-all"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Currently Selected Courses (Empty on initial open) */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}>
              <span>Selected Courses</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
                isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-700 text-white'
              }`}>
                {selectedCodes.length}
              </span>
            </span>
            <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
              {selectedCodes.length === 0 ? 'No courses selected yet. Choose from the trimesters below.' : 'Click "Switch" to replace any course.'}
            </span>
          </div>

          {selectedCodes.length === 0 ? (
            <div className={`p-4 rounded-xl border border-dashed text-center ${
              isLight 
                ? 'border-slate-200 bg-slate-50 text-slate-500' 
                : 'border-slate-700/80 bg-slate-900/40 text-slate-400'
            }`}>
              <p className="text-xs">
                Your selected courses list is empty. Select your courses from the trimester catalog below.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedCodes.map(code => {
                const c = allCourses.find(course => course.code === code);
                return (
                  <div
                    key={code}
                    className={`flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-xl border text-xs shadow-xs transition-all ${
                      isLight 
                        ? 'bg-slate-50 border-slate-200 hover:border-indigo-400' 
                        : 'bg-slate-900 border-slate-700/80 hover:border-indigo-500/50'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className={`font-bold font-mono flex items-center gap-1 ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        {code}
                        {c?.isLab && (
                          <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 font-sans font-medium border border-amber-300/40">
                            Lab
                          </span>
                        )}
                      </span>
                      <span className={`text-[10px] truncate max-w-[130px] ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {c?.title || code} ({c?.credit || 3} Cr)
                      </span>
                    </div>

                    <div className={`flex items-center gap-1 ml-1 border-l pl-1.5 ${
                      isLight ? 'border-slate-200' : 'border-slate-800'
                    }`}>
                      <button
                        onClick={() => setSwitchingCourseCode(code)}
                        className={`p-1 rounded-lg transition-colors ${
                          isLight 
                            ? 'text-slate-400 hover:text-indigo-600 hover:bg-slate-200' 
                            : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800'
                        }`}
                        title={`Switch ${code}`}
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onRemoveCourse(code)}
                        className={`p-1 rounded-lg transition-colors ${
                          isLight 
                            ? 'text-slate-400 hover:text-rose-600 hover:bg-slate-200' 
                            : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                        }`}
                        title={`Remove ${code}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Select Your Courses Catalog */}
      <div className={`rounded-2xl p-5 border shadow-sm space-y-4 transition-colors ${
        isLight 
          ? 'bg-white border-slate-200' 
          : 'bg-slate-800/80 border-slate-700/80 shadow-xl'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className={`text-base font-bold flex items-center gap-2 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <Layers className="w-4 h-4 text-emerald-500" />
              <span>Select Your Courses</span>
              <span className={`text-xs font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                ({filteredCourses.length} courses)
              </span>
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Filter by trimester group to find your courses.
            </p>
          </div>

          {/* Search Box (NO "e.g." in placeholder) */}
          <div className="relative w-full md:w-72">
            <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search course code or title..."
              className={`w-full border rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors ${
                isLight 
                  ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400' 
                  : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-2.5 top-2.5 hover:text-slate-700 ${isLight ? 'text-slate-400' : 'text-slate-400 hover:text-white'}`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Trimester Filters: 1 to 3, 4 to 6, 7 to 9, 10 to 12 as requested */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'ALL', label: 'All Trimesters' },
            { id: '1-3', label: 'Trimesters 1 - 3' },
            { id: '4-6', label: 'Trimesters 4 - 6' },
            { id: '7-9', label: 'Trimesters 7 - 9' },
            { id: '10-12', label: 'Trimesters 10 - 12' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTrimesterGroup(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex-shrink-0 ${
                trimesterGroup === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isLight
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-700/60 border border-slate-700/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Course Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
          {filteredCourses.map(course => {
            const isSelected = selectedCodes.includes(course.code);

            return (
              <div
                key={course.code}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? isLight
                      ? 'bg-indigo-50/70 border-indigo-400 shadow-xs'
                      : 'bg-indigo-950/40 border-indigo-500/60 shadow-md shadow-indigo-900/20'
                    : isLight
                    ? 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-white'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1.5">
                    <span className={`font-extrabold text-sm font-mono tracking-wide ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      {course.code}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        course.isLab 
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-300/40' 
                          : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {course.credit} Cr
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        isLight ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {course.sections.length} Secs
                      </span>
                    </div>
                  </div>

                  <h4 className={`text-xs font-semibold mt-1 line-clamp-1 ${
                    isLight ? 'text-slate-800' : 'text-slate-200'
                  }`} title={course.title}>
                    {course.title}
                  </h4>
                  <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {course.trimesterCategory}
                  </p>
                </div>

                <div className={`mt-3 pt-2 border-t flex items-center justify-between ${
                  isLight ? 'border-slate-200' : 'border-slate-800/80'
                }`}>
                  <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                    {course.isLab ? '1 Day Lab' : '2 Days Theory'}
                  </span>

                  {isSelected ? (
                    <button
                      onClick={() => onRemoveCourse(course.code)}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 text-xs font-medium border border-rose-300/50 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onAddCourse(course.code)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition-all shadow-xs active:scale-95"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Select</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Switch Course Modal */}
      {switchingCourseCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 border ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${
              isLight ? 'border-slate-100' : 'border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-base">
                  Switch Course: <span className="font-mono text-orange-500">{switchingCourseCode}</span>
                </h3>
              </div>
              <button
                onClick={() => setSwitchingCourseCode(null)}
                className={`p-1 rounded-lg ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Select another CSE course to replace <strong className={isLight ? 'text-slate-900' : 'text-white'}>{switchingCourseCode}</strong>.
            </p>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {allCourses
                .filter(c => c.program === 'BSCSE' && c.code !== switchingCourseCode && !selectedCodes.includes(c.code))
                .map(altCourse => (
                  <button
                    key={altCourse.code}
                    onClick={() => {
                      onSwitchCourse(switchingCourseCode, altCourse.code);
                      setSwitchingCourseCode(null);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isLight 
                        ? 'bg-slate-50 hover:bg-indigo-50 border-slate-200 hover:border-indigo-400' 
                        : 'bg-slate-800/80 hover:bg-indigo-900/30 border-slate-700/80 hover:border-indigo-500'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs font-mono flex items-center gap-1.5">
                        <span>{altCourse.code}</span>
                        <span className={`text-[10px] font-sans ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          ({altCourse.credit} Credits)
                        </span>
                      </div>
                      <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{altCourse.title}</p>
                    </div>
                    <span className="text-xs font-semibold text-indigo-500 hover:underline">
                      Replace →
                    </span>
                  </button>
                ))}
            </div>

            <div className={`flex justify-end pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
              <button
                onClick={() => setSwitchingCourseCode(null)}
                className={`px-4 py-2 rounded-xl text-xs font-medium ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
