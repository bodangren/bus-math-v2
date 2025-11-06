import { ZodIssue } from 'zod';

import { activityPropsSchemas, ActivityComponentKey } from './schema/activities';
import { contentBlockSchema } from './schema/phases';

export type ValidationError = {
  path: string;
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

const formatZodIssues = (issues: ZodIssue[]): ValidationError[] =>
  issues.map((issue) => ({
    path: issue.path.join('.') || '(root)',
    message: issue.message,
  }));

export function validateContentBlocks(blocks: unknown[]): ValidationResult {
  const errors: ValidationError[] = [];

  blocks.forEach((block, index) => {
    const result = contentBlockSchema.safeParse(block);
    if (!result.success) {
      const formatted = formatZodIssues(result.error.issues);
      formatted.forEach((issue) => {
        errors.push({
          path: `contentBlocks[${index}]${issue.path === '(root)' ? '' : `.${issue.path}`}`,
          message: issue.message,
        });
      });
    }
  });

  return { valid: errors.length === 0, errors };
}

export function validateActivityProps(componentKey: string, props: unknown): ValidationResult {
  const schema = activityPropsSchemas[componentKey as ActivityComponentKey];

  if (!schema) {
    return {
      valid: false,
      errors: [
        {
          path: 'componentKey',
          message: `Unknown activity component: ${componentKey}`,
        },
      ],
    };
  }

  const result = schema.safeParse(props);
  if (!result.success) {
    return {
      valid: false,
      errors: formatZodIssues(result.error.issues),
    };
  }

  return { valid: true, errors: [] };
}

