/**
 * Canonical misconception tag taxonomy for practice.v1 envelopes.
 *
 * Every tag emitted in PracticeSubmissionPart.misconceptionTags should
 * reference a canonical entry here so the teacher error-analysis layer
 * can aggregate across families without string guessing.
 */

export interface MisconceptionTagDefinition {
  /** Canonical slug used in misconceptionTags arrays */
  slug: string;
  /** Human-readable label for teacher dashboards */
  label: string;
  /** Short description of the error pattern */
  description: string;
  /** Semantic category for grouping in UI */
  category: 'mechanics' | 'classification' | 'computation' | 'completeness';
}

export const MISCONCEPTION_TAGS = {
  'debit-credit-reversal': {
    slug: 'debit-credit-reversal',
    label: 'Debit/Credit Reversal',
    description: 'Student debited an account that should have been credited, or vice versa.',
    category: 'mechanics',
  },
  'omitted-entry': {
    slug: 'omitted-entry',
    label: 'Omitted Entry',
    description: 'Student left out a required journal line, table row, or response part.',
    category: 'completeness',
  },
  'wrong-normal-balance': {
    slug: 'wrong-normal-balance',
    label: 'Wrong Normal Balance',
    description: 'Student selected the wrong normal balance side (debit vs credit) for an account.',
    category: 'mechanics',
  },
  'sign-error': {
    slug: 'sign-error',
    label: 'Sign Error',
    description: 'Student used the wrong sign or direction for an amount (e.g., negative where positive expected).',
    category: 'computation',
  },
  'classification-error': {
    slug: 'classification-error',
    label: 'Classification Error',
    description: 'Student placed an account in the wrong category (account type, statement placement, or permanent/temporary).',
    category: 'classification',
  },
  'wrong-account-type': {
    slug: 'wrong-account-type',
    label: 'Wrong Account Type',
    description: 'Student confused the account type (e.g., treated a liability as equity, or an expense as an asset).',
    category: 'classification',
  },
  'computation-error': {
    slug: 'computation-error',
    label: 'Computation Error',
    description: 'Student performed an arithmetic or formula error when calculating a subtotal, ratio, or derived value.',
    category: 'computation',
  },
  'incomplete-entry': {
    slug: 'incomplete-entry',
    label: 'Incomplete Entry',
    description: 'Student provided a partial answer that is missing required fields (e.g., journal line without amount, or matrix cell left blank).',
    category: 'completeness',
  },
} as const satisfies Record<string, MisconceptionTagDefinition>;

export type MisconceptionTagSlug = keyof typeof MISCONCEPTION_TAGS;

/**
 * Returns the definition for a canonical tag, or undefined if the slug
 * is not in the taxonomy. Useful for validation in tests.
 */
export function getMisconceptionTag(slug: string): MisconceptionTagDefinition | undefined {
  return MISCONCEPTION_TAGS[slug as MisconceptionTagSlug];
}

/**
 * Type guard: returns true when the slug is a canonical misconception tag.
 */
export function isCanonicalMisconceptionTag(slug: string): slug is MisconceptionTagSlug {
  return slug in MISCONCEPTION_TAGS;
}

/**
 * Returns all canonical tag slugs. Useful for validation and test assertions.
 */
export function allMisconceptionTagSlugs(): readonly MisconceptionTagSlug[] {
  return Object.keys(MISCONCEPTION_TAGS) as MisconceptionTagSlug[];
}

/**
 * Helper: build a misconception tag list that combines canonical tags
 * with family-specific context tags. Canonical tags go first for
 * reliable aggregation in error-analysis pipelines.
 *
 * @param canonical  One or more canonical tag slugs
 * @param context    Family-specific context tags (e.g. 'journal-entry:service-revenue:line-1')
 */
export function misconceptionTags(
  canonical: MisconceptionTagSlug | MisconceptionTagSlug[],
  ...context: string[]
): string[] {
  const slugs = Array.isArray(canonical) ? canonical : [canonical];
  return [...slugs, ...context];
}
