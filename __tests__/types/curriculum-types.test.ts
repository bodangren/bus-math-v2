import { describe, expect, expectTypeOf, it } from 'vitest';
import { CURRICULUM_PHASE_COUNT } from '@/types/curriculum';
import type {
  ContentBlock,
  LessonMetadata,
  LessonRow,
  PhaseMetadata,
  PhaseRow,
  UnitContent,
} from '@/types/curriculum';

describe('types/curriculum exports', () => {
  it('exports centralized lesson, phase, and content-block contracts', () => {
    expect(CURRICULUM_PHASE_COUNT).toBe(6);

    expectTypeOf<LessonRow>().toMatchTypeOf<{
      id: string;
      slug: string;
      title: string;
      unitNumber: number;
      metadata: LessonMetadata | null;
    }>();

    expectTypeOf<PhaseRow>().toMatchTypeOf<{
      id: string;
      lessonId: string;
      phaseNumber: number;
      contentBlocks: ContentBlock[];
      metadata: PhaseMetadata;
    }>();

    expectTypeOf<UnitContent>().toMatchTypeOf<{
      drivingQuestion: { question: string; context: string; scenario?: string };
    }>();

    expectTypeOf<ContentBlock>().toMatchTypeOf<{ id: string; type: string }>();

    expect(true).toBe(true);
  });
});
