import { render, screen, within } from '@testing-library/react';

import { type Lesson, type Phase } from '@/lib/db/schema/validators';
import Lesson01Phase1 from './Lesson01Phase1';
import { createLesson, createPhase } from '@/test/utils/lessonBuilders';
import type { ContentBlock } from '@/lib/db/schema/phases';

const buildContentBlocks = (): ContentBlock[] => [
  {
    id: 'markdown-1',
    type: 'markdown',
    content: 'Sarah needs a clean ledger to earn investor trust.'
  },
  {
    id: 'callout-1',
    type: 'callout',
    variant: 'why-this-matters',
    content: 'Every spreadsheet choice becomes part of your narrative.'
  },
  {
    id: 'video-1',
    type: 'video',
    props: {
      videoUrl: 'https://www.youtube.com/embed/demo',
      duration: 240,
      transcript: 'Transcript'
    }
  },
  {
    id: 'image-1',
    type: 'image',
    props: {
      imageUrl: '/resources/ledger.png',
      alt: 'Ledger Screenshot',
      caption: 'Sarah’s annotated ledger'
    }
  },
  {
    id: 'activity-1',
    type: 'activity',
    activityId: '11111111-1111-1111-1111-111111111111',
    required: true
  }
];

describe('Lesson01Phase1', () => {
  const lesson: Lesson = createLesson();
  const phases: Phase[] = [
    createPhase({ phaseNumber: 1, title: 'Hook', id: 'phase-1', contentBlocks: buildContentBlocks() }),
    createPhase({ phaseNumber: 2, title: 'Guided Practice', id: 'phase-2' })
  ];

  it('renders each content block type from the phase payload', () => {
    render(
      <Lesson01Phase1
        lesson={lesson}
        unit={{ title: 'Unit 1 • Balance by Design', summary: 'Restore Sarah’s ledger', sequence: 1 }}
        phase={phases[0]}
        phases={phases}
        contentBlocks={buildContentBlocks()}
      />
    );

    const markdownBlock = screen.getByTestId('content-block-markdown');
    expect(within(markdownBlock).getByText(/Sarah needs a clean ledger/)).toBeInTheDocument();
    expect(screen.getByText(/Every spreadsheet choice/)).toBeInTheDocument();
    expect(screen.getByTitle(/Video block/)).toHaveAttribute('src', expect.stringContaining('youtube'));
    expect(screen.getByAltText(/Ledger Screenshot/)).toBeInTheDocument();
    expect(screen.getByText(/Activity ID:/)).toHaveTextContent('Activity ID: 11111111-1111-1111-1111-111111111111');
  });
});
