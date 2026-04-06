import { describe, expect, it } from 'vitest';

import { activities, gradingConfigSchema } from '@/lib/db/schema/activities-core';
import { categorizationActivityPropsSchemas } from '@/lib/db/schema/activities-categorization';
import {
  activities as barrelActivities,
  activityPropsSchemas,
  gradingConfigSchema as barrelGradingConfigSchema,
} from '@/lib/db/schema/activities';
import { quizActivityPropsSchemas } from '@/lib/db/schema/activities-quiz';
import { simulationActivityPropsSchemas } from '@/lib/db/schema/activities-simulation';
import { spreadsheetActivityPropsSchemas } from '@/lib/db/schema/activities-spreadsheet';

describe('activities schema decomposition', () => {
  it('exports core table and grading schema from activities-core', () => {
    expect(activities).toBeDefined();
    expect(activities.id).toBeDefined();
    expect(activities.componentKey).toBeDefined();

    const parsed = gradingConfigSchema.safeParse({ autoGrade: true, partialCredit: false });
    expect(parsed.success).toBe(true);
  });

  it('exports spreadsheet domain schemas', () => {
    expect(spreadsheetActivityPropsSchemas.spreadsheet).toBeDefined();
    expect(spreadsheetActivityPropsSchemas['spreadsheet-evaluator']).toBeDefined();

    const parsed = spreadsheetActivityPropsSchemas.spreadsheet.safeParse({
      template: 'trial-balance',
    });
    expect(parsed.success).toBe(true);
  });

  it('exports quiz/comprehension schemas', () => {
    expect(quizActivityPropsSchemas['comprehension-quiz']).toBeDefined();
    expect(quizActivityPropsSchemas['fill-in-the-blank']).toBeDefined();
  });

  it('exports categorization schemas', () => {
    expect(categorizationActivityPropsSchemas['percentage-calculation-sorting']).toBeDefined();
    expect(categorizationActivityPropsSchemas['inventory-flow-diagram']).toBeDefined();
    expect(categorizationActivityPropsSchemas['cash-flow-timeline']).toBeDefined();
    expect(categorizationActivityPropsSchemas['classification']).toBeDefined();
  });

  it('exports simulation schemas', () => {
    expect(simulationActivityPropsSchemas['lemonade-stand']).toBeDefined();
    expect(simulationActivityPropsSchemas['startup-journey']).toBeDefined();
  });

  it('aggregates all domains through activities barrel', () => {
    expect(activityPropsSchemas['comprehension-quiz']).toBeDefined();
    expect(activityPropsSchemas['spreadsheet']).toBeDefined();
    expect(activityPropsSchemas['percentage-calculation-sorting']).toBeDefined();
    expect(activityPropsSchemas['lemonade-stand']).toBeDefined();
    expect(activityPropsSchemas['classification']).toBeDefined();

    expect(barrelActivities).toBe(activities);
    expect(barrelGradingConfigSchema).toBe(gradingConfigSchema);
  });
});
