/**
 * Gradebook — pure logic for the Teacher Command Center Level 2 view.
 *
 * All functions here are side-effect-free so they can be tested without
 * any database or framework dependencies.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PhaseProgressStatus = 'not_started' | 'in_progress' | 'completed';
export type LessonCompletionStatus = 'not_started' | 'in_progress' | 'completed';
export type CellColor = 'green' | 'yellow' | 'red' | 'gray';

export interface GradebookLesson {
  lessonId: string;
  lessonTitle: string;
  /** 1-based position within the unit. orderIndex === 11 marks the unit test. */
  orderIndex: number;
  /** True when orderIndex === 11 (unit test lesson). */
  isUnitTest: boolean;
}

export interface GradebookCell {
  lesson: GradebookLesson;
  completionStatus: LessonCompletionStatus;
  /** Average mastery level (0–100) for the lesson's primary standard, or null if no data. */
  masteryLevel: number | null;
  /** Deterministic display color derived from completionStatus and masteryLevel. */
  color: CellColor;
}

export interface GradebookRow {
  studentId: string;
  /** Displayed name — falls back to username when displayName is null. */
  displayName: string;
  username: string;
  cells: GradebookCell[];
}

// ---------------------------------------------------------------------------
// computeLessonStatus
// ---------------------------------------------------------------------------

/**
 * Derives a lesson-level completion status from an ordered array of phase
 * statuses (up to 6 phases per lesson).
 *
 * Rules (deterministic):
 *   - Empty array               → not_started
 *   - All phases completed      → completed
 *   - ≥1 phase in_progress or completed (but not all completed) → in_progress
 *   - All phases not_started    → not_started
 */
export function computeLessonStatus(phaseStatuses: PhaseProgressStatus[]): LessonCompletionStatus {
  if (phaseStatuses.length === 0) return 'not_started';
  if (phaseStatuses.every(s => s === 'completed')) return 'completed';
  if (phaseStatuses.some(s => s === 'completed' || s === 'in_progress')) return 'in_progress';
  return 'not_started';
}

// ---------------------------------------------------------------------------
// computeCellColor
// ---------------------------------------------------------------------------

/**
 * Maps completion status + mastery level to a display color.
 *
 * Color contract (from spec):
 *   gray   — no data (not_started AND masteryLevel is null)
 *   green  — completed OR masteryLevel ≥ 80
 *   yellow — in_progress OR masteryLevel 50–79
 *   red    — not_started with masteryLevel < 50 (or 0)
 *
 * Priority: gray < red < yellow < green.
 * A completed lesson is always green even if mastery data is absent.
 */
export function computeCellColor(
  completionStatus: LessonCompletionStatus,
  masteryLevel: number | null,
): CellColor {
  // No engagement at all
  if (completionStatus === 'not_started' && masteryLevel === null) return 'gray';

  // Green: fully done OR high mastery
  if (completionStatus === 'completed' || (masteryLevel !== null && masteryLevel >= 80)) {
    return 'green';
  }

  // Yellow: partially done OR mid-range mastery
  if (completionStatus === 'in_progress' || (masteryLevel !== null && masteryLevel >= 50)) {
    return 'yellow';
  }

  // Red: started (or has some mastery) but below thresholds
  return 'red';
}

// ---------------------------------------------------------------------------
// buildGradebookCell
// ---------------------------------------------------------------------------

/**
 * Assembles a single GradebookCell from raw data.
 *
 * @param lesson     - Lesson identity (id, title, orderIndex, isUnitTest)
 * @param phases     - Array of phase completion statuses for this student × lesson
 * @param masteryLevel - The student's mastery level for the lesson's primary standard (0–100), or null
 */
export function buildGradebookCell(
  lesson: GradebookLesson,
  phases: PhaseProgressStatus[],
  masteryLevel: number | null,
): GradebookCell {
  const completionStatus = computeLessonStatus(phases);
  const color = computeCellColor(completionStatus, masteryLevel);
  return { lesson, completionStatus, masteryLevel, color };
}

// ---------------------------------------------------------------------------
// sortRowsByName
// ---------------------------------------------------------------------------

/**
 * Returns a new array of rows sorted alphabetically by displayName
 * (case-insensitive, ascending). Original array is not mutated.
 * Stable: rows with identical names preserve their relative order.
 */
