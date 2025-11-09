import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReadingLevelAdjuster } from './ReadingLevelAdjuster';

describe('ReadingLevelAdjuster', () => {
  describe('Predefined adaptations', () => {
    it('adapts "Engaging opener to capture student interest" for basic level in English', () => {
      render(
        <ReadingLevelAdjuster
          content="Engaging opener to capture student interest"
          level="basic"
          language="en"
        />
      );

      expect(screen.getByText('Fun start to get students excited about learning')).toBeInTheDocument();
    });

    it('adapts "Engaging opener to capture student interest" for intermediate level in English', () => {
      render(
        <ReadingLevelAdjuster
          content="Engaging opener to capture student interest"
          level="intermediate"
          language="en"
        />
      );

      expect(screen.getByText('Engaging opener to capture student interest')).toBeInTheDocument();
    });

    it('adapts "Engaging opener to capture student interest" for advanced level in English', () => {
      render(
        <ReadingLevelAdjuster
          content="Engaging opener to capture student interest"
          level="advanced"
          language="en"
        />
      );

      expect(screen.getByText(/Strategic pedagogical engagement mechanism/)).toBeInTheDocument();
    });

    it('adapts "Introduce key concepts and vocabulary" for basic level in Chinese', () => {
      render(
        <ReadingLevelAdjuster
          content="Introduce key concepts and vocabulary"
          level="basic"
          language="zh"
        />
      );

      expect(screen.getByText('学习重要的商业词汇和概念')).toBeInTheDocument();
    });

    it('adapts "Teacher-led practice activities" for intermediate level in Chinese', () => {
      render(
        <ReadingLevelAdjuster
          content="Teacher-led practice activities"
          level="intermediate"
          language="zh"
        />
      );

      expect(screen.getByText('教师指导的练习活动')).toBeInTheDocument();
    });

    it('adapts "Check for understanding" for advanced level in Chinese', () => {
      render(
        <ReadingLevelAdjuster
          content="Check for understanding"
          level="advanced"
          language="zh"
        />
      );

      expect(screen.getByText('认知同化和理解水平的形成性评估')).toBeInTheDocument();
    });
  });

  describe('General simplification rules', () => {
    it('simplifies vocabulary for basic level', () => {
      render(
        <ReadingLevelAdjuster
          content="We will utilize this method to facilitate learning"
          level="basic"
          language="en"
        />
      );

      expect(screen.getByText('We will use this method to help learning')).toBeInTheDocument();
    });

    it('enhances vocabulary for advanced level', () => {
      render(
        <ReadingLevelAdjuster
          content="We will use this method to help learning"
          level="advanced"
          language="en"
        />
      );

      expect(screen.getByText('We will utilize this methodology to facilitate learning')).toBeInTheDocument();
    });

    it('keeps intermediate level unchanged for non-predefined content', () => {
      const content = "This is a regular sentence";
      render(
        <ReadingLevelAdjuster
          content={content}
          level="intermediate"
          language="en"
        />
      );

      expect(screen.getByText(content)).toBeInTheDocument();
    });

    it('simplifies multiple words in basic level', () => {
      render(
        <ReadingLevelAdjuster
          content="We will demonstrate and implement a comprehensive methodology"
          level="basic"
          language="en"
        />
      );

      expect(screen.getByText('We will show and do a complete method')).toBeInTheDocument();
    });

    it('replaces "analyze" with "look at" for basic level', () => {
      render(
        <ReadingLevelAdjuster
          content="Let us analyze this problem"
          level="basic"
          language="en"
        />
      );

      expect(screen.getByText('Let us look at this problem')).toBeInTheDocument();
    });

    it('replaces "subsequently" with "next" for basic level', () => {
      render(
        <ReadingLevelAdjuster
          content="We will subsequently learn more"
          level="basic"
          language="en"
        />
      );

      expect(screen.getByText('We will next learn more')).toBeInTheDocument();
    });
  });

  describe('Language attributes', () => {
    it('sets correct lang attribute for English', () => {
      const { container } = render(
        <ReadingLevelAdjuster
          content="Test content"
          level="intermediate"
          language="en"
        />
      );

      const span = container.querySelector('span');
      expect(span).toHaveAttribute('lang', 'en');
    });

    it('sets correct lang attribute for Chinese', () => {
      const { container } = render(
        <ReadingLevelAdjuster
          content="Test content"
          level="intermediate"
          language="zh"
        />
      );

      const span = container.querySelector('span');
      expect(span).toHaveAttribute('lang', 'zh-CN');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <ReadingLevelAdjuster
          content="Test content"
          level="intermediate"
          language="en"
          className="custom-class"
        />
      );

      const span = container.querySelector('.custom-class');
      expect(span).toBeInTheDocument();
      expect(span).toHaveTextContent('Test content');
    });
  });

  describe('Edge cases', () => {
    it('handles empty strings', () => {
      render(
        <ReadingLevelAdjuster
          content=""
          level="intermediate"
          language="en"
        />
      );

      const span = screen.getByText('', { selector: 'span' });
      expect(span).toBeInTheDocument();
    });

    it('handles content with no replaceable words', () => {
      const content = "This has no special words";
      render(
        <ReadingLevelAdjuster
          content={content}
          level="basic"
          language="en"
        />
      );

      expect(screen.getByText(content)).toBeInTheDocument();
    });
  });
});
