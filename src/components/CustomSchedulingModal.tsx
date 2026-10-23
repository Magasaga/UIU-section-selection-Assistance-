import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Check, 
  AlertCircle, 
  Star, 
  ArrowRight,
  Info,
  AlertTriangle
} from 'lucide-react';
import { Section, CustomSchedulePreferences, GeneratedScheduleSolution } from '../types';
import { solveCustomSchedule } from '../utils/schedulerEngine';
import { getCourseShortName } from '../utils/courseData';

interface CustomSchedulingProps {
  selectedCourseCodes: string[];
  theme: 'light' | 'dark';
  onApplySchedule: (sections: Section[]) => void;
  onClose?: () => void;
}

export const CustomScheduling: React.FC<CustomSchedulingProps> = ({
  selectedCourseCodes,
  theme,
  onApplySchedule,
  onClose
}) => {
  const isLight = theme === 'light';
  // Options unselected/unchecked by default as requested: 2, 3, 4, 5 days and Sat, Sun, Mon, Tue, Wed
  const [maxDays, setMaxDays] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<string>('11:10 AM');
  const [endTime, setEndTime] = useState<string>('04:30 PM');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [solutions, setSolutions] = useState<GeneratedScheduleSolution[]>([]);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const availableDays = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed'];

  const handleToggleDay = (day: string) => {
    setValidationError(null);
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSolve = () => {
    setValidationError(null);

    // Validation when user hits generate: check if courses, days per week, and allowed days are specified
    if (selectedCourseCodes.length === 0) {
      setValidationError('Please select your courses first from "Course & Faculty" before generating a routine.');
      return;
    }

    if (!maxDays && selectedDays.length === 0) {
      setValidationError('Please select your preferred days per week (2, 3, 4, or 5 days), check your allowed campus days (Sat, Sun, Mon, Tue, Wed), and set your class hours.');
      return;
    }

    if (!maxDays) {
      setValidationError('Please check your preferred number of days per week (e.g. 2 Days, 3 Days, 4 Days, or 5 Days).');
      return;
    }

    if (selectedDays.length === 0) {
      setValidationError('Please check at least one allowed campus day (Sat, Sun, Mon, Tue, or Wed).');
      return;
    }

    setIsSolving(true);
    setHasGenerated(true);

    const prefs: CustomSchedulePreferences = {
      maxDaysPerWeek: maxDays,
      preferredDays: selectedDays,
      startTime,
      endTime,
      allowTheoryPairOnly: true,
      preferTopRatedFaculty: true
    };

    setTimeout(() => {
      const results = solveCustomSchedule(selectedCourseCodes, prefs);
      setSolutions(results);
      setIsSolving(false);
    }, 150);
  };

  const handleApply = (solution: GeneratedScheduleSolution) => {
    onApplySchedule(solution.sections);
    setAppliedId(solution.id);
    setTimeout(() => setAppliedId(null), 3000);
    if (onClose) {
      setTimeout(() => onClose(), 600);
    }
  };

  return (
    <div className="space-y-6">
      {/* Important User Warning 1: System Purpose & Direct Registration Notice */}
      <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 transition-colors ${
        isLight 
          ? 'bg-amber-50/80 border-amber-200 text-amber-900' 
          : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
      }`}>
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed space-y-1">
          <p className="font-bold">
            Important Notice for Students:
          </p>
          <p>
            You cannot register or enroll in sections directly on this website. Our system is designed solely to help you organize clash-free routine combinations and choose the best faculty. Use these generated sections to complete your official registration on UCAM.
          </p>
        </div>
      </div>

      {/* Header & Controls */}
      <div className={`rounded-2xl p-5 sm:p-6 border shadow-sm transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-800/80 border-slate-700/80 shadow-xl'
      }`}>
        <div className={`pb-4 border-b ${isLight ? 'border-slate-100' : 'border-slate-700/60'}`}>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </span>
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Custom Scheduling
            </h2>
          </div>
          <p className={`text-xs mt-1 max-w-2xl ${isLight ? 'text-slate-500' : 'text-slate-300'}`}>
            Choose your preferred number of days (2, 3, 4, or 5 days) and class time window. The dynamic scheduler ensures zero lecture conflicts and pairs theory courses accordingly.
          </p>
        </div>

        {/* UIU Rule Callout */}
        <div className={`mt-4 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900/90 border-slate-700 text-slate-300'
        }`}>
          <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className={isLight ? 'text-slate-900' : 'text-white'}>UIU CSE Scheduling Rules:</strong> Theory courses (3 Credits) are held in paired days (<span className="text-amber-600 font-semibold">Sat & Tue</span> or <span className="text-amber-600 font-semibold">Sun & Wed</span>). Lab courses (1 Credit) are single-day sessions between Saturday and Wednesday.
          </div>
        </div>

        {/* Control Panel Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Days Per Week (User can pick 2, 3, 4, 5, or any) */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <label className={`text-xs font-bold flex items-center justify-between ${
              isLight ? 'text-slate-700' : 'text-slate-300'
            }`}>
              <span>Days Per Week:</span>
              <span className={`font-mono text-sm font-extrabold ${maxDays ? 'text-indigo-600' : isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                {maxDays ? `${maxDays} Days` : 'Unchecked'}
              </span>
            </label>

            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 4, 5].map(days => (
                <button
                  key={days}
                  onClick={() => {
                    setValidationError(null);
                    setMaxDays(prev => prev === days ? null : days);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    maxDays === days
                      ? 'bg-indigo-600 text-white shadow-md font-extrabold scale-105'
                      : isLight
                      ? 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>

            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {maxDays ? `Fitting all classes within ${maxDays} campus days.` : 'Choose 2, 3, 4, or 5 days.'}
            </p>
          </div>

          {/* Time Window Preference */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <label className={`text-xs font-bold flex items-center justify-between ${
              isLight ? 'text-slate-700' : 'text-slate-300'
            }`}>
              <span>Preferred Class Hours:</span>
              <span className="text-indigo-600 font-mono text-xs">{startTime} – {endTime}</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className={`text-[10px] block mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>From</span>
                <select
                  value={startTime}
                  onChange={e => {
                    setValidationError(null);
                    setStartTime(e.target.value);
                  }}
                  className={`w-full border rounded-lg px-2 py-1.5 text-xs font-mono ${
                    isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                >
                  <option value="08:30 AM">08:30 AM</option>
                  <option value="09:51 AM">09:51 AM</option>
                  <option value="11:10 AM">11:10 AM</option>
                  <option value="12:31 PM">12:31 PM</option>
                  <option value="01:51 PM">01:51 PM</option>
                </select>
              </div>

              <div>
                <span className={`text-[10px] block mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>To</span>
                <select
                  value={endTime}
                  onChange={e => {
                    setValidationError(null);
                    setEndTime(e.target.value);
                  }}
                  className={`w-full border rounded-lg px-2 py-1.5 text-xs font-mono ${
                    isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                >
                  <option value="01:50 PM">01:50 PM</option>
                  <option value="03:10 PM">03:10 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                  <option value="06:00 PM">06:00 PM</option>
                </select>
              </div>
            </div>

            {/* Quick Time Presets */}
            <div className="flex gap-1.5 pt-1">
              <button
                onClick={() => { setValidationError(null); setStartTime('11:10 AM'); setEndTime('04:30 PM'); }}
                className={`px-2 py-1 rounded text-[10px] flex-1 font-medium border ${
                  isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                11:10 - 4:30
              </button>
              <button
                onClick={() => { setValidationError(null); setStartTime('08:30 AM'); setEndTime('01:50 PM'); }}
                className={`px-2 py-1 rounded text-[10px] flex-1 font-medium border ${
                  isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                Morning
              </button>
              <button
                onClick={() => { setValidationError(null); setStartTime('08:30 AM'); setEndTime('04:30 PM'); }}
                className={`px-2 py-1 rounded text-[10px] flex-1 font-medium border ${
                  isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                Full Day
              </button>
            </div>
          </div>

          {/* Days Filter */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <label className={`text-xs font-bold block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Allowed Campus Days:
              </label>
              {selectedDays.length > 0 ? (
                <button
                  onClick={() => {
                    setValidationError(null);
                    setSelectedDays([]);
                  }}
                  className={`text-[10px] underline hover:no-underline ${isLight ? 'text-slate-500' : 'text-slate-400'}`}
                >
                  Uncheck All
                </button>
              ) : (
                <button
                  onClick={() => {
                    setValidationError(null);
                    setSelectedDays([...availableDays]);
                  }}
                  className="text-[10px] text-indigo-500 underline hover:no-underline font-semibold"
                >
                  Select All
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {availableDays.map(day => {
                const isChecked = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => handleToggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isChecked
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isLight
                        ? 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700/60'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleSolve}
              disabled={isSolving}
              className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSolving ? 'Optimizing...' : 'Generate Schedules'}</span>
            </button>
          </div>
        </div>

        {/* Validation Alert message if user did not check anything or has missing configuration */}
        {validationError && (
          <div className={`mt-4 p-4 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
            isLight
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-rose-950/50 border-rose-700/70 text-rose-200'
          }`}>
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="block font-bold">Action Required:</strong>
              <span>{validationError}</span>
            </div>
          </div>
        )}
      </div>

      {/* Generated Solutions Results */}
      <div className="space-y-4">
        {!hasGenerated ? (
          <div className={`p-8 rounded-2xl border text-center space-y-3 ${
            isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-800/80 border-slate-700 text-slate-300'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Ready to Build Your Custom Routine
            </h3>
            <p className="text-xs max-w-md mx-auto leading-relaxed">
              Select your preferred days per week (2, 3, 4, or 5 days), check your allowed campus days (Sat, Sun, Mon, etc.), and set class hours above. Then hit <strong className="text-indigo-600 dark:text-indigo-400">"Generate Schedules"</strong> to view clash-free section routines.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className={`text-sm sm:text-base font-bold flex items-center gap-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Optimal Solutions ({solutions.length})</span>
              </h3>
              <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Zero conflict schedules
              </span>
            </div>

            {/* Faculty Review Phase 2 Warning (When system provides routine of best faculty) as requested by user */}
            {solutions.length > 0 && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 transition-colors ${
                isLight 
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900' 
                  : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
              }`}>
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span>
                  <strong>Note on Faculty Ratings:</strong> Some faculty ratings may be invalid or outdated. Please double-check or ask some of your seniors before making final section choices.
                </span>
              </div>
            )}

            {solutions.length === 0 ? (
              <div className={`p-6 rounded-2xl border text-center space-y-3 ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-800/80 border-slate-700'
              }`}>
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  No Schedules Matched These Strict Constraints
                </h4>
                <p className={`text-xs max-w-lg mx-auto ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Try selecting more days (e.g. 4 or 5 days) or expanding the class hours so all required theory pairs and labs can fit without conflicts.
                </p>
                <button
                  onClick={() => {
                    setMaxDays(4);
                    setStartTime('08:30 AM');
                    setEndTime('04:30 PM');
                    setSelectedDays(['Sat', 'Sun', 'Mon', 'Tue', 'Wed']);
                    setHasGenerated(true);
                    setIsSolving(true);
                    setTimeout(() => {
                      const results = solveCustomSchedule(selectedCourseCodes, {
                        maxDaysPerWeek: 4,
                        preferredDays: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed'],
                        startTime: '08:30 AM',
                        endTime: '04:30 PM',
                        allowTheoryPairOnly: true,
                        preferTopRatedFaculty: true
                      });
                      setSolutions(results);
                      setIsSolving(false);
                    }, 150);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  Expand to 4 Days (Full Day)
                </button>
              </div>
            ) : null}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {solutions.slice(0, 10).map((sol, idx) => {
              const isFirst = idx === 0;
              const isApplied = appliedId === sol.id;

              return (
                <div
                  key={sol.id}
                  className={`rounded-2xl p-5 border transition-all ${
                    isFirst
                      ? isLight
                        ? 'bg-indigo-50/50 border-indigo-300 shadow-sm'
                        : 'bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-900 border-indigo-500/80 shadow-xl'
                      : isLight
                      ? 'bg-white border-slate-200 hover:border-slate-300'
                      : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  {/* Card Header */}
                  <div className={`flex items-start justify-between pb-3 border-b ${
                    isLight ? 'border-slate-200' : 'border-slate-700/60'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-extrabold ${
                          isFirst 
                            ? 'bg-amber-400 text-slate-950' 
                            : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {isFirst ? '★ Recommended' : `Option #${idx + 1}`}
                        </span>
                        <span className={`font-extrabold text-sm font-mono ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}>
                          {sol.daysCount} Days / Week
                        </span>
                      </div>

                      <div className={`flex items-center gap-1.5 mt-1 text-xs ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Days: <strong className={isLight ? 'text-slate-800' : 'text-white'}>{sol.daysUsed.join(', ')}</strong></span>
                        <span>•</span>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{sol.earliestClass} – {sol.latestClass}</span>
                      </div>
                    </div>

                    {/* Rating badge */}
                    <div className="flex items-center gap-1 text-xs font-bold font-mono text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      <Star className="w-3 h-3 fill-emerald-500" />
                      <span>Avg {sol.averageFacultyRating}/10</span>
                    </div>
                  </div>

                  {/* Section Breakdown List with SHORT COURSE NAME shown! e.g. CN, CN Lab, SPL */}
                  <div className="mt-3 space-y-2">
                    {sol.sections.map(sec => {
                      const shortName = getCourseShortName(sec.courseCode, sec.title, sec.isLab);

                      return (
                        <div
                          key={sec.id}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center font-mono flex-shrink-0">
                              {sec.section}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {/* Short name prominent as requested by user */}
                                <span className={`font-bold font-sans ${isLight ? 'text-indigo-900' : 'text-indigo-300'}`}>
                                  {shortName}
                                </span>
                                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                                  isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {sec.courseCode}
                                </span>
                              </div>
                              <span className={`text-[11px] block mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                                {sec.facultyName}
                              </span>
                            </div>
                          </div>

                          <div className={`text-right text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            <span>{sec.days}</span> • <span>{sec.time1}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Apply Button */}
                  <div className={`mt-4 pt-3 border-t flex items-center justify-between ${
                    isLight ? 'border-slate-200' : 'border-slate-700/60'
                  }`}>
                    <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Zero Time Conflicts
                    </span>

                    <button
                      onClick={() => handleApply(sol)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                        isApplied
                          ? 'bg-emerald-600 text-white'
                          : isFirst
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white active:scale-95'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Applied!</span>
                        </>
                      ) : (
                        <>
                          <span>Apply to Timetable</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          </>
        )}
      </div>
    </div>
  );
};
