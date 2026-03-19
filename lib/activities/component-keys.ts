import type { ActivityComponentKey } from '../db/schema/activities-core';

const activityComponentAliases = {
  'general-drag-and-drop': 'drag-and-drop',
  'journal-entry-activity': 'journal-entry-building',
  'spreadsheet-activity': 'spreadsheet',
  'data-cleaning-activity': 'data-cleaning',
} as const satisfies Record<string, ActivityComponentKey>;

export const documentedActivityAliases = activityComponentAliases;

export function resolveActivityComponentKey(componentKey: string): ActivityComponentKey | null {
  if (componentKey in documentedActivityAliases) {
    return documentedActivityAliases[componentKey as keyof typeof documentedActivityAliases];
  }

  return componentKey as ActivityComponentKey;
}
