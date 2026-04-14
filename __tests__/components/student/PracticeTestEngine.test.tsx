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

  const navigateToAssessment = async () => {
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.getByText(UNIT1_CONFIG.phaseContent.introduction)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.getByText(UNIT1_CONFIG.phaseContent.guidedPractice)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.getByText(UNIT1_CONFIG.phaseContent.independentPractice)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Start Test'));
    await waitFor(() => {
      expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
    });
  };

  it('shows explanation after answering a question and does not immediately advance', async () => {
    render(<PracticeTestEngine unitConfig={UNIT1_CONFIG} />);
    await navigateToAssessment();
    const allButtonsBeforeAnswer = screen.getAllByRole('button');
    const answerButtons = allButtonsBeforeAnswer.filter(btn => 
      !['Next', 'Back', 'Start Test', 'Continue', 'Select All', 'Clear All'].includes(btn.textContent || '')
    );
    expect(answerButtons.length).toBeGreaterThan(0);
    fireEvent.click(answerButtons[0]);
    await waitFor(() => {
      const feedbackEl = screen.getByText(/Correct!|Incorrect/);
      expect(feedbackEl).toBeInTheDocument();
    }, { timeout: 3000 });
    const continueBtn = screen.getByText('Continue');
    expect(continueBtn).toBeInTheDocument();
  });

  it('shows Continue button after answering', async () => {
    render(<PracticeTestEngine unitConfig={UNIT1_CONFIG} />);
    await navigateToAssessment();
    const allButtonsBeforeAnswer = screen.getAllByRole('button');
    const answerButton = allButtonsBeforeAnswer.find(btn => 
      !['Next', 'Back', 'Start Test', 'Continue', 'Select All', 'Clear All'].includes(btn.textContent || '')
    );
    fireEvent.click(answerButton!);
    await waitFor(() => {
      expect(screen.getByText('Continue')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('disables answer buttons after selection until Continue is clicked', async () => {
    render(<PracticeTestEngine unitConfig={UNIT1_CONFIG} />);
    await navigateToAssessment();
    const allButtonsBeforeAnswer = screen.getAllByRole('button');
    const answerButtons = allButtonsBeforeAnswer.filter(btn => 
      !['Next', 'Back', 'Start Test', 'Continue', 'Select All', 'Clear All'].includes(btn.textContent || '')
    );
    fireEvent.click(answerButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });
    const buttonsAfterAnswer = screen.getAllByRole('button');
    const postAnswerButtons = buttonsAfterAnswer.filter(btn => 
      !['Next', 'Back', 'Start Test', 'Continue', 'Select All', 'Clear All'].includes(btn.textContent || '')
    );
    postAnswerButtons.forEach(btn => {
      expect(btn).toBeDisabled();
    });
  });

  it('shows correct/incorrect indicator after answering', async () => {
    render(<PracticeTestEngine unitConfig={UNIT1_CONFIG} />);
    await navigateToAssessment();
    const allButtonsBeforeAnswer = screen.getAllByRole('button');
    const answerButtons = allButtonsBeforeAnswer.filter(btn => 
      !['Next', 'Back', 'Start Test', 'Continue', 'Select All', 'Clear All'].includes(btn.textContent || '')
    );
    fireEvent.click(answerButtons[0]);
    await waitFor(() => {
      const feedbackText = screen.getByText(/Correct!|Incorrect/);
      expect(feedbackText).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
