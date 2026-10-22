import rawSections from '../data/allSections.json';
import rawCourses from '../data/allCourses.json';
import rawFaculty from '../data/facultyRatings.json';
import { Course, Section, FacultyRating, RankedFaculty, CourseFacultyRecommendation } from '../types';

export const allSections: Section[] = rawSections as Section[];
export const allFacultyRatings: FacultyRating[] = rawFaculty as FacultyRating[];

// Fast faculty lookup map (lowercase normalized)
const facultyMap = new Map<string, FacultyRating>();
allFacultyRatings.forEach(f => {
  facultyMap.set(normalizeName(f.name), f);
});

export function normalizeName(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/^dr\.\s+|^mr\.\s+|^ms\.\s+/i, '')
    .replace(/[.,\-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getFacultyRating(facultyName: string): FacultyRating | null {
  if (!facultyName || facultyName === 'TBA') return null;

  const normalized = normalizeName(facultyName);
  const direct = facultyMap.get(normalized);
  if (direct) return direct;

  for (const [key, val] of facultyMap.entries()) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return val;
    }
    const nameParts = normalized.split(' ');
    const keyParts = key.split(' ');
    if (nameParts.length > 1 && keyParts.length > 1) {
      if (nameParts[0] === keyParts[0] && nameParts[nameParts.length - 1] === keyParts[keyParts.length - 1]) {
        return val;
      }
    }
  }

  return null;
}

/**
 * User Rule:
 * "look a teacher got 10/10 but only few review like 2 or 3 he won't be the best faculty
 * the best faculty will be this guy who got more than 8 review and higher rating"
 *
 * Ranking criteria:
 * Tier 1: Faculty with > 8 reviews, ranked by highest rating and review depth
 * Tier 2: Faculty with 4-8 reviews
 * Tier 3: Faculty with <= 3 reviews (even if 10.0, they rank below teachers with > 8 reviews)
 */
export function calculateFacultyScore(rating: number, reviews: number): number {
  if (rating <= 0) return 0;
  
  if (reviews > 8) {
    // Primary tier: heavily prioritize teachers with > 8 reviews
    return 1000 + (rating * 20) + Math.min(reviews, 50) * 0.5;
  } else if (reviews >= 4) {
    // Moderate review tier
    return 200 + (rating * 10) + reviews;
  } else {
    // Low reviews (<= 3): cannot outrank verified professors with > 8 reviews
    return 20 + (rating * 2) + reviews;
  }
}

/**
 * UIU CSE Trimester Mapping (Trimesters 1 to 12)
 */
export function getTrimesterNumber(courseCode: string): number {
  const code = courseCode.toUpperCase();
  // Trimester 1
  if (code.includes('CSE 1110') || code.includes('ENG 1011') || code.includes('MATH 1151') || code.includes('BDS 1201')) return 1;
  // Trimester 2
  if (code.includes('CSE 1111') || code.includes('CSE 1112') || code.includes('ENG 1013') || code.includes('GED 1005')) return 2;
  // Trimester 3
  if (code.includes('CSE 1115') || code.includes('CSE 1116') || code.includes('PHY 2105') || code.includes('PHY 2106') || code.includes('MATH 2201')) return 3;
  // Trimester 4
  if (code.includes('CSE 2213') || code.includes('CSE 2215') || code.includes('CSE 2216') || code.includes('EEE 2113') || code.includes('EEE 2124')) return 4;
  // Trimester 5
  if (code.includes('CSE 2217') || code.includes('CSE 2218') || code.includes('EEE 2123') || code.includes('MATH 2183')) return 5;
  // Trimester 6
  if (code.includes('CSE 2233') || code.includes('CSE 2118') || code.includes('MATH 2205') || code.includes('SOC 2101')) return 6;
  // Trimester 7
  if (code.includes('CSE 3313') || code.includes('CSE 3411') || code.includes('CSE 3412') || code.includes('BIO 3105')) return 7;
  // Trimester 8
  if (code.includes('CSE 3521') || code.includes('CSE 3522') || code.includes('CSE 3421') || code.includes('CSE 3422') || code.includes('IPE 3401')) return 8;
  // Trimester 9
  if (code.includes('CSE 3711') || code.includes('CSE 3712') || code.includes('CSE 3811') || code.includes('CSE 3812') || code.includes('ACT 2111')) return 9;
  // Trimester 10
  if (code.includes('CSE 4165') || code.includes('CSE 4325') || code.includes('CSE 4326') || code.includes('PMG 4101')) return 10;
  // Trimester 11
  if (code.includes('CSE 4509') || code.includes('CSE 4510') || code.includes('CSE 4531') || code.includes('ECO 4101')) return 11;
  // Trimester 12 & Capstone/Electives
  if (code.includes('CSE 4000A') || code.includes('CSE 4611') || code.includes('CSE 4889') || code.includes('CSE 4891') || code.includes('CSE 4811') || code.includes('CSE 4813') || code.includes('CSE 4181') || code.includes('CSE 4587') || code.includes('CSE 4945')) return 12;

  // Fallback by course number
  const numMatch = courseCode.match(/\d{4}/);
  if (numMatch) {
    const num = parseInt(numMatch[0], 10);
    if (num < 1200) return 1;
    if (num < 1500) return 2;
    if (num < 2200) return 4;
    if (num < 2300) return 5;
    if (num < 3400) return 7;
    if (num < 3600) return 8;
    if (num < 3900) return 9;
    if (num < 4400) return 10;
    if (num < 4600) return 11;
    return 12;
  }
  return 7;
}

