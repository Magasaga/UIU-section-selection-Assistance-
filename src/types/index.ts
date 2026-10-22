export interface Section {
  id: string;
  sl: number;
  program: 'BSCSE' | 'BSDS';
  courseCode: string;
  title: string;
  section: string;
  days: string; // 'Sat Tue' | 'Sun Wed' | 'Sat' | 'Sun' | 'Mon' | 'Tue' | 'Wed'
  time1: string; // '08:30 AM - 09:50 AM'
  time2: string | null;
  displayTime: string;
  room: string;
  facultyName: string;
  facultyInitial: string;
  credit: number;
  isLab: boolean;
}

export interface Course {
  code: string;
  title: string;
  fullTitle: string;
  credit: number;
  program: 'BSCSE' | 'BSDS';
  isLab: boolean;
  sections: Section[];
  level?: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Elective';
  trimesterCategory?: string;
}

export interface FacultyRating {
  name: string;
  rating: number; // e.g. 9.8
  reviews: number; // e.g. 30
  teaching?: number;
  response?: number;
  workload?: number;
  clarity?: number;
  designation?: string;
}

export interface RankedFaculty {
  facultyName: string;
  facultyInitial?: string;
  rating: number;
  reviews: number;
  score: number; // calculated weighted score
  designation?: string;
  sections: Section[];
  hasRating: boolean;
}

export interface CourseFacultyRecommendation {
  courseCode: string;
  courseTitle: string;
  credit: number;
  isLab: boolean;
  topFaculty: RankedFaculty[];
  totalFacultyCount: number;
  note?: string; // "These are the only faculty who are best"
}

export interface TimeSlot {
  startMinutes: number; // from 00:00
  endMinutes: number;
  startStr: string;
  endStr: string;
}

export interface ScheduleConflict {
  sectionA: Section;
  sectionB: Section;
  day: string;
  overlapMinutes: number;
  timeRange: string;
}

export interface CustomSchedulePreferences {
  maxDaysPerWeek: number; // e.g. 3
  preferredDays: string[]; // e.g. ['Sat', 'Tue', 'Wed']
  startTime: string; // e.g. '11:10 AM'
  endTime: string; // e.g. '04:30 PM'
  allowTheoryPairOnly: boolean; // default true for Sat/Tue, Sun/Wed
  preferTopRatedFaculty: boolean; // prioritize high rating
}

export interface GeneratedScheduleSolution {
  id: string;
  sections: Section[];
  daysUsed: string[];
  daysCount: number;
  averageFacultyRating: number;
  totalReviews: number;
  earliestClass: string;
  latestClass: string;
  score: number;
  hasConflicts: boolean;
}
