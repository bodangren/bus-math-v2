async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export type ComponentKind = "example" | "activity" | "practice";

export interface HashableComponent {
  componentKind: ComponentKind;
  componentKey?: string;
  props?: Record<string, unknown>;
  gradingConfig?: Record<string, unknown>;
}

export async function computeComponentContentHash(
  component: HashableComponent
): Promise<string> {
  const hashable = {
    componentKind: component.componentKind,
    componentKey: component.componentKey,
    props: component.props,
    gradingConfig: component.gradingConfig,
  };

  const sorted = deepSortKeys(hashable);
  const json = JSON.stringify(sorted);
  return sha256(json);
}

function deepSortKeys(obj: unknown): unknown {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(deepSortKeys);
  }
  const sortedKeys = Object.keys(obj).sort();
  const result: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    result[key] = deepSortKeys((obj as Record<string, unknown>)[key]);
  }
  return result;
}

export function resolveComponentKind(phaseType: string): ComponentKind {
  if (phaseType === "worked_example") return "example";
  if (
    phaseType === "guided_practice" ||
    phaseType === "independent_practice" ||
    phaseType === "assessment"
  ) {
    return "practice";
  }
  return "activity";
}