export function sortRowsByName(rows: GradebookRow[]): GradebookRow[] {
  return [...rows].sort((a, b) => {
    const nameA = a.displayName.toLowerCase();
    const nameB = b.displayName.toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
}

// ---------------------------------------------------------------------------
// Tailwind color class helpers (kept here so the contract is co-located)
// ---------------------------------------------------------------------------

/** Maps a CellColor to the Tailwind background class for a gradebook cell. */
export function cellBgClass(color: CellColor): string {
  switch (color) {
    case 'green':  return 'bg-green-100 text-green-800';
    case 'yellow': return 'bg-yellow-100 text-yellow-800';
    case 'red':    return 'bg-red-100 text-red-800';
    case 'gray':
    default:       return 'bg-muted/30 text-muted-foreground';
  }
}

/** Maps a CellColor to an accessible aria label suffix. */
export function cellColorLabel(color: CellColor): string {
  switch (color) {
    case 'green':  return 'completed';
    case 'yellow': return 'in progress';
    case 'red':    return 'needs attention';
    case 'gray':
    default:       return 'not started';
  }
}

// ---------------------------------------------------------------------------
// applyStudentRowUpdate (pure)
// ---------------------------------------------------------------------------

/**
 * Applies a student account update (name change or deactivation) to a row array.
 *
 * - deactivated: true  → removes the student's row entirely
 * - deactivated: false → updates the row's displayName in place
 *
 * Works with any row shape that has `studentId` and `displayName` fields.
 * Does not mutate the original array.
 */
export function applyStudentRowUpdate<T extends { studentId: string; displayName: string }>(
  rows: T[],
  update: { studentId: string; displayName: string; deactivated: boolean },
): T[] {
  if (update.deactivated) {
    return rows.filter(r => r.studentId !== update.studentId);
  }
  return rows.map(r =>
    r.studentId === update.studentId ? { ...r, displayName: update.displayName } : r,
  );
}

// ---------------------------------------------------------------------------
// Raw row types (used by assembleGradebookRows below)
// ---------------------------------------------------------------------------

export interface RawLesson {
  id: string;
  title: string;
  orderIndex: number;
  unitNumber: number;
}

export interface RawLessonVersion {
  id: string;
  lessonId: string;
}

export interface RawPhaseVersion {
  id: string;
  lessonVersionId: string;
  phaseNumber: number;
}

export interface RawLessonStandard {
  lessonVersionId: string;
  standardId: string;
  isPrimary: boolean;
}

export interface RawStudent {
  id: string;
  username: string;
  displayName: string | null;
}

export interface RawProgressRow {
  userId: string;
  phaseId: string;
  status: PhaseProgressStatus;
}

export interface RawCompetencyRow {
  studentId: string;
  standardId: string;
  masteryLevel: number;
}

// ---------------------------------------------------------------------------
// assembleGradebookRows (pure)
// ---------------------------------------------------------------------------

/**
 * Transforms raw query results into typed GradebookRow[] and GradebookLesson[].
 *
 * - lessons sorted ascending by orderIndex
 * - cells within each row sorted to match lesson order
 * - org-scoping is handled by the caller (only org-scoped students are passed)
 */
export function assembleGradebookRows(
  students: RawStudent[],
  rawLessons: RawLesson[],
  rawLessonVersions: RawLessonVersion[],
  rawPhaseVersions: RawPhaseVersion[],
  rawPrimaryStandards: RawLessonStandard[],
  progressRows: RawProgressRow[],
  competencyRows: RawCompetencyRow[],
): { rows: GradebookRow[]; lessons: GradebookLesson[] } {
  const sortedLessons = [...rawLessons].sort((a, b) => a.orderIndex - b.orderIndex);

  // lessonId → first published lessonVersion id
  const versionByLessonId = new Map<string, string>();
  for (const lv of rawLessonVersions) {
    if (!versionByLessonId.has(lv.lessonId)) {
      versionByLessonId.set(lv.lessonId, lv.id);
    }
  }

  // lessonVersionId → phase ids ordered by phaseNumber
  const phasesByVersion = new Map<string, string[]>();
  const sortedPhases = [...rawPhaseVersions].sort((a, b) => a.phaseNumber - b.phaseNumber);
  for (const pv of sortedPhases) {
    const list = phasesByVersion.get(pv.lessonVersionId) ?? [];
    list.push(pv.id);
    phasesByVersion.set(pv.lessonVersionId, list);
  }

  // lessonVersionId → primary standardId
  const primaryStandardByVersion = new Map<string, string>();
  for (const ls of rawPrimaryStandards) {
    if (ls.isPrimary) {
      primaryStandardByVersion.set(ls.lessonVersionId, ls.standardId);
    }
  }

  // "userId|phaseId" → status
  const progressIndex = new Map<string, PhaseProgressStatus>();
  for (const row of progressRows) {
    progressIndex.set(`${row.userId}|${row.phaseId}`, row.status);
  }

  // "studentId|standardId" → masteryLevel
  const competencyIndex = new Map<string, number>();
  for (const row of competencyRows) {
    competencyIndex.set(`${row.studentId}|${row.standardId}`, row.masteryLevel);
  }

  const gradebookLessons: GradebookLesson[] = sortedLessons.map(lesson => ({
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    orderIndex: lesson.orderIndex,
    isUnitTest: lesson.orderIndex === 11,
  }));

  const rows: GradebookRow[] = students.map(student => {
    const cells = gradebookLessons.map(gl => {
      const lessonVersionId = versionByLessonId.get(gl.lessonId);
      const phaseIds = lessonVersionId ? (phasesByVersion.get(lessonVersionId) ?? []) : [];
      const standardId = lessonVersionId
        ? primaryStandardByVersion.get(lessonVersionId)
        : undefined;

      const phaseStatuses: PhaseProgressStatus[] = phaseIds.map(
        phaseId => progressIndex.get(`${student.id}|${phaseId}`) ?? 'not_started',
      );

      const masteryLevel =
        standardId != null
          ? (competencyIndex.get(`${student.id}|${standardId}`) ?? null)
          : null;

      return buildGradebookCell(gl, phaseStatuses, masteryLevel);
    });

    return {
      studentId: student.id,
      displayName: student.displayName ?? student.username,
      username: student.username,
      cells,
    };
  });

  return { rows, lessons: gradebookLessons };
}
