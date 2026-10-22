import { Section, ScheduleConflict, CustomSchedulePreferences, GeneratedScheduleSolution } from '../types';
import { getFacultyRating, calculateFacultyScore, getCourseByCode } from './courseData';

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export function parseTimeInterval(intervalStr: string): { start: number; end: number } | null {
  if (!intervalStr) return null;
  const parts = intervalStr.split('-');
  if (parts.length < 2) return null;

  const start = parseTimeToMinutes(parts[0]);
  const end = parseTimeToMinutes(parts[1]);

  if (start >= end) return null;
  return { start, end };
}

export function formatMinutesToTime(mins: number): string {
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

export function getDaysList(daysStr: string): string[] {
  if (!daysStr) return [];
  if (daysStr === 'Sat Tue') return ['Sat', 'Tue'];
  if (daysStr === 'Sun Wed') return ['Sun', 'Wed'];
  return daysStr.split(/\s+/).filter(Boolean);
}

export function detectConflictBetweenSections(secA: Section, secB: Section): ScheduleConflict | null {
  if (secA.id === secB.id || secA.courseCode === secB.courseCode) return null;

  const daysA = getDaysList(secA.days);
  const daysB = getDaysList(secB.days);

  const sharedDays = daysA.filter(d => daysB.includes(d));
  if (sharedDays.length === 0) return null;

  const rangeA = parseTimeInterval(secA.time1);
  const rangeB = parseTimeInterval(secB.time1);

  if (!rangeA || !rangeB) return null;

  // Check overlap: max(startA, startB) < min(endA, endB)
  const overlapStart = Math.max(rangeA.start, rangeB.start);
  const overlapEnd = Math.min(rangeA.end, rangeB.end);

  if (overlapStart < overlapEnd) {
    return {
      sectionA: secA,
      sectionB: secB,
      day: sharedDays.join(', '),
      overlapMinutes: overlapEnd - overlapStart,
      timeRange: `${formatMinutesToTime(overlapStart)} – ${formatMinutesToTime(overlapEnd)}`
    };
  }

  return null;
}

export function findScheduleConflicts(sections: Section[]): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];

  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      const conflict = detectConflictBetweenSections(sections[i], sections[j]);
      if (conflict) {
        conflicts.push(conflict);
      }
    }
  }

  return conflicts;
}

/**
 * Finds alternative sections for a course that don't conflict with current schedule
 */
export function getAlternativeSections(
  currentSection: Section,
  allChosenSections: Section[]
): { section: Section; facultyRating: number; reviews: number; hasConflict: boolean }[] {
  const course = getCourseByCode(currentSection.courseCode);
  if (!course) return [];

  const otherSections = allChosenSections.filter(s => s.courseCode !== currentSection.courseCode);

  return course.sections.map(sec => {
    let hasConflict = false;
    for (const other of otherSections) {
      if (detectConflictBetweenSections(sec, other)) {
        hasConflict = true;
        break;
      }
    }

    const f = getFacultyRating(sec.facultyName);
    return {
      section: sec,
      facultyRating: f ? f.rating : 0,
      reviews: f ? f.reviews : 0,
      hasConflict
    };
  }).sort((a, b) => {
    // Conflict-free first, then highest rating
    if (a.hasConflict !== b.hasConflict) return a.hasConflict ? 1 : -1;
    return b.facultyRating - a.facultyRating || b.reviews - a.reviews;
  });
}

/**
 * Solves optimal schedule given course codes and custom preferences:
 * - maxDaysPerWeek (e.g. 3)
 * - startTime to endTime window (e.g. 11:10 AM to 04:30 PM)
 * - Sat/Tue & Sun/Wed theory course pairing
 */
