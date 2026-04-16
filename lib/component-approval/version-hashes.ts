import { computeComponentContentHash } from '@/lib/activities/content-hash';

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

export async function computeActivityVersionHash(
  componentId: string,
  props?: Record<string, unknown>
): Promise<string> {
  return computeComponentContentHash({
    componentKind: 'activity',
    componentKey: componentId,
    props,
  });
}

export async function computePracticeVersionHash(
  componentId: string,
  props?: Record<string, unknown>,
  gradingConfig?: Record<string, unknown>
): Promise<string> {
  return computeComponentContentHash({
    componentKind: 'practice',
    componentKey: componentId,
    props,
    gradingConfig,
  });
}

export async function computeExampleVersionHash(
  componentId: string,
  props?: Record<string, unknown>
): Promise<string> {
  return computeComponentContentHash({
    componentKind: 'example',
    componentKey: componentId,
    props,
  });
}

export async function computeComponentVersionHash(
  componentType: 'example' | 'activity' | 'practice',
  componentId: string,
  props?: Record<string, unknown>,
  gradingConfig?: Record<string, unknown>
): Promise<string> {
  switch (componentType) {
    case 'example':
      return computeExampleVersionHash(componentId, props);
    case 'activity':
      return computeActivityVersionHash(componentId, props);
    case 'practice':
      return computePracticeVersionHash(componentId, props, gradingConfig);
    default:
      throw new Error(`Unknown component type: ${componentType}`);
  }
}

export async function getAllActivityComponents(
  getActivityProps?: (componentId: string) => Promise<Record<string, unknown> | undefined>
): Promise<ComponentInfo[]> {
  const activityIds = [
    'comprehension-quiz', 'tiered-assessment', 'percentage-calculation-sorting',
    'inventory-flow-diagram', 'cash-flow-timeline', 'fill-in-the-blank',
    'journal-entry-building', 'reflection-journal', 'peer-critique-form',
    'lemonade-stand', 'startup-journey', 'budget-balancer', 'cash-flow-challenge',
    'inventory-manager', 'pitch-presentation-builder', 'pitch', 'cafe-supply-chaos',
    'notebook-organizer', 'growth-puzzle', 'asset-time-machine', 'capital-negotiation',
    'business-stress-test', 'pay-structure-lab', 'classification', 'financial-dashboard',
    'chart-builder', 'spreadsheet', 'spreadsheet-evaluator', 'data-cleaning',
    'profit-calculator', 'budget-worksheet', 'straight-line-mastery', 'ddb-comparison-mastery',
    'capitalization-expense-mastery', 'depreciation-method-comparison', 'asset-register-simulator',
    'dynamic-method-selector', 'method-comparison-simulator', 'scenario-switch-showtell',
    'inventory-algorithm-showtell', 'markup-margin-mastery', 'break-even-mastery',
    'income-statement-practice', 'cash-flow-practice', 'balance-sheet-practice',
    'chart-linking-simulator', 'cross-sheet-link-simulator', 'adjustment-practice',
    'closing-entry-practice', 'month-end-close-practice',
    'graphing-explorer',
  ];

  const components: ComponentInfo[] = [];
  for (const componentId of activityIds) {
    let currentVersionHash: string;
    if (getActivityProps) {
      const props = await getActivityProps(componentId);
      currentVersionHash = await computeActivityVersionHash(componentId, props);
    } else {
      currentVersionHash = await computeActivityVersionHash(componentId);
    }
    components.push({
      componentType: 'activity',
      componentId,
      currentVersionHash,
    });
  }
  return components;
}

export async function getAllPracticeComponents(
  getPracticeProps?: (componentId: string) => Promise<{ props?: Record<string, unknown>; gradingConfig?: Record<string, unknown> } | undefined>
): Promise<ComponentInfo[]> {
  const practiceIds = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
  ];

  const components: ComponentInfo[] = [];
  for (const componentId of practiceIds) {
    let currentVersionHash: string;
    if (getPracticeProps) {
      const result = await getPracticeProps(componentId);
      currentVersionHash = await computePracticeVersionHash(
        componentId,
        result?.props,
        result?.gradingConfig
      );
    } else {
      currentVersionHash = await computePracticeVersionHash(componentId);
    }
    components.push({
      componentType: 'practice',
      componentId,
      currentVersionHash,
    });
  }
  return components;
}

export function getAllExampleComponents(): ComponentInfo[] {
  return [];
}

export async function getAllReviewableComponents(): Promise<ComponentInfo[]> {
  return [
    ...getAllExampleComponents(),
    ...(await getAllActivityComponents()),
    ...(await getAllPracticeComponents()),
  ];
}