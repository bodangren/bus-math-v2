import type { StudentDashboardRow } from "./TeacherDashboardContent";

const HEADERS = [
  "Username",
  "Progress %",
  "Completed Phases",
  "Total Phases",
  "Last Active",
] as const;

const percentageFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

function clampPercentage(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

function escapeCsvValue(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function formatPercentage(value: number) {
  return `${percentageFormatter.format(clampPercentage(value))}%`;
}

function formatLastActiveDate(value: string | null) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().split("T")[0];
}

export function studentRowsToCsv(students: StudentDashboardRow[]) {
  const rows = [HEADERS.join(",")];

  students.forEach((student) => {
    const values = [
      student.username,
      formatPercentage(student.progressPercentage),
      Number.isFinite(student.completedPhases)
        ? String(student.completedPhases)
        : "0",
      Number.isFinite(student.totalPhases) ? String(student.totalPhases) : "",
      formatLastActiveDate(student.lastActive),
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
  clampPercentage,
  escapeCsvValue,
  formatLastActiveDate,
};