export function solveCustomSchedule(
  courseCodes: string[],
  preferences: CustomSchedulePreferences
): GeneratedScheduleSolution[] {
  if (courseCodes.length === 0) return [];

  const minTime = parseTimeToMinutes(preferences.startTime || '11:10 AM');
  const maxTime = parseTimeToMinutes(preferences.endTime || '04:30 PM');
  const maxDays = preferences.maxDaysPerWeek || 3;
  const allowedDays = preferences.preferredDays && preferences.preferredDays.length > 0
    ? preferences.preferredDays
    : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed'];

  // 1. Gather Candidate sections for each course
  const candidatesPerCourse: Section[][] = [];

  for (const code of courseCodes) {
    const course = getCourseByCode(code);
    if (!course || course.sections.length === 0) continue;

    // Filter candidate sections:
    // Fits strictly within time window (with 10-minute grace period)
    const validSections = course.sections.filter(sec => {
      const range = parseTimeInterval(sec.time1);
      if (!range) return false;

      // Within time bounds
      if (range.start < minTime - 5 || range.end > maxTime + 5) return false;

      // Days must belong to preferred days if specified
      const secDays = getDaysList(sec.days);
      const daysAllowed = secDays.every(d => allowedDays.includes(d));
      if (!daysAllowed) return false;

      return true;
    });

    // If no section fit strictly inside the window, fall back to all sections for this course
    // so user still gets schedules even if strict filter is slightly too tight
    const pool = validSections.length > 0 ? validSections : course.sections;

    // Sort candidate sections by faculty score descending so solver picks the best first
    const sorted = [...pool].sort((a, b) => {
      const fA = getFacultyRating(a.facultyName);
      const fB = getFacultyRating(b.facultyName);
      const scoreA = calculateFacultyScore(fA?.rating || 0, fA?.reviews || 0);
      const scoreB = calculateFacultyScore(fB?.rating || 0, fB?.reviews || 0);
      return scoreB - scoreA;
    });

    candidatesPerCourse.push(sorted);
  }

  if (candidatesPerCourse.length === 0) return [];

  const solutions: GeneratedScheduleSolution[] = [];
  const MAX_SOLUTIONS = 30;

  function backtrack(courseIdx: number, currentSections: Section[], currentDays: Set<string>) {
    if (solutions.length >= MAX_SOLUTIONS) return;

    if (courseIdx === candidatesPerCourse.length) {
      // Calculate schedule metrics
      let totalRating = 0;
      let totalReviews = 0;
      let earliest = 24 * 60;
      let latest = 0;

      currentSections.forEach(s => {
        const f = getFacultyRating(s.facultyName);
        totalRating += (f ? f.rating : 5.0);
        totalReviews += (f ? f.reviews : 0);
        const r = parseTimeInterval(s.time1);
        if (r) {
          if (r.start < earliest) earliest = r.start;
          if (r.end > latest) latest = r.end;
        }
      });

      const avgRating = +(totalRating / currentSections.length).toFixed(2);
      const daysArr = Array.from(currentDays);

      // Score prioritizes fewer days + higher faculty rating
      const dayBonus = (7 - daysArr.length) * 2;
      const compositeScore = +(avgRating * 2 + dayBonus + Math.min(totalReviews, 50) * 0.05).toFixed(2);

      solutions.push({
        id: `sched_${solutions.length + 1}`,
        sections: [...currentSections],
        daysUsed: daysArr,
        daysCount: daysArr.length,
        averageFacultyRating: avgRating,
        totalReviews,
        earliestClass: formatMinutesToTime(earliest),
        latestClass: formatMinutesToTime(latest),
        score: compositeScore,
        hasConflicts: false
      });
      return;
    }

    const currentCourseSections = candidatesPerCourse[courseIdx];

    for (const sec of currentCourseSections) {
      // Conflict check
      let hasClash = false;
      for (const chosen of currentSections) {
        if (detectConflictBetweenSections(sec, chosen)) {
          hasClash = true;
          break;
        }
      }
      if (hasClash) continue;

      // Day limit check
      const secDays = getDaysList(sec.days);
      const nextDays = new Set(currentDays);
      secDays.forEach(d => nextDays.add(d));

      if (nextDays.size > maxDays) {
        continue; // Exceeds target days per week
      }

      currentSections.push(sec);
      backtrack(courseIdx + 1, currentSections, nextDays);
      currentSections.pop();
    }
  }

  backtrack(0, [], new Set<string>());

  // Sort solutions by score descending
  solutions.sort((a, b) => b.score - a.score || b.averageFacultyRating - a.averageFacultyRating);

  return solutions;
}
