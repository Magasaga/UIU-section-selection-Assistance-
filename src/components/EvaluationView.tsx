import React from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  ShieldCheck, 
  BarChart3, 
  GraduationCap, 
  Clock, 
  CheckCircle2,
  Zap
} from 'lucide-react';

interface EvaluationViewProps {
  theme: 'light' | 'dark';
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({ theme }) => {
  const isLight = theme === 'light';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-fadeIn">
      {/* Hero Box */}
      <div className={`rounded-3xl p-8 sm:p-12 text-center border relative overflow-hidden shadow-xl transition-all ${
        isLight
          ? 'bg-gradient-to-b from-white via-indigo-50/40 to-slate-50 border-indigo-100'
          : 'bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-slate-800'
      }`}>
        {/* Glow decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 space-y-4">
          {/* Coming Soon Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-indigo-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-extrabold uppercase tracking-widest shadow-xs">
            <Sparkles className="w-4 h-4 text-orange-500 animate-spin" />
            <span>Coming Soon</span>
          </div>

          <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            Something Big is Coming Soon!
          </h1>

          <p className={`text-sm sm:text-base max-w-xl mx-auto leading-relaxed ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}>
            We are working on an authentic, student-driven faculty review & evaluation system for UIU CSE students.
          </p>

          {/* Highlighted Box-Type Message as requested by user */}
          <div className={`mt-6 p-6 rounded-2xl border text-left max-w-2xl mx-auto transition-all shadow-md ${
            isLight
              ? 'bg-white border-indigo-200/80 shadow-indigo-100/50'
              : 'bg-slate-800/90 border-indigo-500/30 shadow-indigo-950/30'
          }`}>
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className={`font-bold text-sm sm:text-base ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  Interactive Faculty Reviews & Evaluations
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${
                  isLight ? 'text-slate-600' : 'text-slate-300'
                }`}>
                  From next trimester, you can directly check authentic faculty reviews, detailed student evaluations, exam patterns, and grading insights right from here!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Sneak Peek Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Senior-Verified Reviews
          </h4>
          <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Genuine insights on explanation quality, lecture pacing, and mid/final term preparation from students who took the course.
          </p>
        </div>

        <div className={`p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center mb-3">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Grading & Exam Strictness
          </h4>
          <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Anonymous statistics on assignment loads, lab quiz difficulty, and grading leniency for each theory and lab section.
          </p>
        </div>

        <div className={`p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-3">
            <Zap className="w-4 h-4" />
          </div>
          <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Direct Section Rating
          </h4>
          <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            After each trimester finishes, rate your experience to help the next batch of UIU CSE juniors choose the best sections.
          </p>
        </div>
      </div>

      {/* Footer Info Notice */}
      <div className={`p-4 rounded-xl border text-center text-xs ${
        isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-900/60 border-slate-800 text-slate-400'
      }`}>
        <span>Stay tuned! This feature will be launched ahead of the upcoming trimester registration.</span>
      </div>
    </div>
  );
};
