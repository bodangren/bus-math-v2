export interface LessonSummary {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  orderIndex: number;
}

export interface UnitCurriculum {
  unitNumber: number;
  title: string;
  description: string;
  objectives: string[];
  lessons: LessonSummary[];
}
