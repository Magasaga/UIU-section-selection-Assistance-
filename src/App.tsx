/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { CourseSelector } from './components/CourseSelector';
import { TopFacultyDashboard } from './components/TopFacultyDashboard';
import { CustomScheduling } from './components/CustomSchedulingModal';
import { EvaluationView } from './components/EvaluationView';
import { FacultyDirectory } from './components/FacultyDirectoryModal';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { TableFallbackView } from './components/TableFallbackView';
import { TimetableGrid } from './components/TimetableGrid';

import { Section } from './types';
import { 
  getCourseByCode, 
  getRecommendationsForCourses, 
  getRankedFacultyForCourse 
} from './utils/courseData';
import { findScheduleConflicts } from './utils/schedulerEngine';
import { 
  FileDown, 
  Table, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Layers
} from 'lucide-react';

const STORAGE_KEY_COURSES = 'uiu_cse_selected_courses_v4';
const STORAGE_KEY_SECTIONS = 'uiu_cse_selected_sections_v4';
const STORAGE_KEY_THEME = 'uiu_cse_theme_v2';

export default function App() {
  // Theme state: Default Light Mode as requested
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    }
    return 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem(STORAGE_KEY_THEME, next);
      } catch (e) {}
      return next;
    });
  };

  // Navigation Menu: Course & Faculty, Custom Scheduling, Evaluation, Faculty Directory
  const [activeTab, setActiveTab] = useState<'selection' | 'custom' | 'evaluation' | 'directory'>('selection');

  // Timetable view toggle
  const [showTimetable, setShowTimetable] = useState(false);

  // Modal visibility states
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isTableFallbackOpen, setIsTableFallbackOpen] = useState(false);

  // Selected courses (Empty on initial open)
  const [selectedCourseCodes, setSelectedCourseCodes] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlCourses = params.get('courses');
      if (urlCourses) {
        return urlCourses.split(',').filter(Boolean);
      }
      const saved = localStorage.getItem(STORAGE_KEY_COURSES);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
    }
    return [];
  });

  // Selected Sections for schedule
  const [selectedSections, setSelectedSections] = useState<Section[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_SECTIONS);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
    }
    return [];
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(selectedCourseCodes));
    } catch (e) {}
  }, [selectedCourseCodes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(selectedSections));
    } catch (e) {}
  }, [selectedSections]);

  // Sync selected sections with courses
  useEffect(() => {
    setSelectedSections(current => {
      let filtered = current.filter(s => selectedCourseCodes.includes(s.courseCode));

      selectedCourseCodes.forEach(code => {
        const hasSection = filtered.some(s => s.courseCode === code);
        if (!hasSection) {
          const ranked = getRankedFacultyForCourse(code);
          if (ranked.length > 0 && ranked[0].sections.length > 0) {
            filtered.push(ranked[0].sections[0]);
          }
        }
      });

      return filtered;
    });
  }, [selectedCourseCodes]);

  // Calculate Total Credits
  const totalCredits = useMemo(() => {
    return selectedCourseCodes.reduce((sum, code) => {
      const course = getCourseByCode(code);
      return sum + (course ? course.credit : 3);
    }, 0);
  }, [selectedCourseCodes]);

  // Dynamic conflicts
  const conflicts = useMemo(() => {
    return findScheduleConflicts(selectedSections);
  }, [selectedSections]);

  // Top 4 Faculty recommendations
  const recommendations = useMemo(() => {
    return getRecommendationsForCourses(selectedCourseCodes);
  }, [selectedCourseCodes]);

  // Course handlers
  const handleAddCourse = (code: string) => {
    if (!selectedCourseCodes.includes(code)) {
      setSelectedCourseCodes([...selectedCourseCodes, code]);
    }
  };

  const handleRemoveCourse = (code: string) => {
    setSelectedCourseCodes(selectedCourseCodes.filter(c => c !== code));
    setSelectedSections(selectedSections.filter(s => s.courseCode !== code));
  };

  const handleSwitchCourse = (oldCode: string, newCode: string) => {
    setSelectedCourseCodes(selectedCourseCodes.map(c => (c === oldCode ? newCode : c)));
    setSelectedSections(selectedSections.filter(s => s.courseCode !== oldCode));
  };

  const handleClearAll = () => {
    setSelectedCourseCodes([]);
    setSelectedSections([]);
  };

  // Section Toggle / Selection
  const handleToggleSection = (section: Section) => {
    setSelectedSections(prev => {
      const withoutCourse = prev.filter(s => s.courseCode !== section.courseCode);
      return [...withoutCourse, section];
    });
  };

  const handleSwitchSection = (oldSection: Section, newSection: Section) => {
    setSelectedSections(prev => {
      const filtered = prev.filter(s => s.id !== oldSection.id);
      return [...filtered, newSection];
    });
  };

  const handleApplyCustomSchedule = (newSections: Section[]) => {
    setSelectedSections(newSections);
    setActiveTab('selection');
    setShowTimetable(true);
  };

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isLight ? 'bg-slate-50 text-slate-800' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Top Navbar with ONLY UIU CSE section assistant and menu bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={tab => {
          setActiveTab(tab);
          setShowTimetable(false);
        }}
        selectedCourseCodes={selectedCourseCodes}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
        {activeTab === 'selection' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Primary Center Content: Course & Faculty */}
            <div className="lg:col-span-8 space-y-6">
              <CourseSelector
                selectedCodes={selectedCourseCodes}
                totalCredits={totalCredits}
                theme={theme}
                onAddCourse={handleAddCourse}
                onRemoveCourse={handleRemoveCourse}
                onSwitchCourse={handleSwitchCourse}
                onClearAll={handleClearAll}
              />

              {showTimetable ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-bold text-sm flex items-center gap-2 ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span>Weekly Timetable View</span>
                    </h3>
                    <button
                      onClick={() => setShowTimetable(false)}
                      className="text-xs text-indigo-600 hover:underline font-semibold"
                    >
                      Hide Timetable
                    </button>
                  </div>
                  <TimetableGrid
                    selectedSections={selectedSections}
                    theme={theme}
                    onSelectSection={handleToggleSection}
                    onRemoveSection={secId => setSelectedSections(selectedSections.filter(s => s.id !== secId))}
                    onSwitchSection={handleSwitchSection}
                    onOpenCustomScheduler={() => setActiveTab('custom')}
                  />
                </div>
              ) : null}

              <TopFacultyDashboard
                recommendations={recommendations}
                selectedSections={selectedSections}
                theme={theme}
                onToggleSection={handleToggleSection}
                onOpenCustomScheduler={() => setActiveTab('custom')}
              />
            </div>

            {/* Aside Panel: Put Generate PDF Aside as requested */}
            <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
              <div className={`rounded-2xl p-4 sm:p-5 border shadow-sm space-y-4 transition-colors ${
                isLight 
                  ? 'bg-white border-slate-200' 
                  : 'bg-slate-900 border-slate-800 shadow-xl'
              }`}>
                <div className={`flex items-center justify-between pb-3 border-b ${
                  isLight ? 'border-slate-100' : 'border-slate-800'
                }`}>
                  <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    <Layers className="w-4 h-4 text-orange-500" />
                    <span>Summary & PDF Export</span>
                  </span>
                  <span className="text-xs font-mono font-extrabold text-orange-500">
                    {totalCredits.toFixed(2)} Cr
                  </span>
                </div>

                {/* Course count indicator */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Courses Selected:</span>
                    <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {selectedCourseCodes.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Routine Conflict Status:</span>
                    {conflicts.length > 0 ? (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {conflicts.length} Clashes
                      </span>
                    ) : selectedCourseCodes.length > 0 ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Conflict-Free
                      </span>
                    ) : (
                      <span className={isLight ? 'text-slate-400' : 'text-slate-500'}>None</span>
                    )}
                  </div>
                </div>

                {/* Selected Course Pills in Aside */}
                {selectedCourseCodes.length > 0 ? (
                  <div className={`p-2.5 rounded-xl border max-h-40 overflow-y-auto space-y-1.5 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'
                  }`}>
                    {selectedCourseCodes.map(code => {
                      const sec = selectedSections.find(s => s.courseCode === code);
                      return (
                        <div key={code} className="flex items-center justify-between text-[11px]">
                          <span className={`font-mono font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{code}</span>
                          <span className={`font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            {sec ? `Sec ${sec.section}` : 'No Sec'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={`p-3 rounded-xl border border-dashed text-center text-xs ${
                    isLight ? 'border-slate-200 text-slate-400' : 'border-slate-800 text-slate-500'
                  }`}>
                    No courses in selection.
                  </div>
                )}

                {/* Put Generate PDF Aside Button */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => setIsPdfModalOpen(true)}
                    disabled={selectedCourseCodes.length === 0}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                      selectedCourseCodes.length > 0
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white active:scale-95'
                        : isLight 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Generate PDF</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setIsTableFallbackOpen(true)}
                      disabled={selectedCourseCodes.length === 0}
                      className={`py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 ${
                        isLight 
                          ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      <Table className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Table View</span>
                    </button>

                    <button
                      onClick={() => setShowTimetable(!showTimetable)}
                      disabled={selectedCourseCodes.length === 0}
                      className={`py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 ${
                        isLight 
                          ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{showTimetable ? 'Hide Grid' : 'Timetable'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Custom Scheduling Tab */}
        {activeTab === 'custom' && (
          <div className="animate-fadeIn">
            <CustomScheduling
              selectedCourseCodes={selectedCourseCodes}
              theme={theme}
              onApplySchedule={handleApplyCustomSchedule}
            />
          </div>
        )}

        {/* New Evaluation Tab as requested */}
        {activeTab === 'evaluation' && (
          <div className="animate-fadeIn">
            <EvaluationView theme={theme} />
          </div>
        )}

        {/* Faculty Directory Tab */}
        {activeTab === 'directory' && (
          <div className="animate-fadeIn">
            <FacultyDirectory 
              theme={theme} 
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`mt-auto border-t py-5 text-center text-xs transition-colors print:hidden ${
        isLight ? 'border-slate-200 bg-white text-slate-500' : 'border-slate-900 bg-slate-950/80 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            UIU CSE Section Assistant • Fall 2026 Trimester
          </span>
          <span className={isLight ? 'text-slate-400' : 'text-slate-600'}>
            United International University • Dept of CSE
          </span>
        </div>
      </footer>

      {/* PDF Download Modal */}
      {isPdfModalOpen && (
        <PdfPreviewModal
          recommendations={recommendations}
          totalCredits={totalCredits}
          onClose={() => setIsPdfModalOpen(false)}
          onOpenTableFallback={() => setIsTableFallbackOpen(true)}
        />
      )}

      {/* Table Fallback View Modal */}
      {isTableFallbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-5xl w-full my-auto space-y-3">
            <div className="flex justify-end pr-2">
              <button
                onClick={() => setIsTableFallbackOpen(false)}
                className="px-3 py-1 rounded-xl bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold"
              >
                Close Table View [ESC]
              </button>
            </div>
            <TableFallbackView
              recommendations={recommendations}
              totalCredits={totalCredits}
              onGeneratePdf={() => {
                setIsTableFallbackOpen(false);
                setIsPdfModalOpen(true);
              }}
              onClose={() => setIsTableFallbackOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
