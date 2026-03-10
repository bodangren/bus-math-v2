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
