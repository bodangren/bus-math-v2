import type { ActivityComponentKey } from '../db/schema/activities-core';

export function resolveActivityComponentKey(componentKey: string): ActivityComponentKey | null {
  return componentKey as ActivityComponentKey;
}
