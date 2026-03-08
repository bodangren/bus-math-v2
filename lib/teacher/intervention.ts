export interface StudentDashboardRow {
  id: string;
  username: string;
  displayName: string | null;
  completedPhases: number;
  totalPhases: number;
  progressPercentage: number;
  lastActive: string | null;
}

export type InterventionStatus = "at_risk" | "inactive" | "on_track" | "completed";
export type InterventionFilter = "all" | "at_risk" | "inactive" | "on_track" | "completed";

export interface DerivedStudentIntervention extends StudentDashboardRow {
  status: InterventionStatus;
  isAtRisk: boolean;
  isInactive: boolean;
  isCompleted: boolean;
  isRecentlyActive: boolean;
  needsAttention: boolean;
  sortName: string;
  lastActiveTimestamp: number | null;
}

const RECENT_ACTIVITY_WINDOW_DAYS = 7;
const COMPLETED_THRESHOLD = 99.5;
const AT_RISK_THRESHOLD = 50;

function clampPercentage(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

function getLastActiveTimestamp(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.getTime();
}

function isActiveWithinDays(value: string | null, days: number) {
  const timestamp = getLastActiveTimestamp(value);
  if (timestamp === null) {
    return false;
  }

  return Date.now() - timestamp <= days * 24 * 60 * 60 * 1000;
}

export function deriveStudentIntervention(
  student: StudentDashboardRow,
): DerivedStudentIntervention {
  const progressPercentage = clampPercentage(student.progressPercentage);
  const isCompleted = progressPercentage >= COMPLETED_THRESHOLD;
  const isAtRisk = progressPercentage < AT_RISK_THRESHOLD;
  const isRecentlyActive = isActiveWithinDays(
    student.lastActive,
    RECENT_ACTIVITY_WINDOW_DAYS,
  );
  const isInactive = !isCompleted && !isRecentlyActive;

  let status: InterventionStatus = "on_track";

  if (isCompleted) {
    status = "completed";
  } else if (isAtRisk) {
    status = "at_risk";
  } else if (isInactive) {
    status = "inactive";
  }

  return {
    ...student,
    progressPercentage,
    status,
    isAtRisk,
    isInactive,
    isCompleted,
    isRecentlyActive,
    needsAttention: isAtRisk || isInactive,
    sortName: (student.displayName ?? student.username).toLowerCase(),
    lastActiveTimestamp: getLastActiveTimestamp(student.lastActive),
  };
}

function interventionPriority(student: DerivedStudentIntervention) {
  if (student.isAtRisk && student.isInactive) return 0;
  if (student.isAtRisk) return 1;
  if (student.isInactive) return 2;
  if (student.isCompleted) return 4;
  return 3;
}

export function prioritizeInterventionRows(
  students: StudentDashboardRow[],
): DerivedStudentIntervention[] {
  return students
    .map(deriveStudentIntervention)
    .sort((a, b) => {
      const priorityDiff = interventionPriority(a) - interventionPriority(b);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      if (a.progressPercentage !== b.progressPercentage) {
        return a.progressPercentage - b.progressPercentage;
      }

      const timeA = a.lastActiveTimestamp ?? Number.NEGATIVE_INFINITY;
      const timeB = b.lastActiveTimestamp ?? Number.NEGATIVE_INFINITY;
      if (timeA !== timeB) {
        return timeA - timeB;
      }

      return a.sortName.localeCompare(b.sortName);
    });
}

export function applyInterventionFilter(
  students: StudentDashboardRow[],
  filter: InterventionFilter,
): DerivedStudentIntervention[] {
  const derived = prioritizeInterventionRows(students);

  switch (filter) {
    case "at_risk":
      return derived.filter((student) => student.isAtRisk);
    case "inactive":
      return derived.filter((student) => student.isInactive);
    case "on_track":
      return derived.filter(
        (student) =>
          !student.isCompleted && !student.isAtRisk && !student.isInactive,
      );
    case "completed":
      return derived.filter((student) => student.isCompleted);
    case "all":
    default:
      return derived;
  }
}

export function buildInterventionSummary(students: StudentDashboardRow[]) {
  const derived = students.map(deriveStudentIntervention);

  return {
    total: derived.length,
    activeThisWeek: derived.filter((student) => student.isRecentlyActive).length,
    atRisk: derived.filter((student) => student.isAtRisk).length,
    inactive: derived.filter((student) => student.isInactive).length,
    completed: derived.filter((student) => student.isCompleted).length,
    onTrack: derived.filter(
      (student) =>
        !student.isCompleted && !student.isAtRisk && !student.isInactive,
    ).length,
    needsAttention: derived.filter((student) => student.needsAttention).length,
  };
}

export function interventionStatusLabel(status: InterventionStatus) {
  switch (status) {
    case "at_risk":
      return "At Risk";
    case "inactive":
      return "Inactive";
    case "completed":
      return "Completed";
    case "on_track":
    default:
      return "On Track";
  }
}

export const __private__ = {
  clampPercentage,
  getLastActiveTimestamp,
  isActiveWithinDays,
  interventionPriority,
};
