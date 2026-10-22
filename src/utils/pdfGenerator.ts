import { jsPDF } from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { CourseFacultyRecommendation, RankedFaculty } from '../types';

export interface GeneratePdfOptions {
  recommendations: CourseFacultyRecommendation[];
  totalCredits: number;
  termTitle?: string;
  department?: string;
  institution?: string;
}

export function generateFacultySelectionPdf({
  recommendations,
  totalCredits,
  termTitle = 'FALL 2026 COURSE & FACULTY SELECTION',
  department = 'Dept. of CSE',
  institution = 'United International University'
}: GeneratePdfOptions): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Top Header Banner (Dark Navy)
  const headerHeight = 24;
  doc.setFillColor(12, 26, 45); // #0c1a2d
  doc.rect(10, 10, pageWidth - 20, headerHeight, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(termTitle, 15, 19);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // #94a3b8
  doc.text('Top Reviewed Faculty Per Course (Grouped by Faculty) • Unlisted Faculty Excluded', 15, 27);

  // Right Side Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(institution, pageWidth - 15, 18, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(56, 189, 248); // #38bdf8
  doc.text(`${department} • Total Credits: ${totalCredits.toFixed(2)}`, pageWidth - 15, 26, { align: 'right' });

  // 2. Course Pills Bar under Banner
  let currentY = 38;
  const pillStartX = 10;
  let pillX = pillStartX;

  const dotColors = [
    [56, 189, 248],   // sky
    [16, 185, 129],   // emerald
    [245, 158, 11],   // amber
    [168, 85, 247],   // purple
    [236, 72, 153],   // pink
    [99, 102, 241],   // indigo
    [20, 184, 166],   // teal
  ];

  recommendations.forEach((rec, idx) => {
    const shortTitle = rec.courseTitle.length > 15 ? rec.courseTitle.slice(0, 14) + '...' : rec.courseTitle;
    const pillText = `${rec.courseCode} (${shortTitle})`;
    const textWidth = doc.getTextWidth(pillText);
    const pillWidth = textWidth + 10;

    if (pillX + pillWidth > pageWidth - 10) {
      pillX = pillStartX;
      currentY += 8;
    }

    // Pill background
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(pillX, currentY - 4, pillWidth, 6, 2, 2, 'FD');

    // Colored dot
    const c = dotColors[idx % dotColors.length];
    doc.setFillColor(c[0], c[1], c[2]);
    doc.circle(pillX + 3.5, currentY - 1, 1.2, 'F');

    // Text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(30, 41, 59);
    doc.text(pillText, pillX + 6.5, currentY + 0.2);

    pillX += pillWidth + 3;
  });

  currentY += 8;

  // 3. Prepare Table Rows
  const tableRows: RowInput[] = [];

  recommendations.forEach((rec, courseIdx) => {
    const courseRankPrefix = `${courseIdx + 1}. ${rec.courseTitle}\n(${rec.courseCode})`;

    if (rec.topFaculty.length === 0) {
      tableRows.push([
        courseRankPrefix,
        'No faculty scheduled for Fall 2026',
        '-',
        '-'
      ]);
      return;
    }

    rec.topFaculty.forEach((fac: RankedFaculty, facIdx: number) => {
      const isFirst = facIdx === 0;
      const courseCol = isFirst ? courseRankPrefix : '';

      const ratingText = fac.rating > 0
        ? `${fac.rating.toFixed(1)}/10`
        : 'Unrated / New Faculty';

      const facultyCell = `${fac.facultyName}\n${ratingText}`;
      const secList = fac.sections.map(s => s.section).join(', ');

      const timeStrings = fac.sections.map(s => {
        const roomStr = s.room ? `(${s.room})` : '';
        return `${s.days}: ${s.time1} ${roomStr}`.trim();
      }).join('\n');

      tableRows.push([
        courseCol,
        facultyCell,
        secList,
        timeStrings
      ]);
    });

    if (rec.note) {
      tableRows.push([
        {
          content: `* Note: ${rec.note}`,
          colSpan: 4,
          styles: {
            fontStyle: 'italic',
            textColor: [100, 116, 139],
            fillColor: [248, 250, 252],
            fontSize: 7,
            halign: 'left'
          }
        }
      ]);
    }
  });

  // 4. Generate AutoTable
  autoTable(doc, {
    startY: currentY,
    head: [['COURSE NAME', 'FACULTY NAME', 'RECOMMEND\nSECTIONS', 'DAY AND TIME']],
    body: tableRows,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2.2,
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
      textColor: [30, 41, 59],
      valign: 'middle'
    },
    headStyles: {
      fillColor: [12, 26, 45],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 55 },
      2: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 'auto' }
    },
    margin: { left: 10, right: 10, bottom: 15 },
    didDrawPage: (data) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);

      const footerText = `${termTitle} • UIU CSE`;
      const pageInfo = `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`;

      doc.text(footerText, 10, pageHeight - 8);
      doc.text(pageInfo, pageWidth - 10, pageHeight - 8, { align: 'right' });
    }
  });

  return doc;
}

export function downloadSelectionPdf(options: GeneratePdfOptions, filename?: string): boolean {
  try {
    const doc = generateFacultySelectionPdf(options);
    const fname = filename || `UIU_CSE_Fall_2026_Faculty_Selection_${Date.now().toString().slice(-4)}.pdf`;
    doc.save(fname);
    return true;
  } catch (err) {
    console.error('Failed to generate or download PDF:', err);
    return false;
  }
}