export function getTrimesterGroup(courseCode: string): '1-3' | '4-6' | '7-9' | '10-12' {
  const tri = getTrimesterNumber(courseCode);
  if (tri <= 3) return '1-3';
  if (tri <= 6) return '4-6';
  if (tri <= 9) return '7-9';
  return '10-12';
}

export const allCourses: Course[] = (rawCourses as Course[]).map(c => {
  const tri = getTrimesterNumber(c.code);
  return {
    ...c,
    trimesterCategory: `Trimester ${tri}`
  };
});

// Map for quick course lookup
export const courseByCodeMap = new Map<string, Course>();
allCourses.forEach(c => courseByCodeMap.set(c.code.toUpperCase().replace(/\s+/g, ' '), c));

export function getCourseByCode(code: string): Course | undefined {
  const normalized = (code || '').toUpperCase().replace(/\s+/g, ' ').trim();
  return courseByCodeMap.get(normalized);
}

/**
 * Returns Top 4 ranked faculty for a course
 * Strictly prioritizing faculty who have > 8 reviews and higher rating
 */
export function getRankedFacultyForCourse(courseCode: string): RankedFaculty[] {
  const course = getCourseByCode(courseCode);
  if (!course) return [];

  // Group sections by faculty
  const facultySectionsMap = new Map<string, Section[]>();
  course.sections.forEach(sec => {
    const fName = sec.facultyName || 'TBA';
    if (!facultySectionsMap.has(fName)) {
      facultySectionsMap.set(fName, []);
    }
    facultySectionsMap.get(fName)!.push(sec);
  });

  const rankedList: RankedFaculty[] = [];

  for (const [facName, sections] of facultySectionsMap.entries()) {
    if (facName === 'TBA') {
      rankedList.push({
        facultyName: 'TBA (To Be Announced)',
        facultyInitial: 'TBA',
        rating: 0,
        reviews: 0,
        score: -1,
        sections,
        hasRating: false
      });
      continue;
    }

    const reviewInfo = getFacultyRating(facName);
    const rating = reviewInfo ? reviewInfo.rating : 0;
    const reviews = reviewInfo ? reviewInfo.reviews : 0;
    const score = calculateFacultyScore(rating, reviews);

    rankedList.push({
      facultyName: facName,
      facultyInitial: sections[0]?.facultyInitial,
      rating,
      reviews,
      score,
      designation: reviewInfo?.designation,
      sections,
      hasRating: rating > 0
    });
  }

  // Sort: Teachers with > 8 reviews and higher rating come first
  rankedList.sort((a, b) => {
    // Compare calculated score which separates > 8 reviews from few reviews
    if (b.score !== a.score) return b.score - a.score;
    // Then rating
    if (b.rating !== a.rating) return b.rating - a.rating;
    // Then reviews
    return (b.reviews || 0) - (a.reviews || 0);
  });

  return rankedList;
}

/**
 * Returns top 4 recommendations per course + note if fewer than 4 best faculty
 */
export function getRecommendationsForCourses(courseCodes: string[]): CourseFacultyRecommendation[] {
  return courseCodes.map(code => {
    const course = getCourseByCode(code);
    if (!course) {
      return {
        courseCode: code,
        courseTitle: code,
        credit: 3,
        isLab: false,
        topFaculty: [],
        totalFacultyCount: 0,
        note: 'Course not found in Fall 2026 offerings'
      };
    }

    const allRanked = getRankedFacultyForCourse(code);
    const ratedFaculty = allRanked.filter(f => f.hasRating);
    const topFaculty = (ratedFaculty.length > 0 ? ratedFaculty : allRanked).slice(0, 4);

    let note: string | undefined = undefined;
    if (topFaculty.length < 4) {
      if (topFaculty.length === 1) {
        note = 'This is the only faculty who is best for this course.';
      } else {
        note = `These are the only ${topFaculty.length} faculty who are best for this course.`;
      }
    }

    return {
      courseCode: course.code,
      courseTitle: course.title,
      credit: course.credit,
      isLab: course.isLab,
      topFaculty,
      totalFacultyCount: allRanked.length,
      note
    };
  });
}
