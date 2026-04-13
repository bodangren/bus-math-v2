import crypto from 'crypto';
import componentVersions from '@/lib/component-versions.json';

function hashString(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

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

export function computeExampleVersionHash(_componentId: string): string {
  return hashString(`example:${_componentId}:placeholder`);
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