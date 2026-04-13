import componentVersions from '@/lib/component-versions.json';

function getActivityHashFromManifest(componentId: string): string {
  const hash = (componentVersions.activities as Record<string, string>)[componentId];
  if (!hash) {
    throw new Error(`Activity component not found in manifest: ${componentId}`);
  }
  return hash;
}

function getPracticeHashFromManifest(componentId: string): string {
  const hash = (componentVersions.practices as Record<string, string>)[componentId];
  if (!hash) {
    throw new Error(`Practice family not found in manifest: ${componentId}`);
  }
  return hash;
}

export interface ComponentPlacement {
  unitNumber?: number;
  lessonId?: string;
  phaseId?: string;
}

export interface ComponentInfo {
  componentType: 'example' | 'activity' | 'practice';
  componentId: string;
  placement?: ComponentPlacement;
  currentVersionHash: string;
}

export function computeActivityVersionHash(componentId: string): string {
  return getActivityHashFromManifest(componentId);
}

export function computePracticeVersionHash(componentId: string): string {
  return getPracticeHashFromManifest(componentId);
}

export function computeExampleVersionHash(componentId: string): string {
  throw new Error(
    `Example version hashing is not supported for component "${componentId}". ` +
    `Examples are embedded lesson content, not standalone React components. ` +
    `The component approval system's file-hashing approach requires discrete source files, which examples do not have. ` +
    `Example content (callout sections with variant: 'example') is stored as markdown within lesson seed files and does not have independent source files to hash.`
  );
}

export function computeComponentVersionHash(
  componentType: 'example' | 'activity' | 'practice',
  componentId: string
): string {
  switch (componentType) {
    case 'example':
      return computeExampleVersionHash(componentId);
    case 'activity':
      return computeActivityVersionHash(componentId);
    case 'practice':
      return computePracticeVersionHash(componentId);
    default:
      throw new Error(`Unknown component type: ${componentType}`);
  }
}

export function getAllActivityComponents(): ComponentInfo[] {
  const activities = componentVersions.activities as Record<string, string>;
  return Object.keys(activities).map((componentId) => ({
    componentType: 'activity' as const,
    componentId,
    currentVersionHash: activities[componentId],
  }));
}

export function getAllPracticeComponents(): ComponentInfo[] {
  const practices = componentVersions.practices as Record<string, string>;
  return Object.keys(practices).map((componentId) => ({
    componentType: 'practice' as const,
    componentId,
    currentVersionHash: practices[componentId],
  }));
}

export function getAllExampleComponents(): ComponentInfo[] {
  return [];
}

export function getAllReviewableComponents(): ComponentInfo[] {
  return [
    ...getAllExampleComponents(),
    ...getAllActivityComponents(),
    ...getAllPracticeComponents(),
  ];
}