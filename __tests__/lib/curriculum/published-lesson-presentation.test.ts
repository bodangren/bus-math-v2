import { describe, expect, it } from 'vitest';

import {
  fallbackPublishedPhaseTitle,
  toPublishedContentBlock,
} from '@/lib/curriculum/published-lesson-presentation';

describe('published lesson presentation helpers', () => {
  it('maps supported published section types into runtime content blocks', () => {
    expect(
      toPublishedContentBlock(
        {
          id: 'section-1',
          sectionType: 'callout',
          content: {
            variant: 'why-this-matters',
            content: 'Keep the business in balance.',
          },
        },
        1,
      ),
    ).toEqual({
      id: 'section-1',
      type: 'callout',
      variant: 'why-this-matters',
      content: 'Keep the business in balance.',
    });

    expect(
      toPublishedContentBlock(
        {
          id: 'section-2',
          sectionType: 'activity',
          content: {
            activityId: 'activity-2',
            required: true,
            linkedStandardId: 'ACC-1.1',
          },
        },
        2,
      ),
    ).toEqual({
      id: 'section-2',
      type: 'activity',
      activityId: 'activity-2',
      required: true,
      linkedStandardId: 'ACC-1.1',
    });
  });

  it('falls back to markdown blocks when a section cannot be mapped more specifically', () => {
    expect(
      toPublishedContentBlock(
        {
          id: 'section-3',
          sectionType: 'text',
          content: {
            markdown: '## Build the snapshot',
          },
        },
        3,
      ),
    ).toEqual({
      id: 'section-3',
      type: 'markdown',
      content: '## Build the snapshot',
    });
  });

  it('uses consistent fallback phase titles for student and teacher views', () => {
    expect(fallbackPublishedPhaseTitle(1)).toBe('Hook');
    expect(fallbackPublishedPhaseTitle(4)).toBe('Independent Practice');
    expect(fallbackPublishedPhaseTitle(6)).toBe('Closing');
  });
});
