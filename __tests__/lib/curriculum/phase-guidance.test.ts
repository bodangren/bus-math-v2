import { describe, expect, it } from 'vitest';

import {
  getLessonPhaseGuidance,
  getPhaseGuidance,
} from '@/lib/curriculum/phase-guidance';

describe('curriculum/phase-guidance', () => {
  it('returns accounting guidance for the concept-intro phase', () => {
    const guidance = getPhaseGuidance('accounting', 2);

    expect(guidance).toMatchObject({
      lessonType: 'accounting',
      phaseNumber: 2,
      phaseLabel: 'Concept Intro',
    });
    expect(guidance?.goal).toMatch(/explicit A\/L\/E reasoning/i);
    expect(guidance?.successCriteria).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/guided/i),
        expect.stringMatching(/independent/i),
      ]),
    );
  });

  it('returns excel guided-practice guidance with an interactive success criterion', () => {
    const guidance = getPhaseGuidance('excel', 3);

    expect(guidance).toMatchObject({
      lessonType: 'excel',
      phaseNumber: 3,
      phaseLabel: 'Guided Practice',
    });
    expect(guidance?.successCriteria).toEqual(
      expect.arrayContaining([expect.stringMatching(/interactive/i)]),
    );
  });

  it('maps lesson order index ranges to the correct phase guidance', () => {
    expect(getLessonPhaseGuidance(1, 3)?.lessonType).toBe('accounting');
    expect(getLessonPhaseGuidance(5, 3)?.lessonType).toBe('excel');
    expect(getLessonPhaseGuidance(8, 1)?.lessonType).toBe('project');
    expect(getLessonPhaseGuidance(11, 2)?.lessonType).toBe('assessment');
  });

  it('returns null when the phase number is not defined for the lesson type', () => {
    expect(getPhaseGuidance('project', 6)).toBeNull();
  });
});
