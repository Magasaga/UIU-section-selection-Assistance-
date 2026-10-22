import React from 'react';
import { 
  Table, 
  Printer, 
  Download, 
  Copy, 
  FileDown, 
  Check, 
  Star
} from 'lucide-react';
import { CourseFacultyRecommendation } from '../types';

interface TableFallbackViewProps {
  recommendations: CourseFacultyRecommendation[];
  totalCredits: number;
  onGeneratePdf: () => void;
  onClose?: () => void;
}

export const TableFallbackView: React.FC<TableFallbackViewProps> = ({
  recommendations,
  totalCredits,
  onGeneratePdf,
  onClose
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyText = () => {
    let t = `FALL 2026 COURSE & FACULTY SELECTION - UIU CSE (Total Credits: ${totalCredits.toFixed(2)})\n\n`;
    recommendations.forEach(r => {
      t += `Course: ${r.courseTitle} (${r.courseCode}) - ${r.credit} Credits\n`;
      r.topFaculty.forEach((f, i) => {
        t += `  ${i + 1}. ${f.facultyName} (${f.rating > 0 ? f.rating + '/10' : 'Unrated'})\n`;
        f.sections.forEach(s => {
          t += `     Sec ${s.section}: ${s.days} ${s.time1} ${s.room ? '(' + s.room + ')' : ''}\n`;
        });
      });
      if (r.note) t += `  * Note: ${r.note}\n`;
      t += '\n';
    });

    navigator.clipboard.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = ['Course Code', 'Course Title', 'Credit', 'Faculty Rank', 'Faculty Name', 'Faculty Rating', 'Sections', 'Day & Time'];
    const rows: string[][] = [headers];

    recommendations.forEach(r => {
      r.topFaculty.forEach((f, idx) => {
        const secList = f.sections.map(s => s.section).join(' / ');
        const times = f.sections.map(s => `${s.days} ${s.time1} ${s.room ? '(' + s.room + ')' : ''}`).join('; ');
        rows.push([
          `"${r.courseCode}"`,
          `"${r.courseTitle}"`,
          `"${r.credit}"`,
          `"#${idx + 1}"`,
          `"${f.facultyName}"`,
          `"${f.rating > 0 ? f.rating : 'N/A'}"`,
          `"${secList}"`,
          `"${times}"`
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UIU_CSE_Fall_2026_Faculty_Guide_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (recommendations.length === 0) {
    return (
      <div className="bg-slate-800/80 rounded-2xl p-8 border border-slate-700 text-center">
        <p className="text-sm text-slate-400">No courses selected to display in table view.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Table className="w-5 h-5 text-emerald-400" />
            <span>Course & Faculty Selection Table</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Table layout matching the official UIU CSE Fall 2026 PDF document.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={onGeneratePdf}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Generate PDF</span>
          </button>
        </div>
      </div>

      {/* Rendered Document Sheet Container */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-700/80 shadow-2xl p-4 sm:p-6 text-slate-900 overflow-x-auto print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
        <div className="min-w-[760px] bg-white rounded-xl shadow p-6 border border-slate-300 print:shadow-none print:border-none">
          {/* Header Banner */}
          <div className="bg-[#0c1a2d] text-white p-4 rounded-xl flex items-center justify-between">
            <div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight uppercase">
                FALL 2026 COURSE & FACULTY SELECTION
              </h1>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Top Reviewed Faculty Per Course (Grouped by Faculty) • Unlisted Faculty Excluded
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold">United International University</div>
              <div className="text-[11px] text-sky-400 font-semibold">
                Dept. of CSE • Total Credits: {totalCredits.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Course Badges Bar */}
          <div className="mt-3 flex flex-wrap gap-2 pb-3 border-b border-slate-200">
            {recommendations.map(r => (
              <span
                key={r.courseCode}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-300 text-[11px] font-bold text-slate-800"
              >
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                <span>{r.courseCode} ({r.courseTitle.length > 14 ? r.courseTitle.slice(0, 13) + '..' : r.courseTitle})</span>
              </span>
            ))}
          </div>

          {/* Formatted Guide Table */}
          <table className="w-full mt-4 border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-[#0c1a2d] text-white uppercase text-[11px]">
                <th className="p-2.5 text-left border border-slate-700 w-[24%]">Course Name</th>
                <th className="p-2.5 text-left border border-slate-700 w-[26%]">Faculty Name</th>
                <th className="p-2.5 text-center border border-slate-700 w-[15%]">Recommend Sections</th>
                <th className="p-2.5 text-left border border-slate-700 w-[35%]">Day and Time</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((rec, courseIdx) => {
                return (
                  <React.Fragment key={rec.courseCode}>
                    {rec.topFaculty.map((fac, facIdx) => {
                      const isFirst = facIdx === 0;

                      return (
                        <tr
                          key={`${rec.courseCode}_${fac.facultyName}`}
                          className="hover:bg-slate-50 transition-colors border-t border-slate-200"
                        >
                          {isFirst ? (
                            <td
                              rowSpan={rec.topFaculty.length}
                              className="p-2.5 font-bold align-top border-r border-slate-300 bg-slate-50/60"
                            >
                              <div className="text-slate-900 font-extrabold">
                                {courseIdx + 1}. {rec.courseTitle}
                              </div>
                              <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                                ({rec.courseCode})
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1">
                                {rec.credit} Credit{rec.credit > 1 ? 's' : ''} • {rec.isLab ? 'Lab' : 'Theory'}
                              </div>
                            </td>
                          ) : null}

                          <td className="p-2.5 align-middle border-r border-slate-300">
                            <div className="font-bold text-slate-900">
                              {fac.facultyName}
                            </div>
                            {fac.rating > 0 && (
                              <div className="mt-1 flex items-center gap-1">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                                  <Star className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
                                  {fac.rating.toFixed(1)}/10
                                </span>
                              </div>
                            )}
                          </td>

                          <td className="p-2.5 text-center align-middle border-r border-slate-300">
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                              {fac.sections.map(s => (
                                <span
                                  key={s.id}
                                  className="w-6 h-6 rounded bg-indigo-600 text-white font-extrabold text-[11px] font-mono inline-flex items-center justify-center shadow-xs"
                                >
                                  {s.section}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="p-2.5 align-middle">
                            <div className="space-y-1">
                              {fac.sections.map(s => (
                                <div key={s.id} className="text-[11px] leading-tight">
                                  <span className="font-semibold text-slate-800">{s.days}:</span>{' '}
                                  <span className="font-mono text-slate-700">{s.time1}</span>{' '}
                                  {s.room && (
                                    <span className="text-slate-500 font-medium">({s.room})</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {rec.note && (
                      <tr className="bg-amber-50/80 border-b border-slate-300 text-[11px] text-amber-900 font-medium">
                        <td colSpan={4} className="p-2 px-3 italic">
                          ✨ Note: {rec.note}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
            <span>Fall 2026 Course & Faculty Selection Guide • UIU CSE</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
