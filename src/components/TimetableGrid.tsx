import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRightLeft, 
  Star, 
  Sparkles, 
  X
} from 'lucide-react';
import { Section } from '../types';
import { findScheduleConflicts, getDaysList, parseTimeToMinutes, getAlternativeSections } from '../utils/schedulerEngine';
import { getFacultyRating } from '../utils/courseData';

interface TimetableGridProps {
  selectedSections: Section[];
  theme: 'light' | 'dark';
  onSelectSection: (section: Section) => void;
  onRemoveSection: (sectionId: string) => void;
  onSwitchSection: (oldSection: Section, newSection: Section) => void;
  onOpenCustomScheduler: () => void;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  selectedSections,
  theme,
  onSelectSection,
  onRemoveSection,
  onSwitchSection,
  onOpenCustomScheduler
}) => {
  const isLight = theme === 'light';
  const [switchingSection, setSwitchingSection] = useState<Section | null>(null);

  const conflicts = findScheduleConflicts(selectedSections);
  const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed'];

  const activeDays = new Set<string>();
  selectedSections.forEach(s => getDaysList(s.days).forEach(d => activeDays.add(d)));

  const getSectionsForDay = (day: string) => {
    return selectedSections
      .filter(s => getDaysList(s.days).includes(day))
      .sort((a, b) => parseTimeToMinutes(a.time1.split('-')[0]) - parseTimeToMinutes(b.time1.split('-')[0]));
  };

  const isConflictingSection = (sec: Section) => {
    return conflicts.some(c => c.sectionA.id === sec.id || c.sectionB.id === sec.id);
  };

  const getConflictingCourses = (sec: Section) => {
    const list: string[] = [];
    conflicts.forEach(c => {
      if (c.sectionA.id === sec.id) list.push(`${c.sectionB.courseCode} (${c.sectionB.section})`);
      if (c.sectionB.id === sec.id) list.push(`${c.sectionA.courseCode} (${c.sectionA.section})`);
    });
    return Array.from(new Set(list));
  };

  return (
    <div className="space-y-6">
      {/* Header and Statistics */}
      <div className={`rounded-2xl p-5 border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-800/80 border-slate-700/80 shadow-xl'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Weekly Timetable
            </h2>
          </div>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Routine spread across {activeDays.size} days ({Array.from(activeDays).join(', ') || 'No classes selected'}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {conflicts.length > 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-300 text-rose-600 text-xs font-bold animate-pulse">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{conflicts.length} Time Conflict{conflicts.length > 1 ? 's' : ''} Detected</span>
            </div>
          ) : selectedSections.length > 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-300 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Conflict-Free Routine</span>
            </div>
          ) : null}

          <button
            onClick={onOpenCustomScheduler}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isLight 
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300' 
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Custom Scheduling</span>
          </button>
        </div>
      </div>

      {/* Dynamic Conflicts Alert Banner */}
      {conflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>Time Conflict Warning: Overlapping Lecture Times</span>
          </div>

          <div className="space-y-2">
            {conflicts.map((c, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white border border-rose-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs"
              >
                <div>
                  <span className="font-bold text-rose-600 font-mono">[{c.day} • {c.timeRange}]: </span>
                  <span className="font-semibold text-slate-900">{c.sectionA.courseCode} Sec {c.sectionA.section}</span>
                  <span className="text-slate-500"> overlaps with </span>
                  <span className="font-semibold text-slate-900">{c.sectionB.courseCode} Sec {c.sectionB.section}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSwitchingSection(c.sectionA)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors flex items-center gap-1"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    <span>Change {c.sectionA.courseCode}</span>
                  </button>

                  <button
                    onClick={() => setSwitchingSection(c.sectionB)}
                    className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-[11px] font-bold transition-colors flex items-center gap-1"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    <span>Change {c.sectionB.courseCode}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Days Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {days.map(day => {
          const daySections = getSectionsForDay(day);
          const hasDayClasses = daySections.length > 0;

          return (
            <div
              key={day}
              className={`rounded-2xl border flex flex-col overflow-hidden transition-all ${
                hasDayClasses
                  ? isLight
                    ? 'bg-white border-slate-200 shadow-xs'
                    : 'bg-slate-900/80 border-slate-700/80 shadow-md'
                  : isLight
                  ? 'bg-slate-50/70 border-slate-200 opacity-60'
                  : 'bg-slate-900/40 border-slate-800/60 opacity-60'
              }`}
            >
              {/* Day Header */}
              <div className={`p-3 border-b text-center ${
                hasDayClasses 
                  ? isLight ? 'bg-indigo-50 border-indigo-100 text-indigo-900' : 'bg-indigo-950/40 border-indigo-900/40 text-white' 
                  : isLight ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <h3 className="font-extrabold text-sm tracking-wide">
                  {day === 'Sat' ? 'Saturday' :
                   day === 'Sun' ? 'Sunday' :
                   day === 'Mon' ? 'Monday' :
                   day === 'Tue' ? 'Tuesday' : 'Wednesday'}
                </h3>
                <span className={`text-[10px] block font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {daySections.length} Class{daySections.length !== 1 ? 'es' : ''}
                </span>
              </div>

              {/* Day Timeline Classes */}
              <div className="p-3 space-y-2.5 flex-1 min-h-[220px]">
                {daySections.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center p-4">
                    <span className={`text-[11px] italic ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>No classes</span>
                  </div>
                ) : (
                  daySections.map(sec => {
                    const isClashing = isConflictingSection(sec);
                    const faculty = getFacultyRating(sec.facultyName);
                    const clashingCourses = isClashing ? getConflictingCourses(sec) : [];

                    return (
                      <div
                        key={`${sec.id}_${day}`}
                        className={`p-3 rounded-xl border text-xs relative transition-all ${
                          isClashing
                            ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-sm'
                            : isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-800'
                            : 'bg-slate-800 border-slate-700 text-white'
                        }`}
                      >
                        {/* Time & Badges */}
                        <div className={`flex items-center justify-between pb-1 mb-1 border-b ${
                          isLight ? 'border-slate-200' : 'border-white/10'
                        }`}>
                          <span className={`font-mono font-bold text-[11px] flex items-center gap-1 ${
                            isLight ? 'text-slate-700' : 'text-white'
                          }`}>
                            <Clock className="w-3 h-3 text-slate-400" />
                            {sec.time1}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold font-mono text-white ${
                            isClashing ? 'bg-rose-600' : 'bg-indigo-600'
                          }`}>
                            Sec {sec.section}
                          </span>
                        </div>

                        {/* Course Code & Title */}
                        <h4 className={`font-bold text-sm font-mono leading-tight ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}>
                          {sec.courseCode}
                        </h4>
                        <p className={`text-[11px] truncate mt-0.5 ${
                          isLight ? 'text-slate-600' : 'text-slate-300'
                        }`}>
                          {sec.title}
                        </p>

                        {/* Faculty & Rating (No reviews shown on web) */}
                        <div className={`mt-2 pt-1 border-t flex items-center justify-between ${
                          isLight ? 'border-slate-200' : 'border-white/10'
                        }`}>
                          <span className={`text-[11px] font-medium truncate max-w-[120px] ${
                            isLight ? 'text-slate-700' : 'text-slate-200'
                          }`}>
                            {sec.facultyName}
                          </span>
                          {faculty && faculty.rating > 0 && (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 font-mono">
                              <Star className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
                              {faculty.rating}
                            </span>
                          )}
                        </div>

                        {/* Room */}
                        {sec.room && (
                          <div className={`text-[10px] flex items-center gap-1 mt-1 ${
                            isLight ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{sec.room}</span>
                          </div>
                        )}

                        {/* Clash Warning */}
                        {isClashing && (
                          <div className="mt-2 pt-1.5 border-t border-rose-200 text-[10px] text-rose-700 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-500 flex-shrink-0" />
                            <span>Clashes: {clashingCourses.join(', ')}</span>
                          </div>
                        )}

                        {/* Switch Section Button */}
                        <button
                          onClick={() => setSwitchingSection(sec)}
                          className={`w-full mt-2 py-1 rounded text-[10px] font-semibold border flex items-center justify-center gap-1 transition-colors ${
                            isLight 
                              ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200' 
                              : 'bg-black/40 hover:bg-black/60 text-white border-white/10'
                          }`}
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>Switch Section</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Section Switcher Modal */}
      {switchingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 border ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${
              isLight ? 'border-slate-100' : 'border-slate-800'
            }`}>
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-indigo-500" />
                  <span>Switch Section for {switchingSection.courseCode}</span>
                </h3>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Currently: Section <strong className={isLight ? 'text-slate-900' : 'text-white'}>{switchingSection.section}</strong> ({switchingSection.facultyName} • {switchingSection.days} {switchingSection.time1})
                </p>
              </div>
              <button
                onClick={() => setSwitchingSection(null)}
                className={`p-1 rounded-lg ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Available sections:
              </span>

              {getAlternativeSections(switchingSection, selectedSections).map(({ section: altSec, facultyRating, hasConflict }) => {
                const isCurrent = altSec.id === switchingSection.id;

                return (
                  <div
                    key={altSec.id}
                    className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
                      isCurrent
                        ? isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-800/80 border-slate-600'
                        : hasConflict
                        ? isLight ? 'bg-rose-50/50 border-rose-200 text-slate-600' : 'bg-rose-950/20 border-rose-800/40 text-slate-400'
                        : isLight ? 'bg-white border-slate-200 hover:border-emerald-400 text-slate-800' : 'bg-slate-800/90 border-slate-700 text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-indigo-600 text-white font-extrabold flex items-center justify-center font-mono">
                          {altSec.section}
                        </span>
                        <span className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {altSec.facultyName}
                        </span>
                        {facultyRating > 0 && (
                          <span className="text-[10px] font-mono text-emerald-600 font-bold flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
                            {facultyRating}/10
                          </span>
                        )}
                      </div>

                      <div className={`text-[11px] mt-1 flex items-center gap-2 ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        <span>{altSec.days}: {altSec.time1}</span>
                        {altSec.room && <span>• {altSec.room}</span>}
                      </div>

                      {hasConflict && !isCurrent && (
                        <span className="text-[10px] text-rose-600 flex items-center gap-1 mt-0.5 font-semibold">
                          <AlertTriangle className="w-3 h-3" />
                          Time clash with existing schedule
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      {isCurrent ? (
                        <span className={`text-[11px] font-semibold px-2 py-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Current
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            onSwitchSection(switchingSection, altSec);
                            setSwitchingSection(null);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            hasConflict
                              ? isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          Select Sec {altSec.section}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={`flex justify-end pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
              <button
                onClick={() => setSwitchingSection(null)}
                className={`px-4 py-2 rounded-xl text-xs font-medium ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
