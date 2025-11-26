import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PhaseRenderer } from './PhaseRenderer';
import type { ContentBlock } from '@/lib/db/schema/phases';

// Mock the child components
vi.mock('./VideoPlayer', () => ({
  VideoPlayer: ({ videoUrl, duration }: { videoUrl: string; duration: number }) => (
    <div data-testid="video-player">Video: {videoUrl} ({duration}min)</div>
  ),
}));

vi.mock('./Callout', () => ({
  Callout: ({ variant, content }: { variant: string; content: string }) => (
    <div data-testid="callout" data-variant={variant}>{content}</div>
  ),
}));

vi.mock('./MarkdownRenderer', () => ({
  MarkdownRenderer: ({ content }: { content: string }) => (
    <div data-testid="markdown">{content}</div>
  ),
}));

vi.mock('./ActivityRenderer', () => ({
  ActivityRenderer: ({
    activityId,
    lessonId,
    phaseNumber,
    required
  }: {
    activityId: string;
    lessonId: string;
    phaseNumber: number;
    required: boolean;
  }) => (
    <div data-testid="activity-renderer" data-required={required} data-lesson={lessonId} data-phase={phaseNumber}>
      Activity: {activityId}
    </div>
  ),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-testid="next-image" />
  ),
}));

describe('PhaseRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Markdown blocks', () => {
    it('should render markdown content', () => {
      const contentBlocks: ContentBlock[] = [
        {
          id: 'block-1',
          type: 'markdown',
          content: '# Hello World',
        },
      ];

      render(<PhaseRenderer contentBlocks={contentBlocks} lessonId="test-lesson-id" phaseNumber={1} />);
      expect(screen.getByTestId('markdown')).toHaveTextContent('# Hello World');
    });
  });

  describe('Video blocks', () => {
    it('should render video player with correct props', () => {
      const contentBlocks: ContentBlock[] = [
        {
          id: 'block-2',
          type: 'video',
          props: {
            videoUrl: 'https://youtube.com/watch?v=test123',
            duration: 5,
            transcript: 'Video transcript...',
          },
        },
      ];

      render(<PhaseRenderer contentBlocks={contentBlocks} lessonId="test-lesson-id" phaseNumber={1} />);
      const videoPlayer = screen.getByTestId('video-player');
      expect(videoPlayer).toBeInTheDocument();
      expect(videoPlayer).toHaveTextContent('https://youtube.com/watch?v=test123');
      expect(videoPlayer).toHaveTextContent('5min');
    });

    it('should render video without optional props', () => {
      const contentBlocks: ContentBlock[] = [
        {
          id: 'block-3',
          type: 'video',
          props: {
            videoUrl: 'https://youtube.com/watch?v=test456',
            duration: 10,
          },
        },
      ];

      render(<PhaseRenderer contentBlocks={contentBlocks} lessonId="test-lesson-id" phaseNumber={1} />);
      expect(screen.getByTestId('video-player')).toBeInTheDocument();
    });
  });

  describe('Image blocks', () => {
    it('should render image with caption', () => {
      const contentBlocks: ContentBlock[] = [
        {
          id: 'block-4',
          type: 'image',
          props: {
            imageUrl: 'https://example.com/image.jpg',
            alt: 'Test image',
            caption: 'This is a caption',
          },
        },
      ];

      render(<PhaseRenderer contentBlocks={contentBlocks} lessonId="test-lesson-id" phaseNumber={1} />);
      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
      expect(image).toHaveAttribute('alt', 'Test image');
      expect(screen.getByText('This is a caption')).toBeInTheDocument();
    });

    it('should render image without caption', () => {
      const contentBlocks: ContentBlock[] = [
        {
          id: 'block-5',
          type: 'image',
          props: {
            imageUrl: 'https://example.com/image2.jpg',
            alt: 'Another image',
          },
        },
      ];

      render(<PhaseRenderer contentBlocks={contentBlocks} lessonId="test-lesson-id" phaseNumber={1} />);
      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('src', 'https://example.com/image2.jpg');
    });
  });

  describe('Callout blocks', () => {
    it('should render why-this-matters callout', () => {
      const contentBlocks: ContentBlock[] = [
        {
          id: 'block-6',
          type: 'callout',
          variant: 'why-this-matters',
          content: 'This is important because...',
        },
      ];

      render(<PhaseRenderer contentBlocks={contentBlocks} lessonId="test-lesson-id" phaseNumber={1} />);
      const callout = screen.getByTestId('callout');
      expect(callout).toHaveAttribute('data-variant', 'why-this-matters');
      expect(callout).toHaveTextContent('This is important because...');
    });

    it('should render tip callout', () => {
      const contentBlocks: ContentBlock[] = [
        {
          id: 'block-7',
          type: 'callout',
          variant: 'tip',
          content: 'Pro tip: Always...',
        },
      ];

      render(<PhaseRenderer contentBlocks={contentBlocks} lessonId="test-lesson-id" phaseNumber={1} />);
      const callout = screen.getByTestId('callout');
      expect(callout).toHaveAttribute('data-variant', 'tip');
    });

    it('should render warning callout', () => {
      const contentBlocks: ContentBlock[] = [
        {
          id: 'block-8',
          type: 'callout',
          variant: 'warning',
          content: 'Be careful with...',
        },
      ];

      render(<PhaseRenderer contentBlocks={contentBlocks} lessonId="test-lesson-id" phaseNumber={1} />);
      const callout = screen.getByTestId('callout');
      expect(callout).toHaveAttribute('data-variant', 'warning');
    });

    it('should render example callout', () => {
      const contentBlocks: ContentBlock[] = [
        {
          id: 'block-9',
          type: 'callout',
          variant: 'example',
          content: 'For example...',
        },
      ];

      render(<PhaseRenderer contentBlocks={contentBlocks} lessonId="test-lesson-id" phaseNumber={1} />);
      const callout = screen.getByTestId('callout');
      expect(callout).toHaveAttribute('data-variant', 'example');
    });
  });

  describe('Activity blocks', () => {
    it('should render required activity', () => {
      const activityId = '550e8400-e29b-41d4-a716-446655440000';
      const contentBlocks: ContentBlock[] = [
        {
          id: 'block-10',
          type: 'activity',
          activityId,
          required: true,
        },
      ];

      render(<PhaseRenderer contentBlocks={contentBlocks} lessonId="test-lesson-id" phaseNumber={1} />);
      const activity = screen.getByTestId('activity-renderer');
      expect(activity).toHaveTextContent(activityId);
      expect(activity).toHaveAttribute('data-required', 'true');
    });

    it('should render optional activity', () => {
      const activityId = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
      const contentBlocks: ContentBlock[] = [
        {
          id: 'block-11',
          type: 'activity',
          activityId,
          required: false,
        },
      ];

      render(<PhaseRenderer contentBlocks={contentBlocks} lessonId="test-lesson-id" phaseNumber={1} />);
      const activity = screen.getByTestId('activity-renderer');
      expect(activity).toHaveAttribute('data-required', 'false');
    });
  });

  describe('Multiple blocks', () => {
    it('should render multiple blocks in order', () => {
      const contentBlocks: ContentBlock[] = [
        {
          id: 'block-12',
          type: 'markdown',
          content: 'Introduction',
        },
        {
          id: 'block-13',
          type: 'video',
          props: {
            videoUrl: 'https://youtube.com/watch?v=intro',
            duration: 3,
          },
        },
        {
          id: 'block-14',
          type: 'callout',
          variant: 'tip',
          content: 'Remember this',
        },
      ];

      render(<PhaseRenderer contentBlocks={contentBlocks} lessonId="test-lesson-id" phaseNumber={1} />);
      expect(screen.getByTestId('markdown')).toBeInTheDocument();
      expect(screen.getByTestId('video-player')).toBeInTheDocument();
      expect(screen.getByTestId('callout')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should show empty state when no content blocks', () => {
      render(<PhaseRenderer contentBlocks={[]} />);
      expect(screen.getByText('No content available for this phase.')).toBeInTheDocument();
    });

    it('should handle invalid blocks gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const contentBlocks: ContentBlock[] = [
        {
          id: 'valid-block',
          type: 'markdown',
          content: 'Valid content',
        },
        // Invalid block will be filtered out by validation
        { id: 'invalid-block' } as unknown as ContentBlock,
      ];

      render(<PhaseRenderer contentBlocks={contentBlocks} lessonId="test-lesson-id" phaseNumber={1} />);

      // Should render the valid block
      expect(screen.getByTestId('markdown')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Type narrowing', () => {
    it('should correctly narrow types in switch statement', () => {
      const contentBlocks: ContentBlock[] = [
        {
          id: 'markdown-block',
          type: 'markdown',
          content: 'Markdown content',
        },
        {
          id: 'video-block',
          type: 'video',
          props: {
            videoUrl: 'https://youtube.com/watch?v=test',
            duration: 5,
          },
        },
      ];

      render(<PhaseRenderer contentBlocks={contentBlocks} lessonId="test-lesson-id" phaseNumber={1} />);

      // Both blocks should render without type errors
      expect(screen.getByTestId('markdown')).toBeInTheDocument();
      expect(screen.getByTestId('video-player')).toBeInTheDocument();
    });
  });
});
