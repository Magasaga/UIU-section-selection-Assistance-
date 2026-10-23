import React from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  Clock, 
  Users,
  Sun,
  Moon,
  MessageSquare
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'selection' | 'custom' | 'evaluation' | 'directory';
  setActiveTab: (tab: 'selection' | 'custom' | 'evaluation' | 'directory') => void;
  selectedCourseCodes: string[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedCourseCodes,
  theme,
  onToggleTheme
}) => {
  const isLight = theme === 'light';

  return (
    <header className={`sticky top-0 z-40 border-b transition-colors ${
      isLight 
        ? 'bg-white/95 border-slate-200 text-slate-800 backdrop-blur-md' 
        : 'bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand - ONLY UIU CSE section assistant */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-extrabold shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className={`font-extrabold tracking-tight text-base sm:text-lg ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              UIU CSE Section Assistant
            </h1>
          </div>

          {/* Menu Bar: Course & Faculty, Custom Scheduling, Evaluation, Faculty Directory */}
          <nav className={`hidden md:flex items-center gap-1 p-1 rounded-xl border ${
            isLight 
              ? 'bg-slate-100 border-slate-200' 
              : 'bg-slate-800/80 border-slate-700/60'
          }`}>
            <button
              onClick={() => setActiveTab('selection')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'selection'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Course & Faculty</span>
              {selectedCourseCodes.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === 'selection' ? 'bg-white/20 text-white' : isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-700 text-slate-200'
                }`}>
                  {selectedCourseCodes.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('custom')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'custom'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Custom Scheduling</span>
            </button>

            {/* New Menu: Evaluation */}
            <button
              onClick={() => setActiveTab('evaluation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'evaluation'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
              <span>Evaluation</span>
              <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                Soon
              </span>
            </button>

            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'directory'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Faculty Directory</span>
            </button>
          </nav>

          {/* Light / Dark Mode Toggle Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 shadow-xs' 
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 shadow-xs'
              }`}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {isLight ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Bar */}
        <div className={`flex md:hidden items-center justify-around py-2 border-t text-xs overflow-x-auto ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <button
            onClick={() => setActiveTab('selection')}
            className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'selection' 
                ? 'bg-indigo-600 text-white' 
                : isLight ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Courses</span>
            {selectedCourseCodes.length > 0 && (
              <span className="px-1 bg-white/20 rounded-full text-[10px]">
                {selectedCourseCodes.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'custom' 
                ? 'bg-indigo-600 text-white' 
                : isLight ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Custom</span>
          </button>

          <button
            onClick={() => setActiveTab('evaluation')}
            className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'evaluation' 
                ? 'bg-indigo-600 text-white' 
                : isLight ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
            <span>Evaluation</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'directory' 
                ? 'bg-indigo-600 text-white' 
                : isLight ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Faculty</span>
          </button>
        </div>
      </div>
    </header>
  );
};
