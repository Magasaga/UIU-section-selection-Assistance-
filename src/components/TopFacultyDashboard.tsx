import React from 'react';
import { 
  Star, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Sparkles, 
  Award,
  Calendar,
  Info
} from 'lucide-react';
import { CourseFacultyRecommendation, Section } from '../types';
import { detectConflictBetweenSections } from '../utils/schedulerEngine';
import { getCourseShortName } from '../utils/courseData';

interface TopFacultyDashboardProps {
  recommendations: CourseFacultyRecommendation[];
  selectedSections: Section[];
  theme: 'light' | 'dark';
  onToggleSection: (section: Section) => void;
  onOpenCustomScheduler: () => void;
}

export const TopFacultyDashboard: React.FC<TopFacultyDashboardProps> = ({
  recommendations,
  selectedSections,
  theme,
  onToggleSection,
  onOpenCustomScheduler
}) => {
  const isLight = theme === 'light';

  if (recommendations.length === 0) {
    return (
      <div className={`rounded-2xl p-8 border text-center shadow-sm transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-800/80 border-slate-700/80 shadow-xl'
      }`}>
        <Sparkles className="w-10 h-10 text-orange-500 mx-auto mb-2.5 opacity-90" />
        <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
          No Courses Selected Yet
        </h3>
        <p className={`text-xs max-w-sm mx-auto mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Select courses from the trimester catalog above to view the top 4 faculties for each course.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Warning Message 1: Section selection clarification */}
      <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 transition-colors ${
        isLight 
          ? 'bg-amber-50/90 border-amber-200 text-amber-900' 
          : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
      }`}>
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed space-y-1">
          <p className="font-bold">
            Important Notice for Students:
          </p>
          <p>
            You cannot register or enroll in sections directly on this website. This system only helps you choose the best faculty, avoid time conflicts, and generate your routine. Use your selected sections to register officially on UCAM.
          </p>
        </div>
      </div>

      {/* Warning Message 2: Phase 1 Faculty Review text */}
      <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 transition-colors ${
        isLight 
          ? 'bg-slate-50 border-slate-200 text-slate-700' 
          : 'bg-slate-900 border-slate-800 text-slate-300'
      }`}>
        <Info className="w-4 h-4 text-indigo-500 flex-shrink-0" />
        <span>
          <strong>Note on Faculty Ratings:</strong> Some faculty ratings may be invalid or outdated. Please double-check or ask some of your seniors before making final section choices.
        </span>
      </div>

      {/* Header */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
      }`}>
        <div>
          <h2 className={`text-sm sm:text-base font-bold flex items-center gap-2 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            <Award className="w-4 h-4 text-amber-500" />
            <span>Top Faculty Recommendations</span>
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Prioritizing faculty with high review volume (&gt; 8 reviews) and top student ratings.
          </p>
        </div>

        <button
          onClick={onOpenCustomScheduler}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            isLight 
              ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100' 
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Custom Scheduling</span>
        </button>
      </div>

      {/* Courses Cards */}
      <div className="space-y-5">
        {recommendations.map((rec, courseIdx) => {
          const chosenSectionForCourse = selectedSections.find(s => s.courseCode === rec.courseCode);
          const shortName = getCourseShortName(rec.courseCode, rec.courseTitle, rec.isLab);

          return (
            <div
              key={rec.courseCode}
              className={`rounded-2xl border overflow-hidden transition-all shadow-sm ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-800/80 border-slate-700/80 shadow-xl'
              }`}
            >
              {/* Course Header with Short Name */}
              <div className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-900/90 border-slate-700/70'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                    {courseIdx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-extrabold text-sm px-2 py-0.5 rounded font-sans ${
                        isLight ? 'bg-indigo-100 text-indigo-900' : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                      }`}>
                        {shortName}
                      </span>
                      <span className={`font-mono text-sm ${
                        isLight ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        {rec.courseCode}
                      </span>
                      <span className={`text-xs font-semibold ${
                        isLight ? 'text-slate-700' : 'text-slate-300'
                      }`}>
                        • {rec.courseTitle}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        rec.isLab 
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-300/40' 
                          : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {rec.credit} Credit{rec.credit > 1 ? 's' : ''}
                      </span>
                    </div>

                    {chosenSectionForCourse && (
                      <p className="text-[11px] text-emerald-600 font-semibold font-mono mt-0.5">
                        Enrolled Section: {chosenSectionForCourse.section} ({chosenSectionForCourse.facultyName})
                      </p>
                    )}
                  </div>
                </div>

                {/* Short note badge if fewer than 4 faculties */}
                {rec.note && (
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium self-start sm:self-auto border ${
                    isLight 
                      ? 'bg-amber-50 border-amber-200 text-amber-800' 
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>{rec.note}</span>
                  </div>
                )}
              </div>

              {/* Faculty Cards Grid */}
              <div className="p-4 sm:p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rec.topFaculty.map((fac, facIdx) => {
                    const isSelectedFaculty = chosenSectionForCourse && fac.sections.some(s => s.id === chosenSectionForCourse.id);

                    return (
                      <div
                        key={fac.facultyName}
                        className={`rounded-xl p-4 border transition-all ${
                          isSelectedFaculty
                            ? isLight
                              ? 'bg-indigo-50/70 border-indigo-400 shadow-xs'
                              : 'bg-indigo-950/40 border-indigo-500/70 shadow-md'
                            : isLight
                            ? 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                            : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700'
                        }`}
                      >
                        {/* Faculty Meta & Rating */}
                        <div className={`flex items-start justify-between gap-2 pb-3 border-b ${
                          isLight ? 'border-slate-200' : 'border-slate-800'
                        }`}>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center border ${
                                isLight 
                                  ? 'bg-slate-200 text-slate-700 border-slate-300' 
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}>
                                #{facIdx + 1}
                              </span>
                              <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                {fac.facultyName}
                              </h4>
                            </div>
                            <p className={`text-[11px] ml-7 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              {fac.designation || 'Faculty Member'} • Dept of CSE
                            </p>
                          </div>

                          {/* Rating Pill (NO review count shown on web) */}
                          {fac.hasRating && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold font-mono">
                              <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                              <span>{fac.rating.toFixed(1)}/10</span>
                            </div>
                          )}
                        </div>

                        {/* Available Sections for this Faculty */}
                        <div className="mt-3 space-y-2">
                          <span className={`text-[11px] uppercase tracking-wider font-bold ${
                            isLight ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            Available Sections:
                          </span>

                          <div className="space-y-1.5">
                            {fac.sections.map(sec => {
                              const isEnrolled = selectedSections.some(s => s.id === sec.id);

                              const clashWith = selectedSections.find(other => 
                                other.id !== sec.id && other.courseCode !== sec.courseCode && detectConflictBetweenSections(sec, other)
                              );

                              return (
                                <div
                                  key={sec.id}
                                  className={`p-2.5 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
                                    isEnrolled
                                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-800'
                                      : clashWith
                                      ? isLight
                                        ? 'bg-rose-50 border-rose-200 text-slate-700'
                                        : 'bg-rose-950/20 border-rose-800/40 text-slate-300'
                                      : isLight
                                      ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                      : 'bg-slate-800/70 border-slate-700/60 text-slate-300 hover:border-slate-600'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-extrabold flex items-center justify-center font-mono shadow-xs flex-shrink-0">
                                      {sec.section}
                                    </span>
                                    <div>
                                      <div className={`font-semibold flex items-center gap-1.5 flex-wrap ${
                                        isLight ? 'text-slate-800' : 'text-slate-200'
                                      }`}>
                                        <Calendar className={`w-3.5 h-3.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                                        <span>{sec.days}</span>
                                        <span className="text-slate-400">•</span>
                                        <Clock className={`w-3.5 h-3.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                                        <span className="font-mono">{sec.time1}</span>
                                      </div>
                                      {sec.room && (
                                        <div className={`text-[11px] flex items-center gap-1 mt-0.5 ${
                                          isLight ? 'text-slate-500' : 'text-slate-400'
                                        }`}>
                                          <MapPin className="w-3 h-3 text-slate-400" />
                                          <span>{sec.room}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 self-end sm:self-auto">
                                    {clashWith && (
                                      <span className="text-[10px] text-rose-600 flex items-center gap-1 font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                                        <span>Clashes with {clashWith.courseCode} ({clashWith.section})</span>
                                      </span>
                                    )}

                                    <button
                                      onClick={() => onToggleSection(sec)}
                                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs ${
                                        isEnrolled
                                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                          : clashWith
                                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300'
                                          : isLight
                                          ? 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 border border-slate-200'
                                          : 'bg-slate-700 hover:bg-indigo-600 text-white'
                                      }`}
                                    >
                                      {isEnrolled ? '✓ Selected' : 'Select Section'}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
