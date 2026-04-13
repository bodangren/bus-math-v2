import { activityRegistry } from '@/lib/activities/registry';
import { practiceFamilyRegistry } from '@/lib/practice/engine/family-registry';

export interface ComponentId {
  componentType: 'example' | 'activity' | 'practice';
  componentId: string;
}

export function getAllActivityComponentIds(): ComponentId[] {
  return Object.keys(activityRegistry).map((componentId) => ({
    componentType: 'activity' as const,
    componentId,
  }));
}

export function getAllPracticeComponentIds(): ComponentId[] {
  return Object.keys(practiceFamilyRegistry).map((componentId) => ({
    componentType: 'practice' as const,
    componentId,
  }));
}

export function getAllExampleComponentIds(): ComponentId[] {
  return [];
}

export function getAllReviewableComponentIds(): ComponentId[] {
  return [
    ...getAllExampleComponentIds(),
    ...getAllActivityComponentIds(),
    ...getAllPracticeComponentIds(),
  ];
}
