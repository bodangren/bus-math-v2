import crypto from 'crypto';
import { activityRegistry } from '@/lib/activities/registry';
import { practiceFamilyRegistry } from '@/lib/practice/engine/family-registry';

function hashString(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
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

function stringifyFunction(fn: unknown): string {
  if (typeof fn === 'function') {
    return fn.toString();
  }
  return String(fn);
}

export function computeActivityVersionHash(componentId: string): string {
  const component = activityRegistry[componentId as keyof typeof activityRegistry];
  if (!component) {
    throw new Error(`Activity component not found: ${componentId}`);
  }
  const input = stringifyFunction(component);
  return hashString(`activity:${componentId}:${input}`);
}

export function computePracticeVersionHash(componentId: string): string {
  const family = practiceFamilyRegistry[componentId as keyof typeof practiceFamilyRegistry];
  if (!family) {
    throw new Error(`Practice family not found: ${componentId}`);
  }
  const input = [
    stringifyFunction(family.generate),
    stringifyFunction(family.solve),
    stringifyFunction(family.grade),
    stringifyFunction(family.toEnvelope),
  ].join('|');
  return hashString(`practice:${componentId}:${input}`);
}

export function computeExampleVersionHash(componentId: string): string {
  return hashString(`example:${componentId}:placeholder`);
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
  return Object.keys(activityRegistry).map((componentId) => ({
    componentType: 'activity' as const,
    componentId,
    currentVersionHash: computeActivityVersionHash(componentId),
  }));
}

export function getAllPracticeComponents(): ComponentInfo[] {
  return Object.keys(practiceFamilyRegistry).map((componentId) => ({
    componentType: 'practice' as const,
    componentId,
    currentVersionHash: computePracticeVersionHash(componentId),
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
