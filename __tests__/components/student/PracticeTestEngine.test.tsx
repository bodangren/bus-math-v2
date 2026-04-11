import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PracticeTestEngine from '@/components/student/PracticeTestEngine';
import { UNIT1_CONFIG } from '@/lib/practice-tests/question-banks';

describe('PracticeTestEngine', () => {
  it('renders the hook phase initially', () => {
    render(<PracticeTestEngine unitConfig={UNIT1_CONFIG} />);
    expect(screen.getByText(UNIT1_CONFIG.phaseContent.hook)).toBeInTheDocument();
  });

  it('navigates to introduction phase when Next is clicked', async () => {
    render(<PracticeTestEngine unitConfig={UNIT1_CONFIG} />);
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.getByText(UNIT1_CONFIG.phaseContent.introduction)).toBeInTheDocument();
    });
  });

  it('renders lesson filter checkboxes in introduction phase', async () => {
    render(<PracticeTestEngine unitConfig={UNIT1_CONFIG} />);
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      UNIT1_CONFIG.lessons.forEach((lesson) => {
        expect(screen.getByLabelText(lesson.title)).toBeInTheDocument();
      });
    });
  });

  it('renders question count input in introduction phase', async () => {
    render(<PracticeTestEngine unitConfig={UNIT1_CONFIG} />);
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.getByLabelText('Number of questions')).toBeInTheDocument();
    });
  });
});
