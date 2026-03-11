export interface LessonVersionLike {
  _id: string;
  lessonId: string;
  version: number;
  status: string;
}

export interface PhaseVersionLike {
  _id: string;
  lessonVersionId: string;
}

export interface ProgressRowLike {
  phaseId: string;
  status: "not_started" | "in_progress" | "completed";
  updatedAt?: number | null;
}

export interface ProgressSnapshot {
  completedPhases: number;
  totalPhases: number;
  progressPercentage: number;
  lastActive: string | null;
}

export interface LessonLike {
  _id: string;
  unitNumber: number;
  orderIndex: number;
  title: string;
  slug: string;
  description?: string | null;
  metadata?: {
    unitContent?: {
      introduction?: {
        unitTitle?: string | null;
      } | null;
    } | null;
  } | null;
}

export interface UnitLessonProgressRow {
  id: string;
  unitNumber: number;
  title: string;
  slug: string;
  description: string | null;
  totalPhases: number;
  completedPhases: number;
  progressPercentage: number;
}

export interface UnitProgressRow {
  unitNumber: number;
  unitTitle: string;
  lessons: UnitLessonProgressRow[];
}

export interface LessonPhaseLike {
  _id: string;
  phaseNumber: number;
}

export interface LessonPhaseProgressRow extends ProgressRowLike {
  startedAt?: number | null;
  completedAt?: number | null;
  timeSpentSeconds?: number | null;
}

export interface LessonPhaseProgressStatusRow {
  phaseNumber: number;
  phaseId: string;
  status: "completed" | "current" | "available" | "locked";
  startedAt: string | null;
  completedAt: string | null;
  timeSpentSeconds: number | null;
}

export function resolveLatestPublishedLessonVersion<T extends LessonVersionLike>(
  lessonVersions: readonly T[],
): T | null {
  let latestPublished: T | null = null;

  for (const version of lessonVersions) {
    if (version.status !== "published") {
      continue;
    }

    if (!latestPublished || version.version > latestPublished.version) {
      latestPublished = version;
    }
  }

  return latestPublished;
}

export function buildLatestPublishedLessonVersionMap<T extends LessonVersionLike>(
  lessonVersions: readonly T[],
  lessonIds?: readonly string[],
): Map<string, T> {
  const allowedLessonIds = lessonIds ? new Set(lessonIds) : null;
  const versionsByLessonId = new Map<string, T>();

  for (const version of lessonVersions) {
    if (allowedLessonIds && !allowedLessonIds.has(version.lessonId)) {
      continue;
    }

    if (version.status !== "published") {
      continue;
    }

    const current = versionsByLessonId.get(version.lessonId);
    if (!current || version.version > current.version) {
      versionsByLessonId.set(version.lessonId, version);
    }
  }

  return versionsByLessonId;
}

export function buildPublishedLessonPhaseIdsByLessonId<
  TLessonVersion extends LessonVersionLike,
  TPhaseVersion extends PhaseVersionLike,
>({
  lessonIds,
  lessonVersions,
  phaseVersions,
}: {
  lessonIds: readonly string[];
  lessonVersions: readonly TLessonVersion[];
  phaseVersions: readonly TPhaseVersion[];
}): Map<string, string[]> {
  const latestPublishedByLessonId = buildLatestPublishedLessonVersionMap(
    lessonVersions,
    lessonIds,
  );
  const lessonIdByVersionId = new Map<string, string>();

  for (const [lessonId, version] of latestPublishedByLessonId.entries()) {
    lessonIdByVersionId.set(version._id, lessonId);
  }

  const phaseIdsByLessonId = new Map<string, string[]>();
  for (const lessonId of lessonIds) {
    phaseIdsByLessonId.set(lessonId, []);
  }

  for (const phase of phaseVersions) {
    const lessonId = lessonIdByVersionId.get(phase.lessonVersionId);
    if (!lessonId) {
      continue;
    }

    phaseIdsByLessonId.get(lessonId)?.push(phase._id);
  }

  return phaseIdsByLessonId;
}

export function buildPublishedPhaseIdSet<
  TLessonVersion extends LessonVersionLike,
  TPhaseVersion extends PhaseVersionLike,
>({
  lessonIds,
  lessonVersions,
  phaseVersions,
}: {
  lessonIds: readonly string[];
  lessonVersions: readonly TLessonVersion[];
  phaseVersions: readonly TPhaseVersion[];
}): Set<string> {
  const phaseIdsByLessonId = buildPublishedLessonPhaseIdsByLessonId({
    lessonIds,
    lessonVersions,
    phaseVersions,
  });

  return new Set(
    [...phaseIdsByLessonId.values()].flat(),
  );
}

