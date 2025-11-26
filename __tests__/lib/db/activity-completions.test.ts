import { describe, it, expect } from 'vitest';
import { activityCompletions } from '@/lib/db/schema/activity-completions';

describe('activityCompletions schema', () => {
  it('should have correct table name', () => {
    expect(activityCompletions).toBeDefined();
    // @ts-expect-error - accessing internal property for testing
    expect(activityCompletions[Symbol.for('drizzle:Name')]).toBe('activity_completions');
  });

  it('should have all required columns', () => {
    const columns = Object.keys(activityCompletions);

    expect(columns).toContain('id');
    expect(columns).toContain('studentId');
    expect(columns).toContain('activityId');
    expect(columns).toContain('lessonId');
    expect(columns).toContain('phaseNumber');
    expect(columns).toContain('completedAt');
    expect(columns).toContain('idempotencyKey');
    expect(columns).toContain('completionData');
    expect(columns).toContain('createdAt');
    expect(columns).toContain('updatedAt');
  });

  it('should export from schema index', async () => {
    const schemaIndex = await import('@/lib/db/schema/index');
    expect(schemaIndex.activityCompletions).toBeDefined();
  });
});
