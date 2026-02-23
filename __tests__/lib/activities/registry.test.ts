import { describe, expect, it } from 'vitest';

import { TieredAssessment } from '@/components/activities/quiz/TieredAssessment';
import { ComprehensionCheck } from '@/components/activities/quiz/ComprehensionCheck';
import { getActivityComponent } from '@/lib/activities/registry';

describe('activityRegistry', () => {
  it('maps comprehension-quiz to ComprehensionCheck', () => {
    expect(getActivityComponent('comprehension-quiz')).toBe(ComprehensionCheck);
  });

  it('maps tiered-assessment to TieredAssessment', () => {
    expect(getActivityComponent('tiered-assessment')).toBe(TieredAssessment);
  });
});
