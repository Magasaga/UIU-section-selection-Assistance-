import React, { useState } from 'react';
import { 
  FileDown, 
  Printer, 
  Table, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CourseFacultyRecommendation } from '../types';
import { downloadSelectionPdf, generateFacultySelectionPdf } from '../utils/pdfGenerator';

interface PdfPreviewModalProps {
  recommendations: CourseFacultyRecommendation[];
  totalCredits: number;
  onClose: () => void;
  onOpenTableFallback: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  recommendations,
  totalCredits,
  onClose,
  onOpenTableFallback
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<boolean | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const ok = downloadSelectionPdf({
        recommendations,
        totalCredits
      });

      setIsGenerating(false);
      setDownloadSuccess(ok);

      if (ok) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                Download Fall 2026 PDF Selection Guide
              </h3>
              <p className="text-xs text-slate-400">
                UIU CSE Top 4 Faculty Routine Document
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

        {/* Guide Details Summary */}
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-700">
            <span className="text-slate-400">Selected Courses ({recommendations.length}):</span>
            <span className="text-white font-mono font-bold">
              {recommendations.map(r => r.courseCode).join(', ')}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-700">
            <span className="text-slate-400">Total Enrolled Credits:</span>
            <span className="text-orange-400 font-mono font-bold">
              {totalCredits.toFixed(2)} Credits
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Layout Format:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Standard UIU Header & Colored Section Badges
            </span>
          </div>
        </div>

        {/* Download Feedback Alert */}
        {downloadSuccess === true && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              PDF downloaded successfully! Check your browser downloads folder.
            </span>
          </div>
        )}

        {downloadSuccess === false && (
          <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">PDF generation fallback triggered</p>
              <p className="text-[11px] text-amber-300 mt-0.5">
                Your browser may have blocked automatic PDF downloading. You can use the fallback interactive table or print view below!
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Generating Official PDF...' : 'Download PDF Document'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenTableFallback();
              }}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Table className="w-3.5 h-3.5 text-emerald-400" />
              <span>View Table Fallback</span>
            </button>

            <button
              onClick={() => {
                onClose();
                window.print();
              }}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>Print Routine</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