export function buildPublishedProgressSnapshot({
  activePhaseIds,
  progressRows,
}: {
  activePhaseIds: ReadonlySet<string>;
  progressRows: readonly ProgressRowLike[];
}): ProgressSnapshot {
  let completedPhases = 0;
  let latestActiveTimestamp: number | null = null;

  for (const row of progressRows) {
    if (!activePhaseIds.has(row.phaseId)) {
      continue;
    }

    if (row.status === "completed") {
      completedPhases += 1;
    }

    const updatedAt = row.updatedAt ?? null;
    if (typeof updatedAt === "number" && (latestActiveTimestamp === null || updatedAt > latestActiveTimestamp)) {
      latestActiveTimestamp = updatedAt;
    }
  }

  const totalPhases = activePhaseIds.size;

  return {
    completedPhases,
    totalPhases,
    progressPercentage:
      totalPhases > 0
        ? Number(((completedPhases / totalPhases) * 100).toFixed(1))
        : 0,
    lastActive:
      latestActiveTimestamp === null
        ? null
        : new Date(latestActiveTimestamp).toISOString(),
  };
}

function toIsoString(timestamp?: number | null): string | null {
  return typeof timestamp === "number" ? new Date(timestamp).toISOString() : null;
}

export function buildPublishedUnitProgressRows<
  TLesson extends LessonLike,
  TLessonVersion extends LessonVersionLike & {
    title?: string | null;
    description?: string | null;
  },
  TPhaseVersion extends PhaseVersionLike,
  TProgressRow extends ProgressRowLike,
>({
  lessons,
  lessonVersions,
  phaseVersions,
  progressRows,
}: {
  lessons: readonly TLesson[];
  lessonVersions: readonly TLessonVersion[];
  phaseVersions: readonly TPhaseVersion[];
  progressRows: readonly TProgressRow[];
}): UnitProgressRow[] {
  const sortedLessons = [...lessons].sort(
    (a, b) => a.unitNumber - b.unitNumber || a.orderIndex - b.orderIndex,
  );

  if (sortedLessons.length === 0) {
    return [];
  }

  const lessonIds = sortedLessons.map((lesson) => lesson._id);
  const latestVersionByLessonId = buildLatestPublishedLessonVersionMap(
    lessonVersions,
    lessonIds,
  );
  const phaseIdsByLessonId = buildPublishedLessonPhaseIdsByLessonId({
    lessonIds,
    lessonVersions,
    phaseVersions,
  });
  const completedPhaseIds = new Set(
    progressRows
      .filter((row) => row.status === "completed")
      .map((row) => row.phaseId),
  );

  const units = new Map<number, UnitProgressRow>();
  for (const lesson of sortedLessons) {
    const versionedLesson = latestVersionByLessonId.get(lesson._id);
    const phaseIds = phaseIdsByLessonId.get(lesson._id) ?? [];
    const totalPhases = phaseIds.length;
    const completedPhases = phaseIds.filter((phaseId) => completedPhaseIds.has(phaseId)).length;
    const progressPercentage =
      totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;
    const unit = units.get(lesson.unitNumber) ?? {
      unitNumber: lesson.unitNumber,
      unitTitle:
        lesson.metadata?.unitContent?.introduction?.unitTitle ??
        `Unit ${lesson.unitNumber}`,
      lessons: [],
    };

    unit.lessons.push({
      id: lesson._id,
      unitNumber: lesson.unitNumber,
      title: versionedLesson?.title ?? lesson.title,
      slug: lesson.slug,
      description:
        typeof versionedLesson?.description === "string"
          ? versionedLesson.description
          : typeof lesson.description === "string"
            ? lesson.description
            : null,
      totalPhases,
      completedPhases,
      progressPercentage,
    });

    units.set(lesson.unitNumber, unit);
  }

  return [...units.values()].sort((a, b) => a.unitNumber - b.unitNumber);
}

export function buildLessonPhaseProgress<
  TPhase extends LessonPhaseLike,
  TProgressRow extends LessonPhaseProgressRow,
>({
  phases,
  progressRows,
}: {
  phases: readonly TPhase[];
  progressRows: readonly TProgressRow[];
}): LessonPhaseProgressStatusRow[] {
  const sortedPhases = [...phases].sort((a, b) => a.phaseNumber - b.phaseNumber);
  const progressByPhaseId = new Map(progressRows.map((row) => [row.phaseId, row]));

  return sortedPhases.map((phase, index) => {
    const progress = progressByPhaseId.get(phase._id);
    let status: LessonPhaseProgressStatusRow["status"] = "locked";

    if (progress?.status === "completed") {
      status = "completed";
    } else if (progress?.status === "in_progress") {
      status = "current";
    } else if (index === 0) {
      status = "available";
    } else {
      const previousPhase = sortedPhases[index - 1];
      const previousProgress = progressByPhaseId.get(previousPhase._id);
      if (previousProgress?.status === "completed") {
        status = "available";
      }
    }

    return {
      phaseNumber: phase.phaseNumber,
      phaseId: phase._id,
      status,
      startedAt: toIsoString(progress?.startedAt ?? null),
      completedAt: toIsoString(progress?.completedAt ?? null),
      timeSpentSeconds:
        typeof progress?.timeSpentSeconds === "number" ? progress.timeSpentSeconds : null,
    };
  });
}
