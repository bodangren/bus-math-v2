import {
  deriveStudentIntervention,
  type StudentDashboardRow,
} from "@/lib/teacher/intervention";
import {
  clampTeacherProgressPercentage,
  formatTeacherLastActiveDate,
  formatTeacherProgressPercentage,
} from "@/lib/teacher/progress";

const HEADERS = [
  "Username",
  "Display Name",
  "Status",
  "Needs Attention",
  "Progress %",
  "Completed Phases",
  "Total Phases",
  "Last Active",
] as const;

function escapeCsvValue(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function studentRowsToCsv(students: StudentDashboardRow[]) {
  const rows = [HEADERS.join(",")];

  students.forEach((student) => {
    const derived = deriveStudentIntervention(student);
    const values = [
      student.username,
      student.displayName ?? "",
      derived.status,
      derived.needsAttention ? "Yes" : "No",
      formatTeacherProgressPercentage(student.progressPercentage),
      Number.isFinite(student.completedPhases)
        ? String(student.completedPhases)
        : "0",
      Number.isFinite(student.totalPhases) ? String(student.totalPhases) : "",
      formatTeacherLastActiveDate(student.lastActive),
    ];

    rows.push(values.map((value) => escapeCsvValue(value ?? "")).join(","));
  });

  return rows.join("\n");
}

export function buildCsvFilename(referenceDate = new Date()) {
  const pad = (value: number) => value.toString().padStart(2, "0");

  const year = referenceDate.getUTCFullYear();
  const month = pad(referenceDate.getUTCMonth() + 1);
  const day = pad(referenceDate.getUTCDate());
  const hours = pad(referenceDate.getUTCHours());
  const minutes = pad(referenceDate.getUTCMinutes());

  return `bus-math-grades-${year}-${month}-${day}-${hours}${minutes}.csv`;
}

export const __private__ = {
  clampPercentage: clampTeacherProgressPercentage,
  escapeCsvValue,
  formatLastActiveDate: formatTeacherLastActiveDate,
};
